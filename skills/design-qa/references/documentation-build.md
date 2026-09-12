# Construcción de Documentación

Modo DOCUMENTACIÓN: construir la página de handoff de un componente siguiendo la estructura
canónica del archivo.

---

## Si ya existe documentación de ese componente

Buscarla siempre antes de empezar:

```javascript
const previas = [];
for (const page of figma.root.children)
  for (const c of page.children)
    if (/document/i.test(c.name) && new RegExp(componente, 'i').test(c.name))
      previas.push({ page: page.name, id: c.id, nombre: c.name });
```

**No construir encima de ella, no extenderla, no mezclarla.** Una documentación hecha con menos
detalle contamina lo que se le agregue: hereda su estructura, sus omisiones y su criterio. Se
construye una nueva completa, en la página propia del componente.

Qué hacer con la vieja **lo decide el usuario** — no se borra ni se modifica por cuenta propia.
Se mueve a la misma página, queda al lado de la nueva y se le presenta la comparación.

**Advertir siempre si la vieja tiene instancias vivas del componente.** Si el componente se
corrigió, esas instancias ya se actualizaron solas y ahora muestran el componente nuevo con las
anotaciones viejas al lado. Una documentación que se contradice a sí misma engaña más que una
ausente, y no se nota mirándola por encima — hay que contar las instancias.
→ `references/component-audit-checklist.md`, punto 11

---

## Antes de construir

1. **Buscar la página de referencia.** Casi siempre existe una documentación previa que define
   la estructura (`Example Documentation` u otra). Leerla entera y mapear su patrón antes de
   escribir nada. La estructura la manda el archivo, no el criterio propio.
2. **Leer el componente objetivo completo** — todas las variantes, todos los estados, con
   `references/anti-hallucination.md`. Ningún valor estimado.
3. **Auditar antes de documentar** → `references/component-audit-checklist.md`. Documentar un
   componente roto deja la inconsistencia congelada en el handoff.
4. **Proponer la estructura y esperar OK.** Construir una página de documentación es una
   escritura grande en el archivo del usuario.

---

## Estructura canónica

Bloque que se repite por cada parte documentada:

| # | Pieza | Componente |
|---|-------|------------|
| 1 | Encabezado | `_Design system header` `Type=Sub` |
| 2 | Sección de apertura | `Section` `layout=Hero` |
| 3 | Sección numerada | `Section` `layout=Hero` con tagline `1 · ANATOMÍA`, `2 · …` |
| 4 | Panel de componente | frame 800 · `#F6F7F9` · radius 16 · autolayout centrado |
| 5 | Panel de anotación | frame 1280 · `#F6F7F9` · radius 16 · `layoutMode NONE` · `clipsContent false` |
| 6 | Panel de estados | frame 1280 · grilla variantes × estados con una nota por celda |
| 7 | Observaciones | `Section` `layout=Cards` |
| 8 | Cierre | `Divider Container` + `Unlock Lyse Beta` |

**Adaptar el eje al componente.** Si la referencia documenta un bloque compuesto de tres piezas
(`1 · Encabezado`, `2 · Campo`, `3 · Reenvío`), un component set no se fuerza a ese molde: el
eje natural pasa a ser `1 · ANATOMÍA`, `2 · VARIANTES`, `3 · ESTADOS`. Se conserva el patrón
visual, se cambia el criterio de división.

**Secciones que conviene agregar** cuando aplican:
- `Correcciones aplicadas` — si el componente se modificó antes de documentar. Las instancias
  existentes heredan los cambios y el equipo necesita saberlo.
- `Observaciones del handoff` — lo que queda pendiente y de quién es la decisión.

---

## Dónde va la documentación

**Cada componente documentado va en su propia página. Nunca en la página del kit.**

El kit de anotación es la herramienta; la documentación es el entregable. Mezclarlos en una
página escala mal a partir del segundo documento y ensucia la navegación del archivo.

Convención heredada de Lyse (la librería base), que se respeta salvo indicación contraria:

```
✼ FOUNDATIONS
  ↳ Colors, ↳ Typography, ↳ Spacing, ↳ Radius, ↳ Annotations
---
✼ COMPONENTS
  ↳ Avatar, ↳ Badge, ↳ Button, ↳ Input, ↳ Dropdown…
---
✼ COMPONENTS INCOMING
  ↳ Breadcrumbs, ↳ Charts
```

- Página por componente con prefijo `↳ ` — `↳ Button`
- Separadores `---` y encabezados de grupo `✼ NOMBRE` (páginas vacías)
- El kit de anotación vive en `↳ Annotations`
- Dentro de la página del componente conviven el component set y su documentación

```javascript
await figma.loadAllPagesAsync();
const nombre = '↳ ' + componente;
let page = figma.root.children.find(p => p.name === nombre);
if (!page) {
  // reutilizar una página vacía sin usar antes de crear una nueva
  page = figma.root.children.find(p => p.children.length === 0 && /^Page \d+$/.test(p.name));
  if (page) page.name = nombre;
  else { page = figma.createPage(); page.name = nombre; }
}
```

**Nunca crear una página si ya existe una con ese nombre.** Reutilizar páginas vacías
autogeneradas (`Page 2`, `Page 3`) antes de sumar una nueva.

Mover un nodo entre páginas es `nuevaPagina.appendChild(nodo)` — conserva instancias y
referencias.

---

## Contenedor

```javascript
const doc = figma.createFrame();
doc.name = '<Componente> — Documentación';
doc.layoutMode = 'VERTICAL';
doc.primaryAxisSizingMode = 'AUTO';
doc.counterAxisSizingMode = 'AUTO';
doc.counterAxisAlignItems = 'MIN';
doc.paddingTop = doc.paddingBottom = doc.paddingLeft = doc.paddingRight = 40;
doc.itemSpacing = 40;
doc.fills = [{ type:'SOLID', color: rgb('#FAFAFA') }];
page.appendChild(doc);
doc.x = ...; doc.y = ...;   // posicionar DESPUÉS de appendChild
```

**Ubicación:** en la página propia del componente (ver arriba). Si esa página ya tiene
contenido, calcular el espacio libre leyendo la posición y el tamaño de los hermanos antes de
elegir `x`/`y` — nunca encimar.

**Idempotencia:** borrar la versión previa antes de reconstruir, para no acumular duplicados.

```javascript
const prev = page.children.find(c => c.name === '<Componente> — Documentación');
if (prev) prev.remove();
```

Los paneles hijos necesitan `layoutSizingHorizontal = 'FIXED'` y `layoutSizingVertical = 'FIXED'`
después de `appendChild`, o el autolayout del contenedor los estira.

---

## Qué se documenta y qué no

**Solo lo visible.** Las capas y los estados con `visible: false` **no se documentan**: ni en
anatomía, ni en la tabla de specs, ni en la grilla de estados. Documentar algo oculto hace que
dev construya lo que no está en pantalla.

```javascript
const ocultos = frame.findAll(n => n.visible === false).map(n => n.name);
```

Si aparecen capas ocultas, **preguntar antes de decidir**: pueden ser opcionales legítimas que
el usuario quiere exponer, o restos que no van. La respuesta cambia el documento.

Lo que sí corresponde es dejarlas en **Observaciones**, no en la spec — sobre todo si su
existencia implica un problema (que al activarlas se rompa el layout, por ejemplo). Ahí el
lector es quien mantiene el componente, no quien lo construye.

---

## Despiece

La anatomía muestra el componente entero con punteros de zona, pero deja los espaciados
internos como texto en las notas. **El despiece los mide.** Un panel por bloque, con el bloque
clonado a escala 1:1 y cada distancia interna cotada.

Va después de ANATOMÍA y antes de los estados. Un panel por bloque con estructura propia —
no vale desglosar un bloque que es un solo elemento.

**Qué se cota:** padding del bloque, gap entre hijos, y separación entre elementos apilados.
Leerlos del nodo (`paddingTop`, `itemSpacing`), nunca del render.

### Qué componente usar para cada cota

| Situación | Componente |
|-----------|------------|
| Valor en la escala **y ≥ 16px** | `Handoff — Spacing` |
| Valor fuera de la escala (10, 12, 26…) | `Handoff — Element Measure` |
| Valor en escala pero **< 16px** (4, 8) | `Handoff — Element Measure` |

La escala de `Spacing` es `4 · 8 · 16 · 24 · 32 · 40 · 48 · 56 · 64 · 72 · 80`. Por debajo de
16px el bloque de `Spacing` **es más chico que su propia etiqueta** y se lee como una marca
suelta; `Element Measure` dibuja línea de cota con remates y etiqueta legible a cualquier
tamaño.

### La posición de la cota se deriva del nodo, no se calcula a mano

Una cota mal ubicada **miente igual que un valor inventado**: dice 12px apoyada sobre el borde
del texto en vez de sobre la separación, y quien la lee mide otra cosa. Es el mismo error que
`anti-hallucination.md` prohíbe para los valores, aplicado a la geometría.

**Usar `absoluteBoundingBox`, no coordenadas relativas.** Encadenar offsets de padres es donde
aparecen los errores; el bounding box absoluto no requiere razonar ningún offset.

```javascript
const abs = n => { const b = n.absoluteBoundingBox;
  return { x:b.x, y:b.y, w:b.width, h:b.height }; };

function gapAbs(a, b, eje){
  const A = abs(a), B = abs(b);
  const finA = eje === 'y' ? A.y + A.h : A.x + A.w;
  const iniB = eje === 'y' ? B.y : B.x;
  return { desde: finA, hasta: iniB, valor: iniB - finA };
}
const g = gapAbs(hijos[0], hijos[1], 'x');
const P = abs(panel);
cota.x = g.desde - P.x;                        // a coordenadas del panel
cota.resize(g.valor, cota.height);             // el tramo ES la medida
```

**Nunca sumar el padding del padre a la posición de un hijo.** En un frame con autolayout,
`child.x` **ya incluye** el padding: sumarlo otra vez desplaza la cota exactamente el valor del
padding. Este error es difícil de ver porque a veces se cancela solo —cuando lo que se mide son
nietos dentro de un frame que ya está desplazado por ese mismo padding— y entonces una
verificación con la misma fórmula equivocada lo da por bueno.

### Barrido de verificación

No alcanza con comparar cada cota contra el tramo que uno *cree* que mide. Enumerar **todos**
los tramos entre hermanos visibles del bloque y comprobar que cada cota coincida con alguno:

```javascript
function tramos(bloque, panelAbs){
  const out = [], walk = n => {
    const hijos = (n.children || []).filter(c => c.visible && c.absoluteBoundingBox);
    for (let i = 0; i < hijos.length - 1; i++){
      const A = abs(hijos[i]), B = abs(hijos[i+1]);
      const gx = B.x - (A.x + A.w), gy = B.y - (A.y + A.h);
      if (gx > 0.4) out.push({ eje:'x', desde: A.x + A.w - panelAbs.x, valor: gx });
      if (gy > 0.4) out.push({ eje:'y', desde: A.y + A.h - panelAbs.y, valor: gy });
    }
    hijos.forEach(walk);
  };
  walk(bloque); return out;
}
```

Una cota que no coincide con ningún tramo real está mal puesta. El barrido además dice **dónde
debería ir**, buscando el tramo del mismo valor más cercano.

Un desfase de 16px no se ve en el screenshot: la cota parece bien puesta porque cae cerca del
elemento. Solo aparece comparando números contra el nodo.

---

### La línea de extensión tiene que atravesar el componente

`Handoff — Element Measure` trae un hijo `Dashed line` que es la línea de extensión, y **su
largo lo controla la dimensión secundaria de la instancia**:

| Variante | La medida es | La extensión la da |
|----------|--------------|--------------------|
| `Vertical=False` | el **ancho** | el **alto** de la instancia |
| `Vertical=True` | el **alto** | el **ancho** de la instancia |

Posicionar la instancia de modo que esa línea **cruce el elemento medido**, con la etiqueta
cayendo por fuera. Una cota apoyada debajo del componente, con la extensión colgando en el
aire, obliga a adivinar qué mide.

```javascript
// gap horizontal dentro de una card que va de y=130 a y=202
m.y = card.y - 12;              // arranca arriba del borde superior
m.resize(m.width, 118);         // largo suficiente para cruzarla y dejar la etiqueta abajo
```

Verificar después dónde cayó la etiqueta: `instancia.x + hijo('Size').x + ancho`. **Si invade
la columna de notas, acortar la extensión**, no mover la columna.

### Layout

- **Alinear las cotas del mismo tipo en una fila o columna común.** Dos gaps horizontales a
  alturas distintas se leen como marcas al azar; a la misma altura se leen como un set.
- Las de padding van junto al borde que miden, por fuera del bloque.
- No escalar el bloque para que las cotas entren: introduce ambigüedad sobre si el número es
  real o de la vista. Si no entran, agrandar el panel.

### Lo que el despiece suele destapar

Medir obliga a leer cada `itemSpacing`, y ahí aparecen **gaps declarados que no se aplican**:
frames con un solo hijo visible cuyo gap no hace nada, y wrappers del mismo ancho que su único
hijo. Son capas de más y van a Observaciones.

---

## Código de color de las notas

No todas las notas dicen lo mismo. Una spec y una advertencia sobre el propio documento no
pueden verse igual: en píldoras idénticas el lector las pesa igual y la advertencia se pierde.

`Handoff — Note` es un COMPONENT simple —contenedor con fill al 10% y un `Label` sólido del
mismo color—, así que **se recolorea por override de instancia**, sin tocar el componente ni
cambiar su tamaño.

| Color | Tipo de nota | Ejemplo |
|-------|--------------|---------|
| `#EA4335` (default del kit) | **Spec** — lo que hay que construir | `B1 — Título · Poppins Regular 14/16` |
| `#1D4ED8` | **Meta** — sobre el documento, no sobre el componente | `La pieza mostrada es una copia, no una instancia…` |

```javascript
const c = rgb('#1D4ED8');
nota.fills = [{ type:'SOLID', color:c, opacity:0.10 }];   // conservar la opacidad original
nota.findOne(n => n.type === 'TEXT').fills = [{ type:'SOLID', color:c }];
```

Nombrar las meta con otro prefijo (`LM —` en vez de `L —`) para poder filtrarlas después.

**No usar ámbar**: a simple vista se confunde con el rojo del kit. **No usar `Handoff — Marker`**
para esto — es el círculo con una letra (`Letter`, 10×14) que usan las flechas como puntero, no
admite texto libre. **No usar `_Tip`** en las notas de panel: es un bloque de 400×172 pensado
para las cards, y rompe el ritmo de las notas de una línea.

**Verificar el contraste del color elegido** contra la píldora resultante, no contra el fondo
del panel. Con el fill al 10% sobre `#F6F7F9`: el azul `#1D4ED8` da `5.37:1` y pasa; el rojo
`#EA4335` del kit da `3.22:1` y **no llega al mínimo de 4.5:1**. Es un defecto del kit que
afecta a todas las notas — se reporta, no se parchea instancia por instancia.

---

## Cotas de íconos

**Todo ícono visible lleva su tamaño marcado con `Handoff — Spacing`**, en los dos ejes, para
que desarrollo tenga una cota verificable y no tenga que inspeccionar el nodo.

| Variante | Natural | Qué mide |
|----------|---------|----------|
| `Vertical=False` | 100×24 | el **ancho** — redimensionar el ancho al valor |
| `Vertical=True` | 24×100 | el **alto** — redimensionar el alto al valor |

```javascript
const w = SPC.children.find(c => c.name === 'Vertical=False, Side text=True, Size=24px').createInstance();
w.resize(24, w.height);          // ancho = la medida
const h = SPC.children.find(c => c.name === 'Vertical=True, Side text=True, Size=24px').createInstance();
h.resize(h.width, 24);           // alto = la medida
```

La escala de `Size` es `4 · 8 · 16 · 24 · 32 · 40 · 48 · 56 · 64 · 72 · 80`. **Para un valor
fuera de esa escala usar `Handoff — Element Measure`** con el texto correspondiente.

**Ubicarlas fuera del componente, alineadas al eje que miden.** Si el ícono está dentro de una
tarjeta, la cota no puede quedar encima: se corre afuera del contenedor manteniendo la
alineación —la de ancho debajo, con el mismo rango en x; la de alto a un lado, con el mismo
rango en y.

A tamaños chicos (16–24px) las dos variantes se ven como cuadrados y la orientación se vuelve
ambigua a simple vista. **No diagnosticar la orientación por screenshot**: confirmarla por las
dimensiones naturales de la variante.

---

## Reglas de layout de anotaciones

**La regla que manda: los elementos no se solapan entre sí.**

- Una línea guía que **cruza** una cota está bien. Cruzar no es solapar.
- Lo que no se acepta es que un elemento **oculte** a otro: un marcador encima de una cota, una
  nota sobre otra nota, una etiqueta sobre el componente.
- Si un marcador cae sobre una medida, correr la medida — hay espacio de sobra en el panel.

**Apuntar a lo que se nombra.** Si la nota dice "B — Label", la punta de la flecha va sobre el
label, no sobre el borde del contenedor. Calcular la posición real:

```javascript
const labelMidY = btn.y + paddingTop + lineHeight / 2;
```

Dos marcadores que terminan en el mismo borde no documentan nada: nombran lo mismo dos veces.

**Elegir el lado del número según el espacio libre.** Antes de fijar `Side` o `Side text`,
calcular dónde cae el texto en coordenadas absolutas y comprobar que no aterrice sobre el
componente. → `references/components.md`, sección `Handoff — Spacing`.

**Ajustar las cotas al tramo real.** `Element Measure` y `Spacing` son redimensionables: el
ancho de la instancia debe ser el valor que se está midiendo.

---

## Grilla de estados

Una celda por combinación variante × estado, con su nota encima.

```javascript
const colX = [110, 510, 910];        // una columna por variante
const rowY = i => 140 + i * 140;     // una fila por estado
```

- Fila de encabezado con el nombre de cada variante.
- Nota por celda con el nombre del estado.
- Notas de detalle al pie del panel para lo que no se ve en la miniatura (mecanismo del foco,
  del disabled, del loading).
- Alto del panel: `última fila + alto de celda + espacio para las notas al pie`.

---

## Tabla de specs

Una grilla de estados muestra **cómo se ve** cada combinación, pero no dice **de qué está
hecha**. Sin una tabla de valores, el dev tiene que abrir Figma y cuentagotear — que es
justamente lo que el handoff existe para evitar. Va como sección propia, después de ESTADOS.

**Tabular solo lo que varía.** Lo que es idéntico en todas las combinaciones (tipografía,
padding, radio, alto, gap) va una vez en ANATOMÍA y se enuncia arriba de la tabla como línea de
invariantes. Repetirlo en cada fila es ruido que tapa la señal — y que la tipografía no cambie
con el estado es en sí una regla del componente.

Columnas que suelen variar: **fondo · borde (color + grosor + alineación) · texto · opacidad ·
extras**. Una fila por combinación.

- **Swatch + hex en cada celda de color.** El cuadrito de 12px hace la tabla escaneable.
- **Zebra** en las filas y un borde superior al empezar cada grupo de variante.
- La columna de token es opcional y es decisión del usuario: deja en evidencia la cobertura
  real. Si se omite, **los hallazgos de token no se pierden — se mueven a Observaciones.**

No hay componente de tabla en el kit (`Handoff — Text` es un bloque de anotación, `Area`
resalta regiones, `Code` son marcadores). Se construye nativa: frame con autolayout vertical,
filas con autolayout horizontal, celdas de ancho fijo que sumen el ancho interior.

Tabular obliga a poner los valores en columnas y comparar, y ahí aparecen cosas que ninguna
lectura suelta muestra: en esta sesión reveló un hex en crudo que **ya tenía token** y solo le
faltaba el vínculo.

---

## Verificación de cierre

**0. Chequeo de solapamientos, por código.** El ojo no los detecta: 3px de invasión se ven
bien en el screenshot. La regla es que las líneas pueden cruzar y los elementos no pueden
taparse, así que el chequeo evalúa **la etiqueta** de cada cota, no su línea de extensión.

```javascript
function caja(n){
  if (/^[MS]-/.test(n.name)) {                       // cota: lo que no puede solaparse es la etiqueta
    const sz = n.children && n.children.find(c => c.name === 'Size');
    if (sz) return { x:n.x+sz.x, y:n.y+sz.y, width:sz.width, height:sz.height };
  }
  return { x:n.x, y:n.y, width:n.width, height:n.height };
}
const solapan = (a,b) =>
  !(a.x+a.width<=b.x || b.x+b.width<=a.x || a.y+a.height<=b.y || b.y+b.height<=a.y);
// excluir las flechas (`K-`): su línea guía cruza por diseño
```

Correr sobre cada panel al cerrar. Si algo choca: **mover la cota, no la columna de notas.**

1. Screenshot del contenedor completo → estructura, orden, espaciados.
2. Screenshot de cada panel de anotación por separado → **solapamientos, textos recortados,
   flechas que apuntan a lo que no corresponde**. En el screenshot completo estos errores no se
   ven; a escala de panel sí.
3. Revisar que ningún texto haya quedado con el contenido default del componente. Es el error
   más común y el más difícil de ver: el texto existe, se lee bien, y habla de otro componente.
