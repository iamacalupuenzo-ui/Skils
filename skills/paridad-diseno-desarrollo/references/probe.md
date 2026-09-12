# La sonda — extracción de estilos computados

Script que corre en el contexto de la página vía `browser_evaluate`. Es el corazón del skill:
sin él no hay evidencia, y con él mal escrito la evidencia miente.

---

## Qué resuelve

En pantalla, un token bien aplicado y un valor hardcodeado idéntico **se ven exactamente igual**.
La única forma de distinguirlos es comparar el valor **declarado** en el CSSOM (donde el `var()`
sigue intacto) contra el valor **computado** (donde ya se resolvió).

```
declarado: var(--space-3)   computado: 12px   → TOKEN
declarado: 12px             computado: 12px   → HARDCODED_MATCHES_TOKEN
declarado: 13px             computado: 13px   → HARDCODED_OFF_SCALE
```

---

## Las nueve trampas (verificadas en corridas reales, 2026-08-03 y 2026-08-07)

### T1 — El CSSOM no expande shorthands que contienen `var()`

La más peligrosa, porque **está sesgada en la dirección equivocada**.

```css
.btn--token { padding: var(--space-3) var(--space-4); }  /* usa el token BIEN */
.btn--fake  { padding: 12px 16px; }                      /* hardcodeado */
```

```js
ruleToken.style.getPropertyValue('padding-top')  // → ''      ← vacío
ruleFake.style.getPropertyValue('padding-top')   // → '12px'  ← expandido
```

El navegador expande el shorthand a longhands **solo si no hay `var()` adentro**. Con `var()`
la declaración queda guardada como shorthand sin resolver.

Consecuencia si no se maneja: el skill reporta "dev no usó el token" **exactamente en los casos
donde dev sí lo usó**. Es el peor falso positivo posible para este dominio — destruye la
confianza del equipo de desarrollo en el reporte.

Fix: leer también el shorthand y resolver la posición por orden de caja (1-4 valores).

### T2 — El mapa inverso valor→token se contamina con valores inválidos

Para saber si un valor hardcodeado "coincide con algún token" hay que normalizar cada token a
forma computada y comparar. Pero:

```js
probe.style.setProperty('color', '8px');   // el CSSOM RECHAZA la asignación
getComputedStyle(probe).color              // → devuelve el color HEREDADO, no vacío
```

Sin filtro, `color: white` termina listando `--space-3` y `--radius-md` como tokens coincidentes.

Fix: después del `setProperty`, verificar que `probe.style.getPropertyValue(prop)` **no quedó
vacío**. Si quedó vacío, el valor es inválido para esa propiedad y se descarta.

### T3 — Los anchos de borde necesitan `border-style` para normalizar

`border-*-width` computa `0px` si `border-style` es `none`, sin importar el ancho declarado.
La sonda sin `border-style: solid` normaliza *todos* los anchos a `0px` y matchea con todo.

Fix doble:
- la sonda lleva `border-style: solid`
- **no reportar** `border-*-width` si el elemento computa `border-style: none` — un ancho de
  borde sin borde no es un hallazgo, es ruido

---

### T4 — El mapa de tokens se envenena con los de terceros

Verificado en producción (Angular + PrimeNG + Google Maps): la página declaraba **1.198 custom
properties**, de las cuales `--mat-*` (509), `--mdc-*` (366) y `--sys-*` (141) — **1.016, el 86%** —
las inyecta Angular Material. Ninguna es del design system.

Con esa cantidad, `HARDCODED_MATCHES_TOKEN` deja de significar algo: cualquier valor coincide con
*algún* token por azar. En el fixture, con 9 tokens propios, el veredicto era preciso; en producción
es ruido puro.

**Antes de construir el mapa inverso hay que acotar el set de tokens al del sistema.** Tres vías,
en orden de confiabilidad:

1. **Prefijo declarado por el usuario** — es lo que pide `codeSpec.tokens.tokenPrefix`. La mejor.
2. **Exclusión de vendors conocidos** — `--mat-`, `--mdc-`, `--sys-`, `--p-` (PrimeNG), `--tw-`.
3. **Por hoja de origen** — solo sirve si el proyecto no bundlea. **En Angular no sirve**: el build
   junta el CSS del sistema y el de las librerías en un único `styles-[hash].css`.

#### La lista de prefijos no alcanza: las librerías también usan nombres genéricos

Verificado el 2026-08-07, y contradice la vía 2 tal como estaba escrita: el tema de PrimeNG declara
`--surface-0…900`, `--gray-50…900`, `--blue-*`, `--green-*`, `--primary-*`, `--content-padding`,
`--border-radius`. **Ningún prefijo de vendor.** Un filtro por `--p-` los deja pasar a todos y el
skill cree que hay un design system de cientos de tokens donde hay catorce.

Lo que sí delata a una librería es la **forma del conjunto**, no el nombre de cada uno:

| Señal | Por qué |
|-------|---------|
| **Familias completas de escala** — `--blue-50` a `--blue-900`, y lo mismo en cyan, teal, indigo, pink, bluegray… | Un design system tiene la paleta *de su marca*, no once rampas de color genéricas |
| **Volumen** | 1198 propiedades no las escribe un equipo de producto |
| **Nombres de framework** — `--maskbg`, `--highlight-bg`, `--focus-ring`, `--surface-ground` | Vocabulario de la librería, no del producto |

Los propios se reconocen al revés: son pocos, tienen el vocabulario del producto (`--color-primary`,
`--text-muted`, `--bg-surface`) o llevan el nombre de una marca o un componente
(`--Plomo-platinum-600`, `--button-sm-sbold-font-size`).

**Cuando la proporción es así de desbalanceada, decirlo con el desglose y no emitir el veredicto de
coincidencia.** Y si quedan pocos y de origen dudoso, preguntar cuál es el prefijo del sistema antes
de comparar: es una pregunta de diez segundos que evita un reporte entero mal enfocado.

Si no se puede acotar, **decirlo y no emitir el veredicto `HARDCODED_MATCHES_TOKEN`**. Es preferible
reportar dos estados (usa token / no usa token) que tres con el tercero inventado.

### T5 — El ganador se verifica, no se asume

El cálculo de especificidad de la sonda es aproximado: no modela `!important`, `@layer`, `:where()`
ni el peso real de los selectores de host de Angular (`[_nghost-ng-c123]`).

Existe una comprobación que lo cierra: **si el valor declarado, una vez resuelto, no coincide con el
computado, el ganador está mal elegido.**

```
declarado rgb(248,113,113) → computado rgb(246,247,248)   ← contradicción
```

Ocurrió en la primera corrida real. Cuando pasa, **no reportar el valor declarado**: marcar la
propiedad como `GANADOR_INDETERMINADO` y decir que hay una regla con más peso que la sonda no
modela. Un valor declarado incorrecto en el reporte es peor que una celda vacía — manda a dev a
buscar una línea de CSS que no es la que manda.

La contradicción es esperable y **no es un error** cuando el valor declarado contiene `var()`,
porque ahí el computado es la resolución del token, no el texto declarado.

### T6 — El estado que ganó se nombra

Si la declaración ganadora viene de un selector de estado (`:disabled`, `:hover`, `:focus`,
`:active`), el reporte **tiene que decirlo**. Sin esa etiqueta, un botón deshabilitado se lee como
si su estilo base estuviera mal, y el hallazgo es falso.

#### El estado que *no* ganó también importa

Dos reglas para el mismo selector de estado con valores distintos no son un empate: gana una por
orden de carga, y la otra queda latente. Hoy no se ve; el día que cambie el orden de los bundles,
aparece sin que nadie haya tocado el componente.

Verificado el 2026-08-07: `.otp-digit:focus` estaba declarado **dos veces** —una con
`border-color: #E11D2E`, el rojo de error, y otra con `#1C1B1F`—. Ganaba la segunda, así que el
foco renderizaba bien y ninguna medición del render lo hubiera detectado. La regla latente pinta el
foco del color de los errores.

**Regla:** al recolectar las declaraciones de una propiedad, si hay **más de una** con el mismo
selector de estado y valores distintos, va como `Nota` — nunca como defecto, porque el render de
hoy es correcto. El texto nombra las dos y dice cuál gana.

```javascript
const enConflicto = dec.filter(d => /:(hover|focus|active|disabled)/.test(d.o));
if (new Set(enConflicto.map(d => d.v)).size > 1) → Nota de regla latente
```

Es lo mismo que hace valioso al caso 3 de la matriz: un defecto que hoy no se ve y mañana sale caro.

---

### T7 — Lo que no está en `PROPS` no existe

La lista de propiedades es el punto ciego del skill: **una propiedad que no se mide es un hallazgo
que no puede aparecer.** No falla ruidosamente, falla en silencio, y el reporte se ve completo.

Caso real (2026-08-03): `text-transform` no estaba en la lista. Resultado:

```
textContent:      "¡Ya casi terminas!"     ← el copy es correcto
innerText:        "¡YA CASI TERMINAS!"     ← se renderiza en mayúsculas
text-transform:   uppercase                ← nadie lo miró
```

Una comparación de copy dice "coincide". La diferencia **solo existe en el estilo computado** —
justo la clase de cosa para la que existe este skill— y se perdió porque faltaba una línea en un
array.

Las que se olvidan siempre y hay que tener: `text-transform`, `text-decoration-line`, `font-style`,
`text-align`, `letter-spacing`, `opacity`.

**Regla operativa:** comparar `el.textContent` contra `el.innerText`. Si difieren, hay una
transformación de texto en juego y hay que reportarla — el copy puede estar bien y verse mal.

Antes de cerrar una inspección, revisar qué propiedades **especifica Figma para ese componente** y
confirmar que todas están en `PROPS`. Si Figma define `textCase` o `textDecoration` y la sonda no
los mide, el reporte miente por omisión.

---

### T8 — El ícono no se mide: se abre

Un ícono suele ser un `<img>` con un SVG adentro, y el CSSOM solo ve la caja. Eso confunde dos
hallazgos que **se ven idénticos en pantalla** y se corrigen en lugares distintos:

```
asset 24×48  renderizado 34×36   →  el archivo está bien, la pantalla lo deforma  → arreglo en CSS
asset 24×25  renderizado 24×25   →  el archivo está mal dibujado                  → arreglo en el SVG
```

Los dos casos verificados el 2026-08-07, uno en cada componente auditado. Sin abrir el archivo, el
segundo se reporta como *"la fila mide un píxel de más"* y manda a dev a buscar un margen que no
existe.

El `viewBox` es la medida a la que está dibujado, y los atributos `fill`/`stroke` dan el color —que
tampoco se lee del CSS cuando el ícono entra como `<img>`:

```javascript
const svg = await (await fetch(el.getAttribute('src'))).text();
const viewBox = (svg.match(/viewBox="[^"]+"/) || [])[0];
const colores = (svg.match(/(fill|stroke)="(?!none)[^"]+"/g) || []).slice(0, 4);
```

Comparar los tres: `viewBox`, rect renderizado y tamaño aprobado. Si no coinciden, decir **cuál**
falla. Es la diferencia entre un ticket para desarrollo y uno para quien exporta los assets.

---

### T9 — Una regla de estado que declara el valor vigente equivale a no tener regla

Existe un modo de fallo que **parece lo contrario de un problema**: hay una regla `:hover` o
`:focus`, se lee bien, tiene el color correcto del sistema… y no cambia nada, porque declara
exactamente el valor que el elemento ya tenía en reposo.

```css
.enlace          { color: #3C3DFF; text-decoration: none; }
.enlace:hover    { color: #3C3DFF; }        /* no cambia nada */
```

Verificado el 2026-08-07: el enlace de ayuda de un modal tenía esa regla. Al escanear el CSS quedó
anotado como *"hover presente, no documentado en el aprobado"* — y en realidad **pasar el cursor no
producía ningún cambio visible**. A dos pantallas de distancia, un enlace con el mismo rol sí
mantenía el color y agregaba subrayado. Lo detectó el usuario, no el skill.

Por qué se escapa: la comprobación intuitiva es *"¿existe una regla para el estado?"*, y la
respuesta es sí. La comprobación correcta es **comparar el valor declarado en el estado contra el
computado en reposo**:

```javascript
// para cada propiedad que la regla de estado declara
const enReposo = getComputedStyle(el).getPropertyValue(prop);
const enEstado = reglaEstado.style.getPropertyValue(prop);
if (normalizar(enEstado) === normalizar(enReposo)) → regla sin efecto
```

Si todas las propiedades que declara coinciden con el reposo, la regla **no tiene efecto** y hay que
reportarlo como tal: no es "el estado está implementado", es "el estado no existe y alguien creyó
que sí". Suele ser el resto de una intención a medias —se pensó cambiar color y subrayado, y quedó
solo el color—, así que conviene mirar qué propiedad falta, no solo que sobra una regla.

Y vale al revés que T6: ahí lo que importaba era **nombrar** el estado que ganó; acá, comprobar que
el que ganó **hace algo**.

---

## Especificidad, no orden de documento

El "ganador" de una propiedad no es la última declaración en orden de archivo, es la de mayor
especificidad. Con `.btn` y `.btn--token` (misma especificidad) el orden alcanza; con
`#app .btn` vs `.btn--token` no. La sonda calcula especificidad aproximada (ids×10000 +
clases×100 + elementos) y desempata por orden de documento.

**Límite conocido:** no modela `!important`, `@layer` ni `:where()`. Si el proyecto los usa
intensivamente, el ganador puede estar mal. Declararlo en el reporte, no esconderlo.

---

## Sonda completa

```js
(({ TARGETS, APPROVED_TOKEN_NAMES = [] }) => {
  const PROPS = [
    'background-color','color',
    'padding-top','padding-right','padding-bottom','padding-left',
    'border-top-left-radius','border-top-right-radius',
    'border-bottom-right-radius','border-bottom-left-radius',
    'border-top-width','border-top-color','border-top-style',
    'font-family','font-size','font-weight','line-height','letter-spacing',
    'text-transform','text-decoration-line','font-style','text-align',
    'gap','row-gap','column-gap','box-shadow','opacity'
  ];

  const SHORTHANDS = {
    'background-color': ['background'],
    'padding-top': ['padding'], 'padding-right': ['padding'],
    'padding-bottom': ['padding'], 'padding-left': ['padding'],
    'border-top-left-radius': ['border-radius'], 'border-top-right-radius': ['border-radius'],
    'border-bottom-right-radius': ['border-radius'], 'border-bottom-left-radius': ['border-radius'],
    'border-top-width': ['border-width','border-top','border'],
    'border-top-color': ['border-color','border-top','border'],
    'border-top-style': ['border-style','border-top','border'],
    'font-size': ['font'], 'line-height': ['font'],
    'font-weight': ['font'], 'font-family': ['font'],
    'row-gap': ['gap'], 'column-gap': ['gap']
  };

  const BOX_INDEX = {
    'padding-top':0,'padding-right':1,'padding-bottom':2,'padding-left':3,
    'border-top-left-radius':0,'border-top-right-radius':1,
    'border-bottom-right-radius':2,'border-bottom-left-radius':3,
    'row-gap':0,'column-gap':1
  };
  const BOX_FALLBACK = [[0,0,0,0],[0,1,0,1],[0,1,2,1],[0,1,2,3]];

  // divide "var(--a) var(--b)" respetando parentesis
  const splitTop = (v) => {
    const out=[]; let d=0,c='';
    for (const ch of v){
      if(ch==='(')d++; if(ch===')')d--;
      if(/\s/.test(ch)&&d===0){ if(c){out.push(c);c='';} continue; }
      c+=ch;
    }
    if(c)out.push(c); return out;
  };

  const specificity = (sel, el) => {
    let best=-1;
    for (const part of sel.split(',')){
      const s=part.trim();
      try { if(!el.matches(s)) continue; } catch { continue; }
      const ids=(s.match(/#[\w-]+/g)||[]).length;
      const cls=(s.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g)||[]).length;
      const els=(s.match(/(^|[\s>+~])[a-zA-Z][\w-]*/g)||[]).length+(s.match(/::[\w-]+/g)||[]).length;
      best=Math.max(best, ids*10000+cls*100+els);
    }
    return best;
  };

  // recolectar reglas (recursivo: @media, @supports, @layer)
  const flat=[]; const sheetErrors=[];
  const walk=(rules)=>{ for(const r of rules){ if(r.cssRules) walk(r.cssRules); if(r.selectorText) flat.push(r); } };
  for (const sheet of document.styleSheets){
    try { walk(sheet.cssRules); }
    catch(e){ sheetErrors.push({href:sheet.href, error:e.name}); }
  }

  // Entrada explícita: nombres de tokens propios aprobados para este proyecto.
  // No tratar todas las variables de terceros como tokens del design system.
  const tokenNames=new Set(APPROVED_TOKEN_NAMES);

  const out={ url:location.href, sheetErrors, tokenCount:tokenNames.size, elements:[] };

  for (const sel of TARGETS){
    const matches=[...document.querySelectorAll(sel)];
    if(!matches.length){ out.elements.push({selector:sel, error:'not found'}); continue; }
    for (const [instanceIndex, el] of matches.entries()) {
    const cs=getComputedStyle(el);
    const noBorder = cs.getPropertyValue('border-top-style').trim()==='none';

    // valor resuelto de cada token EN EL SCOPE del elemento (respeta theming / dark mode)
    const scope={};
    for (const name of tokenNames){ const v=cs.getPropertyValue(name).trim(); if(v) scope[name]=v; }

    const probe=document.createElement('div');
    probe.style.cssText='position:absolute;visibility:hidden;pointer-events:none;border-style:solid'; // T3
    el.appendChild(probe);
    const normalize=(prop,raw)=>{
      probe.style.removeProperty(prop);
      probe.style.setProperty(prop,raw);
      if(!probe.style.getPropertyValue(prop)) return null;   // T2
      return getComputedStyle(probe).getPropertyValue(prop).trim();
    };
    const reverse={};
    for (const [name,raw] of Object.entries(scope))
      for (const prop of PROPS){
        const n=normalize(prop,raw); if(n===null) continue;
        const k=prop+'|'+n; (reverse[k]=reverse[k]||[]).push(name);
      }
    probe.remove();

    const matching=flat
      .map((r,i)=>({r,i,spec:specificity(r.selectorText,el)}))
      .filter(x=>x.spec>=0)
      .sort((a,b)=>a.spec-b.spec||a.i-b.i);

    const props=PROPS.map(prop=>{
      const computed=cs.getPropertyValue(prop).trim();
      const declared=[];
      const pushFrom=(style,origin)=>{
        const direct=style.getPropertyValue(prop);
        if(direct){ declared.push({origin, value:direct.trim(), via:prop}); return; }
        for (const sh of (SHORTHANDS[prop]||[])){                       // T1
          const shv=style.getPropertyValue(sh); if(!shv) continue;
          let value=shv.trim();
          if (prop in BOX_INDEX && ['padding','border-radius','gap'].includes(sh)){
            const parts=splitTop(value);
            if(parts.length>=1&&parts.length<=4) value=parts[BOX_FALLBACK[parts.length-1][BOX_INDEX[prop]]];
          }
          declared.push({origin, value, via:sh}); return;
        }
      };
      for (const {r} of matching) pushFrom(r.style, r.selectorText);
      pushFrom(el.style,'[inline]');

      const winner=declared.length?declared[declared.length-1]:null;
      const usesVar=!!winner && /var\(\s*--/.test(winner.value);
      const varRef=usesVar?winner.value.match(/var\(\s*(--[\w-]+)/)[1]:null;
      const matchingTokens=reverse[prop+'|'+computed]||[];

      let verdict;
      if(!winner) verdict='NOT_DECLARED';
      else if(usesVar && tokenNames.has(varRef)) verdict='TOKEN';
      else if(usesVar) verdict='TOKEN_REFERENCE_UNVERIFIED';
      else if(matchingTokens.length) verdict='HARDCODED_MATCHES_TOKEN';
      else verdict='HARDCODED_OFF_SCALE';

      return { prop, computed,
               declaredValue:winner?winner.value:null,
               declaredBy:winner?winner.origin:null,
               viaShorthand:(winner&&winner.via!==prop)?winner.via:null,
               varRef, matchingTokens, verdict };
    }).filter(p=>{
      if (p.verdict==='NOT_DECLARED') return false;
      if (noBorder && p.prop.startsWith('border-') && p.prop.endsWith('-width')) return false; // T3
      return true;
    });

    out.elements.push({
      selector:sel, instanceIndex, tag:el.tagName.toLowerCase(), class:el.className,
      rect:el.getBoundingClientRect().toJSON(), props
    });
    }
  }
  return out;
})
```

---

## Acotar la salida en componentes grandes

Con varios elementos hijos o muchas propiedades, el objeto que devuelve la sonda puede superar lo
que una lectura directa del resultado permite sin truncarse. Antes de devolver: las propiedades
`NOT_DECLARED` ya se filtran (ver el `.filter` al final del bloque `elements`); si el volumen
sigue siendo alto, recortar además `declaredBy` a los primeros caracteres del selector y omitir
`matchingTokens` cuando esté vacío. El objetivo es que el resultado se pueda leer directo, sin
necesitar guardarlo a archivo y reprocesarlo con un script aparte — eso cuesta varias llamadas más
que acotar la sonda misma.

---

## Estados: hover, focus, disabled

**Medir solo el reposo deja la mitad del componente sin auditar.** Si el diseño documenta estados,
hay que provocarlos y medirlos: son parte del componente, no un extra.

Falla real (2026-08-03): la documentación tenía una sección entera de estados para un enlace y no
se contrastó. Al hacer hover, dev hacía **lo contrario de lo especificado**:

```
                reposo        hover
Figma:  color   #3C3DFF   →   #3C3DFF   (se mantiene)
        línea   ninguna   →   línea inferior
dev:    color   #4F46E5   →   #E11D2E   (cambia al rojo de error)
        línea   ninguna   →   ninguna
```

Un enlace de ayuda que se pone del color de los errores comunica riesgo donde no lo hay. Eso no se
ve en una captura estática ni se deduce del CSS en reposo.

**Regla:** antes de cerrar, listar los estados que el diseño documenta y confirmar que cada uno se
midió. Si el diseño no documenta un estado que dev sí implementa, es una `Nota` —comportamiento no
especificado—, no un defecto.

Las propiedades que delatan un hover mal hecho: `text-decoration-line`, `text-decoration-thickness`,
`text-underline-offset`, `color`, `background-color`, `border-*-color`, `box-shadow` y `cursor`.

Los otros estados requieren provocarlos antes de medir:

| Estado | Cómo | Nota |
|--------|------|------|
| `hover` | `browser_hover` sobre el elemento, después evaluar | Puede haber transición — esperar |
| `focus` | `browser_press_key` Tab, o `el.focus()` dentro del evaluate | El focus ring suele ser `outline`, agregarlo a PROPS |
| `disabled` | Buscar la instancia deshabilitada en la página | No forzar el atributo: cambia el estilo pero no prueba qué hace dev |
| `dark mode` | `browser_resize` con `colorScheme`, o togglear la clase del tema | El `scope` de tokens se recalcula solo — por eso se lee por elemento |

**Regla:** nunca mutar el DOM para forzar un estado y después reportarlo como hallazgo. Lo que
se mide tiene que ser lo que dev realmente renderiza.

---

## Cuando el proyecto no usa CSS custom properties

### `tokenCount > 0` no significa que haya tokens del sistema

El conteo mide custom properties, no tokens propios. Si el proyecto carga Bootstrap, Material o
PrimeNG, el contador se llena de variables ajenas y el skill cree que hay sistema donde no lo hay.

Verificado el 2026-08-07: `tokenCount` daba **37** — y eran 36 `--bs-*` de Bootstrap más una
`--percentage` de un anillo de progreso. **Cero del design system.** Con el chequeo escrito como
`tokenCount === 0` la condición no se dispara, y el skill habría emitido decenas de hallazgos de
"valor hardcodeado" contra un equipo que nunca tuvo tokens que usar.

**Lo que se cuenta son los tokens propios, y eso pasa por los prefijos:**

```javascript
const VENDOR = /^--(bs|mat|mdc|sys|p|tw|mui|chakra|ant)-/;
const propios = [...tokenNames].filter(n => !VENDOR.test(n));
// propios.length === 0  →  el eje de tokens está muerto, aunque tokenCount sea 37
```

Reportar siempre el desglose, no el total: *«37 custom properties, 36 de Bootstrap y 1 de un
componente: ninguna del sistema»*. Es lo que le permite a quien lee entender por qué el reporte no
habla de tokens. Y si quedan pocas propias y de prefijo dudoso, preguntar cuál es el prefijo del
sistema antes de emitir veredictos: `codeSpec.tokens.tokenPrefix` existe para eso.

### El caso genuino: no hay ninguna custom property

Si no hay tokens propios, el proyecto compila las variables (SCSS, Less) y en runtime no queda
rastro del token. En ese caso:

- `TOKEN` **nunca** se puede probar → todos los valores salen como hardcode
- El skill debe **decirlo una vez** y seguir con lo que sí puede: comparar valores contra Figma
- El veredicto útil pasa a ser `MATCHES_FIGMA` / `OFF_SPEC`, no el uso de token

Declararlo en la primera línea del reporte. No emitir 40 hallazgos de "hardcodeado" cuando la
causa es una sola decisión de build.
