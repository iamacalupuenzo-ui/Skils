# Construir la página de QA en Figma

Este skill **es dueño de un artefacto**: la página de QA de desarrollo. La construye entera, y no
sale de ahí.

---

## La regla de contención

`paridad-diseno-desarrollo` escribe **únicamente dentro de la página de QA que él mismo creó**.

Nunca:
- toca un `COMPONENT_SET` ni un `COMPONENT` del archivo
- edita, mueve o renombra un nodo de las páginas de diseño o documentación
- borra páginas que no creó

Los nodos del diseño se **clonan** hacia la página de QA, jamás se modifican en su lugar. Un clon
es una copia inerte; mover el original rompe el archivo de alguien más.

Esto es lo que hace seguro que este skill tenga `figma_execute`. El límite no es "tener cuidado":
es que el destino de toda escritura sea una página propia y verificable.

`documentacion-handoff` sigue siendo dueño del otro artefacto — la documentación del archivo de diseño, las
correcciones de componentes y el handoff. Este skill no lo invoca ni lo reemplaza.

---

## Paso 0 — Resolver el catálogo y verificar el tipo

Los IDs de nodo son por archivo y por sesión. Resolver **por nombre** al inicio, guardar los IDs
para esa sesión, y reusarlos con `getNodeByIdAsync`.

**Verificar el `type`, no asumirlo.** En un archivo real `Comment` resultó ser `COMPONENT_SET` y no
`COMPONENT`; una resolución que filtra por `'COMPONENT'` lo da por inexistente, y el patrón de
`clone()` habría clonado el set entero en vez de crear una instancia.

**Buscar solo definiciones, nunca instancias.** Las observaciones que este skill crea se llaman
`Comment` igual que el componente: una búsqueda por nombre sin filtrar **encuentra las instancias
que uno mismo dejó en corridas anteriores** y el catálogo queda envenenado con sus propios
artefactos. Verificado: `findOne('Comment')` devolvió una instancia de otra página de QA.

**Y filtrar por tipo tampoco alcanza: importa dónde vive.** `findOne` recorre el documento en orden
de páginas, y la de documentación suele ir primera. Verificado el 2026-08-07: `byName('Divider
Container', 'COMPONENT')` devolvió un `COMPONENT` legítimo… que vivía **dentro del frame de handoff
del componente auditado**, no en la página del kit. Instanciarlo no rompe nada, pero ata la página
de QA a un nodo del artefacto que está auditando: si mañana alguien reorganiza ese frame, la QA se
degrada por un motivo que nadie va a encontrar.

Preferir siempre la definición que vive en la página del kit — **que se descubre, no se nombra**
(ver abajo):

```javascript
const byName = (n, t) => (KIT && KIT.findOne(x => x.name === n && ES_DEF(x) && (!t || x.type === t)))
                      || figma.root.findOne(x => x.name === n && ES_DEF(x) && (!t || x.type === t));
```

Si el que aparece está fuera del kit, decirlo: o el kit está incompleto, o alguien dejó un
componente suelto donde no va.

### La página del kit se descubre; su nombre no es fijo

**Nada de rutas ni nombres literales.** `"Componentes Para Observaciones"` es como se llama en un
archivo; en el siguiente puede ser `"QA Kit"`, `"Anotaciones"` o vivir dentro de una sección. Un
nombre hardcodeado funciona hasta que el skill se usa en otro archivo, y ahí falla de la peor
manera: silenciosamente, cayendo al `findOne` global y agarrando cualquier cosa.

La página del kit es **la que concentra las definiciones**, y eso se mide:

```javascript
await figma.loadAllPagesAsync();
const ES_DEF = n => n.type === 'COMPONENT' || n.type === 'COMPONENT_SET';
const KIT = figma.root.children
  .map(p => ({ p, n: p.findAllWithCriteria({ types: ['COMPONENT', 'COMPONENT_SET'] }).length }))
  .sort((a, b) => b.n - a.n)[0].p;      // la que más definiciones tiene
```

Confirmarlo antes de usarlo: si la página elegida no contiene el `Marker` y el `Comment`, la
heurística falló y hay que decirlo en vez de seguir. Y si el archivo tiene **varias** páginas con
definiciones, nombrar la elegida en el reporte para que se pueda auditar la decisión.

### Inventariar el kit, no solo resolver los nombres que uno ya pensaba usar

Resolver una lista fija de componentes tiene un punto ciego: **solo encuentra lo que ya se pensaba
usar.** Lo que el archivo ofrece y el skill no pidió no aparece nunca, y la página de QA sale más
pobre que las herramientas disponibles.

Verificado el 2026-08-07: el archivo tenía `Handoff — Spacing`, `Handoff — Element Measure`,
`Handoff — Arrows`, `Handoff — Text`, `Handoff — Icons Measure` y `Handoff — Code`. La página de QA
se armó **sin usar ninguno**, con hallazgos que eran casi todos medidas —34×36 contra 24×48, margen
interno de 8px, 123×24 contra 156×36—, es decir, exactamente lo que esos componentes existen para
mostrar. El frame de handoff aprobado sí los usaba.

**Listar todas las definiciones del kit antes de decidir la composición**, y recién ahí elegir:

```javascript
KIT.findAllWithCriteria({ types: ['COMPONENT', 'COMPONENT_SET'] })
   .map(c => ({ name: c.name, type: c.type,
                variantes: c.type === 'COMPONENT_SET' ? c.children.map(v => v.name) : null }));
```

Correspondencia entre lo que se encontró y lo que se usa. **Los nombres son los de este archivo;
la columna que manda es la del propósito** — en otro archivo hay que buscar el equivalente:

| Propósito | Nombre en este archivo | Cuándo |
|-----------|------------------------|--------|
| Señalar un área con número y severidad | `Marker` | Siempre, uno por hallazgo |
| Explicar el hallazgo | `Comment` | Siempre, uno por hallazgo |
| Categoría del hallazgo | `Etiqueta Tipo` | Hijo del `Comment`, vía `swapComponent` |
| Leyenda de una línea al costado | `Handoff — Note` | Siempre, uno por hallazgo |
| Cotas de ancho / alto | `Handoff — Element Measure` | Hallazgo de **tamaño** |
| Cota de separación o margen interno | `Handoff — Spacing` | Hallazgo de **espaciado** — obligatoria si el marcador agrupa más de un tramo (ver abajo) |
| Flecha que conecta cota y elemento | `Handoff — Arrows` | Cuando la cota no cabe pegada |
| Specs tipográficos | `Handoff — Text` | Hallazgo de **tipografía** |
| Cota de ícono | `Handoff — Icons Measure` | Hallazgo sobre un ícono |
| Bloque de código | `Handoff — Code` | Cuando conviene mostrar la regla CSS ganadora |
| Encabezado / pie / secciones | `_Design system header`, `Unlock Lyse Beta`, `Section` | Estructura de la página |

**Las cuatro primeras filas son el núcleo y van siempre. Las cotas se ofrecen, no se aplican por
defecto**: llenan la captura y compiten con los marcadores, y la medida ya está en la leyenda y en
la observación. Se proponen cuando hay hallazgos de medida y se construyen solo con un sí explícito
→ «El núcleo se construye; lo demás se propone». Si el componente no está en el kit, **declarar el
faltante**; nunca dibujar una cota a mano.

### La excepción: un marcador que agrupa varios tramos necesita sus cotas

Lo anterior vale para un hallazgo de **un solo valor** —un ancho, un padding puntual—, donde el
número y la leyenda ya alcanzan para entenderlo. Pero un hallazgo de espaciado que compara **varios
tramos a la vez** bajo un solo marcador no se puede leer con una nota de una línea: *"40/56/56/40px
en vez de 16/32px"* no le dice a quien lee cuál valor corresponde a cuál tramo, y el área punteada
que cubre todo el bloque no distingue uno de otro.

Verificado el 2026-08-09: un hallazgo de espaciado entre cuatro bloques de un panel se documentó con
un único `Marker` sobre todo el contenedor y esa nota compacta. El usuario lo señaló como poco
entendible — no porque faltara partir el panel (B19/B20 de `figma-build.md`, disparado por
colisión de badges, no aplicaba acá), sino porque el marcador agrupaba tres tramos distintos sin
diferenciarlos. La corrección fue reemplazar el área única por **una `Handoff — Spacing` por
tramo**, cada una con su valor medido y su valor esperado, las tres bajo el mismo número de
hallazgo y el mismo `Comment` — es la misma desviación repetida en varios puntos, no hallazgos
distintos (no aplica B28, que es para elementos distintos).

**Regla:** si un hallazgo de espaciado va a anotarse con un área que abarca más de un tramo medible,
la cota deja de ser opcional — sin ella el hallazgo no comunica qué corregir. Preguntar por cotas
sigue aplicando para hallazgos de un solo valor; para este caso, construirlas directamente y
declarar por qué.

### Tercer paso — resolver lo que se va a usar

Con `KIT` y el inventario a la vista, recién ahora se resuelven los IDs de la corrida. Esta lista
es el **piso** —sin estos componentes no se puede construir nada—, no el techo: lo que el
inventario haya encontrado de más entra en juego según la tabla de arriba.

```javascript
// KIT y ES_DEF vienen de los dos pasos anteriores; byName busca primero en el kit
const R = {
  comment:  byName('Comment'),              // sin fijar tipo: puede ser COMPONENT o COMPONENT_SET
  marker:   byName('Marker', 'COMPONENT_SET'),
  etiqueta: byName('Etiqueta Tipo', 'COMPONENT_SET'),
  status:   byName('Annotation Status', 'COMPONENT_SET'),
  section:  byName('Section', 'COMPONENT_SET'),
  header:   byName('_Design system header', 'COMPONENT_SET'),
  note:     byName('Handoff — Note', 'COMPONENT'),
  measure:  byName('Handoff — Element Measure', 'COMPONENT_SET'),
  spacing:  byName('Handoff — Spacing', 'COMPONENT_SET'),
  arrows:   byName('Handoff — Arrows', 'COMPONENT_SET'),
  area:     byName('Handoff — Area', 'COMPONENT_SET'),
  divider:  byName('Divider Container', 'COMPONENT'),
  footer:   byName('Unlock Lyse Beta', 'COMPONENT')
};
// declarar lo que vuelva null ANTES de seguir; no improvisar reemplazos
return Object.fromEntries(Object.entries(R).map(([k, v]) =>
  [k, v ? { id: v.id, type: v.type, variantes: v.children ? v.children.map(c => c.name) : null } : null]));
```

### Crear instancias según el tipo

```javascript
// COMPONENT_SET → elegir la variante y createInstance()
const v = R.comment.children.find(c => c.name === 'Type=Problema menor');
const obs = v.createInstance();

// COMPONENT → createInstance() directo
const nota = R.note.createInstance();
```

`clone()` se reserva para **copiar un nodo de diseño** hacia la página de QA, no para instanciar
componentes del kit.

---

## Los dos componentes que sostienen el sistema

### `Marker` — el área numerada sobre la captura

| Propiedad | Tipo |
|-----------|------|
| `Number#23:0` | TEXT |
| `Type` | VARIANT: `Positivo` · `Problema menor` · `Problema mayor` · `Idea` · `Nota` |

**No es un badge: es un área punteada redimensionable.** Viene en 256×80 por defecto y hay que
darle el rect del elemento que señala, o tapa media pantalla.

El número se dibuja en un hijo `Serial Number` ubicado en **(0, −32)** local — es decir, 32px
**por encima** del área. Al posicionar se piensa en el área; el badge sigue solo.

```javascript
const m = variante.createInstance();
panel.appendChild(m);
m.resize(rect.w, rect.h);          // ← obligatorio, y con el rect EXACTO del elemento
m.x = OFFSET_X + rect.x;
m.y = OFFSET_Y + rect.y;
m.setProperties({ 'Number#23:0': '3' });
```

### El área va al ras del elemento. Siempre.

**Nunca agrandar un área para acomodar el badge.** Un área que no coincide con el elemento
misrepresenta qué se está señalando, y es exactamente el error que la verificación de B13 existe
para atrapar. Verificado: se inflaron cuatro áreas para separar badges y el usuario lo notó de
inmediato — *"antes las ponías al ras del componente, ¿por qué ahora más separadas?"*.

**El badge no se puede mover:** vive en un hijo `Serial Number` en `(0, −32)` y su `x` **no es
sobreescribible en una instancia** (`This property cannot be overridden in an instance`). Detachar
la instancia para moverlo rompe el vínculo con el componente: tampoco.

### Cómo se resuelven las colisiones de badges

Dos áreas que comparten esquina superior izquierda producen dos badges en el mismo punto. En orden
de preferencia:

1. **Anclar cada hallazgo a un sub-elemento distinto.** Casi siempre existe uno más preciso y más
   honesto:
   - "el estado del botón" → el **texto** del botón, que es donde el estado se lee
   - "cada celda mide mal" → **una** celda, no el campo entero; el ancho del campo va en el texto

   **Cuando el nodo no tiene hijos, todavía queda el texto.** Un `<p>` de ancho completo con dos
   hallazgos encima —uno de contenido y otro de cuerpo tipográfico— parece irreducible: no hay
   sub-elemento al que reanclar. Pero el texto renderizado sí tiene su propio rect, y se mide:

   ```javascript
   const rg = document.createRange();
   rg.selectNodeContents(el);
   const lineas = [...rg.getClientRects()];   // un rect por línea renderizada
   ```

   El hallazgo de **caja** se ancla al elemento; el de **tipografía o contenido** se ancla al rect
   del texto. Verificado el 2026-08-07: un destino de 500,4×24 y su texto de 149,8×21,6 separaron
   sus badges 175px, de 0. Y un título de dos líneas dejó el hallazgo de ancho sobre la caja
   (426×64) y el de color sobre la primera línea (335,9×34,4), a 45px.

   Es más honesto además de más cómodo: el color vive en el texto, no en la caja vacía que lo rodea.
2. **Ordenar el z por tamaño de área**, la más chica al final. Con un desfase diagonal de ~25px los
   dos números se leen, siempre que el chico quede encima.
3. **Fusionar los dos hallazgos** si comparten elemento *y* severidad. Si la severidad difiere, no
   se fusionan: el `Type` del `Comment` sería incorrecto para uno de los dos.
4. **Partir el panel en copias por tipo de desviación** — la escalada, cuando lo anterior no alcanza.

```javascript
marcadores.sort((a, b) => (b.width * b.height) - (a.width * a.height));
for (const m of marcadores) panel.appendChild(m);   // el más chico queda arriba
```

**Chequeo obligatorio antes de cerrar** — el badge mide 25×24:

```javascript
const dx = Math.abs(a.x - b.x), dy = Math.abs(a.y - b.y);
if (dx < 25 && dy < 24) → colisión: reanclar, no agrandar
```

---

## Partir el panel en copias por tipo de desviación

**Cuándo.** No siempre, y hay **dos** disparadores distintos — ninguno es la cantidad de hallazgos:

1. **Colisión de badges** que sobrevive al reanclaje (B19).
2. **Un marcador de región amplia mezclado con varios marcadores puntuales en la misma
   captura.** No hace falta que los badges colisionen: un área que cubre varios elementos a la
   vez —como los tramos de un hallazgo de espaciado— compite visualmente con los marcadores
   precisos de otros hallazgos aunque cada número caiga en su lugar. El indicador no es la
   posición del badge, es que **el lector tiene que separar mentalmente qué región pertenece a
   qué hallazgo** antes de poder leer cualquiera de los dos.

Con pocos hallazgos partir empeora la lectura — varias copias de la misma imagen para señalar una
cosa cada una, y scroll de más sin ganancia. Ambos disparadores asumen que ya hay un volumen real
de hallazgos en el panel (no dos o tres).

```
armar con un panel  →  ¿colisión tras reanclar, o región amplia + puntuales?  →  sí: partir
                                                                              →  no: dejar uno
```

**Por qué funciona.** El caso 1 son colisiones que sobreviven al reanclaje, casi siempre **un mismo
elemento con hallazgos de tipos distintos** —la tarjeta con su radio *y* su espaciado interno, la
etiqueta con su cuerpo *y* sus mayúsculas—. El caso 2 es una desviación que por naturaleza abarca
varios elementos a la vez —un hallazgo de espaciado con tres tramos, cada uno con su propia cota—
y necesita su propio panel para que esas cotas no compitan con el resto. Partir por tipo manda cada
uno a su copia **por construcción**: el problema desaparece en vez de negociarse.

Verificado el 2026-08-09: un hallazgo de espaciado con tres cotas (`Handoff — Spacing`, una por
tramo) convivía en el mismo panel con otros siete marcadores puntuales sobre elementos chicos
—chevrons, un enlace, un botón—. Ningún badge colisionaba, pero el usuario señaló que ya "tenía
demasiadas opciones" y no se entendía. La corrección fue mover el hallazgo de espaciado —sus tres
marcadores de área, su captura (mismo `imageHash`, sin nuevo fetch), su leyenda y su panel
comparativo de cotas— a un panel propio, `Panel «Desarrollo» · ESPACIADO`, dejando los siete
hallazgos puntuales en el panel principal. Mismo número (`1`) en los tres marcadores del panel
nuevo, misma leyenda, mismo `Comment` — es un solo hallazgo con tres cotas, no tres hallazgos.

Verificado sobre una pantalla con 14 hallazgos en 550×600: de dos colisiones quedó una, y las
copias ganaron lectura propia.

**Cómo.** Una copia por tipo, compartiendo el mismo `imageHash` (no hay transferencia nueva):

| Copia | Qué agrupa |
|-------|-----------|
| Geometría | tamaños, radios, bordes |
| Espaciado | tramos entre bloques y padding interno |
| Color | rellenos, textos, bordes por su color |
| Tipografía y contenido | cuerpos, pesos, transformaciones, copy y elementos faltantes |

Reglas que la hacen legible, sin las cuales queda peor que un panel único:

- **El rótulo dice el criterio** — `DESARROLLO · ESPACIADO`, nunca `DESARROLLO (2 de 4)`. Sin eso
  el lector no entiende por qué faltan marcadores.
- **Las leyendas viajan con su copia.** Cada panel lleva solo las de sus hallazgos.
- **La numeración sigue corrida** 1..N sobre todas las copias, y las observaciones de abajo quedan
  en **una sola lista**. Es lo que da continuidad entre paneles.
- **El panel de diseño aprobado no se parte**: es la referencia y va sin marcar.

**Nunca partir por número** (1-7 / 8-14): el lector no sabe qué está mirando y tiene que barrer
todas las copias para entender un elemento.

**Lo que no resuelve.** Dos hallazgos del **mismo tipo** sobre elementos adyacentes —dos textos
apilados a 16px— caen en la misma copia y siguen colisionando. Ahí manda el orden de z. Partir más
para separarlos sería partir por número disfrazado.

### `Comment` — la observación

| Propiedad | Tipo |
|-----------|------|
| `Number#23:8` | TEXT |
| `Heading#24:0` | TEXT |
| `Comment#23:5` | TEXT |
| `Type` | VARIANT: las **mismas cinco** que `Marker` |

Mide 516×175 y crece con el texto. La `Etiqueta Tipo` es un **nodo hijo**, no una propiedad: se
cambia siempre con `swapComponent`.

#### Una propiedad puede existir y no mostrarse en ninguna parte

`setProperties` devuelve sin error, la propiedad queda guardada y se puede volver a leer con su
valor intacto — y aun así **no aparece en la página**, porque el nodo que la consumía se borró u
ocultó dentro de la definición del componente. La propiedad queda huérfana.

Verificado el 2026-08-07: se escribieron 19 `Heading#24:0` y ninguno se vio. El frame `Heading`
de ese `Comment` contiene solo el número y el chip de severidad; los únicos textos de la instancia
son `Number`, el `Title` de la severidad, `Content` y el `Title` de la etiqueta. Las 19
observaciones se publicaron **sin título**, y la lectura de vuelta de la propiedad decía que
estaban bien.

**Comprobar el consumidor, no el valor.** Después de escribir una propiedad de texto, buscar en la
instancia un nodo visible que la muestre:

```javascript
const v = inst.componentProperties['Heading#24:0'].value;
const loMuestra = inst.findAll(n => n.type === 'TEXT' && n.visible)
                      .some(t => t.characters.includes(v.slice(0, 20)));
```

Si da `false`, el kit no renderiza esa propiedad y hay que **llevar el contenido al nodo que sí se
ve** — acá, la primera línea de `Content`, con la primera línea en el peso semibold de la fuente de
documentación para que lea como título:

```javascript
inst.setProperties({ 'Comment#23:5': heading + '\n\n' + cuerpo });
const t = inst.findAll(n => n.type === 'TEXT' && n.name === 'Content')[0];
t.setRangeFontName(0, t.characters.indexOf('\n'), { family: FN.family, style: 'Semibold' });
```

Lo que **no** se hace es arreglar el componente: vive en la página del kit y está fuera de la
página de QA (B2). Se adapta el contenido y se declara el defecto del kit.

```javascript
const e = obs.children.find(c => c.name === 'Etiqueta Tipo');
e.swapComponent(R.etiqueta.children.find(v => v.name.includes('Jerarquía Visual')));
```

Que `Marker` y `Comment` compartan las cinco variantes de `Type` **es el sistema**: la severidad se
lee igual sobre la captura y en la observación. Si una cambia, cambian las dos.

---

## La cadena de numeración

Un hallazgo aparece en **tres lugares** y el número los une:

```
marcador sobre la captura   →   leyenda al costado   →   observación al final
        Marker                   Handoff — Note              Comment
          3                            3                        03
```

**Los tres tienen que decir lo mismo.** Si una observación cambia de severidad, su marcador cambia
de variante. Si se elimina, se renumeran las tres. Un número suelto en cualquiera de los tres
lugares vuelve inútil a los otros dos.

Reparto de contenido, para no repetir lo mismo tres veces:

| Pieza | Qué lleva | Ejemplo |
|-------|-----------|---------|
| `Marker` | solo el número, sobre el área del elemento | `3` |
| `Handoff — Note` | una línea: número, elemento y el contraste seco | `3 — Destino · #6C6971 contra #53565D del token` |
| `Comment` | el `Problema` y la `Corrección` completos, en lenguaje de diseño | ver `references/handoff.md` |

Las leyendas van **en columna, a la derecha de la captura**, no sobre ella: el `Marker` señala, la
leyenda explica.

### La leyenda es precisa; la observación es detallada

No es una diferencia de estilo, es una diferencia de soporte:

- **`Handoff — Note` es una sola línea sin envolver.** Vive al lado de la captura y se lee de un
  vistazo. Lleva el contraste seco: `3 — Destino · #6C6971 contra #53565D del token`. Nada de
  contexto, nada de impacto, nada de instrucciones. Si necesita dos líneas, está de más.
- **`Comment` tiene lugar y crece.** Lleva el `Problema` con su impacto y la `Corrección` con los
  valores integrados, escrito para un diseñador → `references/handoff.md`. Es lo que el equipo
  lee y discute.

**Nunca llamar `resize()` sobre un `Handoff — Note`.** El componente ya viene con autolayout
`HORIZONTAL` y `layoutSizingHorizontal: 'HUG'`; `resize()` lo pasa a `FIXED` y el texto se recorta
sin avisar. Si hay que reafirmarlo tras clonar o instanciar:

```javascript
nota.layoutSizingHorizontal = 'HUG';   // nunca nota.resize(...)
```

Verificar después que ninguna recorta: `textNode.width > instancia.width` debe dar `false` en todas.

---

## Geometría de la página

```
Frame raíz · VERTICAL autolayout · padding 40 · gap 40 · fill #FAFAFA
                                       counterAxisAlignItems: 'MIN'  ← alineado a la IZQUIERDA
├─ _Design system header (Type=Sub)     ← Heading, cuerpo, Version y miga SE LLENAN; el nodo
│                                         `Link` apunta al handoff. Ver «Identidad de la página»
├─ Section (Hero) · CONTEXTO           ← Title = nombre del módulo evaluado; Content = URL,
│                                         fecha, devicePixelRatio, cobertura de tokens
├─ Section (Hero) · 1 · COMPARACIÓN    ← Content con descripción real, nunca vacío
├─ Panel «Desarrollo»                  ← 1280 × alto · layoutMode NONE · clipsContent false
│                                         cornerRadius 16 · fill #F6F7F9
│  ├─ rótulo (60, 32) + botón de enlace alineado a la derecha, MISMA fila, y≈26 — cabecera,
│  │  nunca al pie del panel
│  ├─ captura en (60, 80), al tamaño del DOM
│  ├─ áreas Marker con el rect de cada elemento
│  └─ leyendas Handoff — Note en columna, a la derecha de la captura
├─ Panel «Diseño aprobado»             ← misma geometría, mismo patrón de cabecera; adentro un
│                                         CLON del nodo aprobado, no una imagen: queda vectorial
├─ Section (Hero) · 2 · OBSERVACIONES
├─ Contenedor de observaciones         ← 1280 · HORIZONTAL con layoutWrap WRAP · gap 24
│                                         entran dos Comment de 516 por fila
│  ── hasta acá el núcleo. Lo que sigue es opcional y SE CONSULTA ──
├─ Section (Hero) · 3 · CONTRA EL DISEÑO   ← + su contenedor de Comment
├─ Section (Hero) · 4 · ESTADOS Y ALCANCE  ← qué se midió, qué no, y por qué
├─ Divider Container
└─ Unlock Lyse Beta
```

### El contenido de Contexto y Comparación no es opcional

Las dos primeras `Section` de la página no se llenan con un rótulo genérico ni se dejan con el
texto de plantilla del componente (`Description text goes here.`). Cada una tiene un contenido
obligatorio:

| Sección | `Tagline` | `Title` | `Content` |
|---------|-----------|---------|-----------|
| CONTEXTO | `CONTEXTO` | **El nombre del componente o módulo evaluado** — "Panel de selección de canal — MFA", nunca una etiqueta abstracta como "Qué se comparó" | URL, **la sección o el estado comparado en lenguaje simple**, fecha de la corrida, `devicePixelRatio` |
| 1 · COMPARACIÓN | `1 · COMPARACIÓN` | "Desarrollo vs. diseño aprobado" (o equivalente) | Una frase real sobre qué se compara y con qué garantía — nunca vacío ni el placeholder del kit |

El `Title` de CONTEXTO es lo primero que alguien lee después del encabezado, y tiene que decir
**qué componente es este**, no describir el proceso genérico del skill — eso ya lo dice el
`Heading` del `_Design system header`. Repetir el mismo tipo de mensaje en dos lugares diluye a
ambos; nombrar el módulo en uno de ellos es lo que lo hace útil como referencia rápida.

### "Nodo" es vocabulario de Figma, no de quien lee

**Nunca escribir un ID de nodo (`6:978`, `695:313`) ni la palabra "nodo" en texto visible de la
página** — ni en el cuerpo del header, ni en `Content` de CONTEXTO. Es la misma regla que B35 ya
aplica al `Comment` ("sin IDs de nodo en el texto, eso vive en el bloque de evidencia"), extendida
al resto de la página: nadie fuera de Figma sabe qué es un nodo, y quien sí lo sabe no lo necesita
ahí porque el `Link` del header y los botones de cada panel ya resuelven la navegación al nodo real.

En su lugar, nombrar **la sección o el estado comparado** en lenguaje llano: no "Nodo Figma: 6:978
(Anatomía)" sino "comparado contra la sección de Anatomía del componente aprobado". El ID sigue
existiendo — vive en el `hyperlink` del botón, no en el texto que se lee.

### El núcleo se construye; lo demás se propone

Todo lo que está arriba de la línea es la página. Lo que está debajo **son secciones útiles que
el skill no agrega por su cuenta**: se enumeran antes de construir y se espera respuesta.

Verificado el 2026-08-07: se agregaron «Contra el diseño» y «Estados y alcance» sin preguntar. El
usuario las quiso —quedaron— pero corrigió el procedimiento: *"esto no debería ser obligatorio,
debes consultar al usuario si realmente quiere agregar estos estados"*. El problema no fue el
contenido, fue decidir por él sobre su artefacto.

| Sección opcional | Cuándo tiene sentido ofrecerla |
|------------------|-------------------------------|
| **Contra el diseño** | Hay hallazgos del caso 5 de la matriz. `handoff.md` **sí exige** separarlos en el reporte; convertirlos en sección de la página es la extensión que se consulta |
| **Estados y alcance** | El diseño documenta estados y alguno quedó sin medir. Deja constancia de por qué, para quien abra la página en tres meses |
| **Cotas sobre la captura** | Hallazgos de medida. Preguntar: cargan la captura y compiten con los marcadores. **Por defecto, no** |

Cómo se ofrece — enumerado y corto, junto con la tabla de hallazgos, antes de escribir:

```
Además del núcleo puedo agregar:
  · Contra el diseño — [N] hallazgos que no van contra dev
  · Estados y alcance — [N] estados documentados quedaron sin medir
  · Cotas sobre la captura en los [N] hallazgos de medida
¿Agrego alguna?
```

La regla vale para cualquier agregado, no solo para estos tres: **si no está en el núcleo, se
propone**. Una página con más de lo pedido no es más completa, es una decisión que el skill se
tomó solo.

**Dos paneles apilados, no lado a lado.** El apilado deja ancho libre para las leyendas y las áreas;
enfrentarlos los aprieta y las anotaciones se pisan.

### El clon es la variante que coincide con el estado medido

«El nodo aprobado» no es una sola cosa cuando el componente tiene estados. La sección de Anatomía
suele mostrar **uno** —el que el diseñador eligió para explicar la estructura— y la sección de
Estados tiene todos. Clonar el de Anatomía por costumbre compara contra el estado equivocado, y eso
no produce un error: produce **hallazgos falsos que se ven perfectamente creíbles**, porque un badge
de otro color y un toggle de otro color son exactamente lo que este skill busca.

Verificado el 2026-08-07: dev renderizaba el modal en *Activado* y la copia de Anatomía era
*Desactivado*. Clonarla habría inventado dos hallazgos de color —badge y toggle— sobre una
implementación correcta.

**Antes de clonar:**

1. Determinar en qué estado está dev. No se deduce del nombre del nodo: se lee del DOM (`checked`,
   la clase de estado, el texto del badge).
2. Buscar la variante equivalente en la sección de Estados del handoff, no en Anatomía.
3. Nombrar el estado en el rótulo del panel y en la sección de contexto —`DISEÑO APROBADO ·
   variante Activado`—, para que quien lea sepa contra qué se comparó.
4. Si el estado de dev no tiene variante aprobada, **decirlo y no elegir la más parecida**.

Si el componente tiene varios estados medibles, cada uno es su propio par de paneles: no se mezcla
una captura de un estado con el clon de otro.

**Todo alineado a la izquierda** (`counterAxisAlignItems: 'MIN'`). Los bloques tienen anchos muy
distintos —header 1436, paneles 1280, secciones 800— y centrados generan un borde izquierdo en
zigzag que obliga a rastrear dónde empieza cada bloque. Alineados comparten margen y se leen en
una sola columna.

## Identidad de la página — el encabezado se llena, no solo se instancia

**Toda instancia del kit llega con el contenido de su componente**, y ese contenido es de otra
cosa. Instanciarla y tocarle un solo nodo deja el resto como plantilla.

Verificado el 2026-08-07: se instanció `_Design system header`, se le apuntó el nodo `Link` al
handoff… y la página quedó publicada con el título **"Logo"** y el párrafo *"The logo is a key
component of the Lyse Design System…"*. Lo detectó el usuario, no la verificación: ninguna de las
comprobaciones estructurales miraba el contenido, solo la geometría.

El encabezado es lo primero que se lee y responde tres preguntas. Ninguna es opcional:

| Nodo | Qué contesta | Contenido |
|------|--------------|-----------|
| `Heading` | Qué es esta página | `[Componente] — QA de desarrollo` |
| `Supporting text` (cuerpo) | Qué se comparó y con qué autoridad | Qué entorno contra qué nodo, que los valores salen del render y del nodo —no de una captura—, y el recuento de hallazgos |
| `Version` | Cuándo | La fecha de la corrida. **No** la versión del design system: lo que caduca acá es la medición |
| `Supporting text` (miga) | Dónde estoy | `QA de desarrollo`, no `Handoff` |
| `Link` | Contra qué se comparó | Al frame de handoff aprobado |

Un separador (`/`) o un pie institucional **no** son plantilla sin llenar: son contenido constante
del sistema y se dejan como están.

### La comprobación que lo atrapa

Comparar cada texto de cada instancia contra el texto del mismo nodo en su componente principal.
Si coinciden, nadie lo llenó:

```javascript
const visEfectiva = (n, tope) => {              // ancestros, igual que B26
  let p = n; while (p && p.id !== tope.id) { if (p.visible === false) return false; p = p.parent; }
  return true;
};
for (const inst of frameRaiz.children.filter(c => c.type === 'INSTANCE')) {
  const main = await inst.getMainComponentAsync();
  if (!main) continue;
  const mt = main.findAll(n => n.type === 'TEXT');
  const it = inst.findAll(n => n.type === 'TEXT');
  for (let i = 0; i < it.length && i < mt.length; i++) {
    if (!visEfectiva(it[i], inst)) continue;    // sin esto, los nodos de frames apagados dan falso positivo
    if (it[i].characters.trim() && it[i].characters.trim() === mt[i].characters.trim())
      sospechosos.push({ instancia: inst.name, nodo: it[i].name, texto: it[i].characters });
  }
}
```

**La comprobación propone, no decide.** Devuelve candidatos; hay que mirarlos y separar la
plantilla olvidada del contenido constante. Verificado: sobre la página terminada devolvió tres
—un `/`, y el título y el cuerpo del pie del sistema— y los tres eran correctos. Lo que no puede
pasar es que devuelva un `Heading` que dice "Logo".

### Y llenar de más recorta: el nodo puede truncar por altura

Los nodos del kit vienen dimensionados para su contenido original. Escribir un texto más largo no
los hace crecer: si traen `maxLines` con `textTruncation: 'ENDING'`, **cortan y ponen puntos
suspensivos**, en silencio.

Verificado el 2026-08-07: el cuerpo del encabezado tenía `maxLines: 2` y se publicó diciendo
*"…salen de los estilos computados del render y…"*. La verificación de recorte del skill comparaba
`textNode.width > instancia.width` y dio en verde: **el corte era vertical**, no horizontal.

Medir cuánto necesita el texto de verdad, sin tocar el nodo original — clonarlo, sacarle el límite
al clon, medir y descartarlo:

```javascript
const c = t.clone();
frameRaiz.appendChild(c);
c.textTruncation = 'DISABLED'; c.maxLines = null;
c.resize(t.width, c.height);
const recorta = Math.round(c.height) > Math.round(t.height) + 1;
c.remove();
```

Correr sobre `findAll(n => n.type === 'TEXT' && n.textTruncation !== 'DISABLED')`. Si recorta, se
acorta el texto — **nunca se le sube el `maxLines` al componente**, que es una definición del kit y
está fuera de la página de QA (B2).

## Referenciar el handoff de origen

La página de QA no reemplaza a la documentación aprobada: la contrasta. Quien la lea tiene que
poder saltar al handoff sin buscarlo a mano.

### La URL se deriva, no se pide

**No hay que pedirle el link al usuario.** El plugin expone `figma.fileKey`, y con eso más el
`nodeId` se arma la URL canónica:

```javascript
const urlNodo = (id) =>
  'https://www.figma.com/design/' + figma.fileKey + '/' +
  encodeURIComponent(figma.root.name).replace(/%20/g, '-') +
  '?node-id=' + id.replace(':', '-');
```

El `node-id` va con **guion**, no con dos puntos: `14:4393` → `14-4393`.

### Dónde ponerlos

Tres referencias, cada una donde se necesita:

| Dónde | Apunta a | Tipo |
|-------|----------|------|
| Nodo `Link` del `_Design system header` | el frame de handoff del componente | `NODE` |
| Botón en el panel **Diseño aprobado** | la documentación aprobada | `URL` derivada |
| Botón en el panel **Desarrollo** | el entorno donde se midió | `URL` |

**Figma normaliza solo los enlaces internos.** Al asignar `{ type: 'URL', value: <url del mismo
archivo> }`, lo convierte a `{ type: 'NODE', value: '14:4393' }` sin avisar. No es un error: es lo
correcto, porque así navega dentro del archivo. Pero al releer la propiedad **no se recupera la URL
que se escribió**, y un chequeo que espere `type: 'URL'` va a dar falso negativo.

Consecuencia práctica: derivar la URL igual (es lo que hace legible el código y sirve para pegar en
un ticket), y al verificar, aceptar las dos formas — resolviendo el `value` con
`getNodeByIdAsync` cuando el tipo sea `NODE`.

Los enlaces **externos** (el entorno de QA, un ticket) sí quedan como `type: 'URL'`.

El botón debe reutilizar el componente/frame de enlace estándar del kit QA cuando exista. No se
debe crear como texto suelto ni reconstruir manualmente su apariencia. Si el archivo tiene las
instancias `Enlace — → Ver documentación del componente` y `Enlace — → Abrir el entorno medido`,
se clona la instancia correspondiente y se conserva su Auto Layout, padding, borde, tipografía e
hipervínculo. Solo si el catálogo no contiene un componente equivalente se arma un frame de
autolayout como fallback, y esa ausencia se declara en la verificación.

El fallback se arma con un frame de autolayout:

```javascript
const f = figma.createFrame();
f.layoutMode = 'HORIZONTAL';
f.paddingLeft = f.paddingRight = 16;
f.paddingTop = f.paddingBottom = 10;
f.primaryAxisSizingMode = 'AUTO';           // hug
f.counterAxisSizingMode = 'AUTO';
f.cornerRadius = 8;
f.fills   = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
f.strokes = [{ type: 'SOLID', color: { r: 0.71, g: 0.706, b: 0.722 } }];   // #B5B4B8
const t = figma.createText();
t.fontName = FN;                            // heredada del archivo, NO la del producto
t.fontSize = 14;
t.characters = '→  Ver documentación del componente';
t.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];   // texto negro, no azul de enlace
t.hyperlink = { type: 'URL', value: urlNodo(NODO_HANDOFF) };
f.appendChild(t);
```

**El color no es una elección libre.** Texto negro sobre fondo blanco con borde gris — el mismo
estilo neutro del resto de controles de documentación, nunca azul ni subrayado. Un botón con la
apariencia de un enlace de contenido compite visualmente con los marcadores y las observaciones,
que son lo que de verdad necesita destacar en el panel.

El hipervínculo va en el **nodo de texto**, no en el frame: un frame no acepta `hyperlink`.

### La posición es fija: cabecera del panel, no el pie

El botón y el rótulo del panel (`DESARROLLO` / `DISEÑO APROBADO`) comparten la misma fila, en la
parte **superior** del panel — nunca debajo de la captura. El rótulo va a la izquierda en
`(60, 32)`; el botón se alinea a la derecha de esa misma fila, con `y` en la misma línea (`~26`,
ajustado por el padding vertical del botón) y `x` calculado contra el ancho real del panel menos
el ancho del botón (que es `HUG`, así que se lee después de crearlo):

```javascript
boton.x = panel.width - boton.width - MARGEN_DERECHO;   // MARGEN_DERECHO ~60-90px
boton.y = 26;
```

No hay una posición "razonable" alternativa: un botón al pie del panel, después de las tarjetas
o leyendas, queda fuera del primer vistazo — quien abre la página tiene que desplazarse para
encontrar el enlace al entorno o a la documentación, cuando esa referencia es lo primero que
identifica qué se está comparando.

`clipsContent: false` en los paneles es obligatorio: los badges se dibujan por encima de su área y
quedarían recortados.

---

## Alinear la captura con las anotaciones

### De dónde salen los rects

**No se estiman de la imagen.** Se miden en el navegador, relativos a la raíz del componente, con
la misma sonda que produjo los hallazgos:

```javascript
() => {
  const raiz = document.querySelector(SEL_RAIZ).getBoundingClientRect();
  const rel = (sel) => [...document.querySelectorAll(sel)].map((e, instanceIndex) => {
    const r = e.getBoundingClientRect();
    return { instanceIndex,
             x: Math.round((r.left - raiz.left) * 10) / 10,
             y: Math.round((r.top  - raiz.top ) * 10) / 10,
             w: Math.round(r.width  * 10) / 10,
             h: Math.round(r.height * 10) / 10 };
  });
  return Object.fromEntries(Object.entries(OBJETIVOS).map(([k, s]) => [k, rel(s)]));
}
```

Cada hallazgo queda atado al selector del elemento que lo produjo, así que el área del `Marker` y
la medición **no pueden divergir**: salen de la misma llamada. Si un hallazgo no tiene selector,
no tiene marcador — y probablemente tampoco debería ser un hallazgo.

Para elementos con hijos relevantes (contenedor vs ícono), medir **los dos** y decidir cuál señala
el marcador según dónde está el problema → `SKILL.md`, Paso 0, desambiguación.

### El mapeo 1:1

Las áreas se posicionan con esos rects. Para que caigan donde deben, el frame de la captura tiene
que mapear 1:1 con esas coordenadas:

- **El frame mide lo que mide el elemento en el DOM**, no lo que mide el PNG. Una captura
  `scale: 'device'` a dpr 1,25 sale 575×513 para un elemento de 460×409; dividido da 460×410,4, y
  ese 1,4px de más desalinea todo hacia abajo. Redimensionar al valor del DOM y dejar `scaleMode`
  en `FILL`.
- Con la captura en `(OX, OY)`, un elemento medido en `(x, y)` relativo a la raíz del componente va
  en `(OX + x, OY + y)`. Sin más transformaciones.

Cómo entra la imagen al archivo → `references/engine.md`, sección de capturas.

### Verificar la colocación, siempre

Una anotación corrida señala el elemento equivocado y nadie lo nota. El chequeo está en
`references/handoff.md`: dibujar los mismos rects sobre el componente real en el navegador,
capturar y mirar. Si caen bien ahí, caen bien en Figma.

---

## Límites operativos de `figma_execute`

Verificados en corrida real. Ignorarlos cuesta timeouts y páginas a medio construir.

| Límite | Qué hacer |
|--------|-----------|
| Timeout por defecto **5s**, tope **30s** | Partir el trabajo en pasos. Una página completa no entra en una sola llamada. |
| `loadAllPagesAsync()` + `findOne` sobre cientos de componentes es lento | Resolver el catálogo **una vez** y reusar `getNodeByIdAsync`. Es la diferencia entre timeout y 2 segundos. |
| `figma.currentPage = p` falla con `documentAccess: dynamic-page` | `await figma.setCurrentPageAsync(p)` |
| `node.mainComponent` falla igual | `await node.getMainComponentAsync()` |
| `node.exportAsync()` **cuelga el puente** en frames con muchos nodos | No exportar para reinsertar: **clonar el nodo**. Es instantáneo y queda vectorial. |
| `figma_take_screenshot` usa la API REST y **el token expira** (403) | Si expira, verificar por estructura: posiciones, solapamientos, desbordes. Y **decir** que no hubo verificación visual. |
| Crear una página vacía dispara un warning de housekeeping | Llenarla en la misma corrida, o borrarla si se abandona. |
| **Cargar fuentes dentro de un bucle revienta el timeout** | Recorrer los nodos de texto de cada instancia para cargar sus fuentes cuesta ~3s por instancia: nueve observaciones no entran en 30s. Verificado: la corrida murió con 2 de 9 creadas, la segunda a medias. |
| **La primera `loadFontAsync` de la sesión arranca en frío** | Cargar nueve fuentes de golpe pasó de 30s sin terminar; después, cada una tardó **1-7 ms**. Calentar con **una** fuente en su propia llamada y recién ahí cargar el resto. |
| **Un timeout NO revierte el trabajo** | Ver abajo. Es el error más caro de esta lista. |
| **Devolver un valor crudo de Figma rompe el puente** | `Error: in postMessage: Cannot unwrap symbol`. `figma.mixed` es un `Symbol` y no se serializa; los enums (`layoutMode`, `textCase`, `strokeAlign`) tampoco son seguros. Verificado el 2026-08-07: una lectura de geometría murió por devolver `fontName` y `lineHeight` sin comprobar `mixed`. Envolver todo enum con `String()` y guardar siempre contra `figma.mixed` **antes** de leer la propiedad. |
| `figma_capture_screenshot` se degrada con el uso | Verificado: las tres primeras capturas salieron; a partir de la cuarta, timeout consistente a 30s con el puente sano (`probe` en 3 ms). **Capturar primero lo que más riesgo tiene de estar mal colocado**, no lo más fácil. Lo que quede sin captura se verifica por estructura y se declara. |

### Serializar lo que sale del sandbox

Todo lo que `figma_execute` devuelve pasa por `postMessage`. Los valores propios de la API de Figma
no sobreviven ese viaje y el error no dice cuál fue: `Cannot unwrap symbol`, sin nombre de nodo ni
de propiedad. En un árbol de cientos de nodos, encontrarlo a mano cuesta más que blindarlo.

```javascript
const num  = v => typeof v === 'number' ? Math.round(v * 10) / 10 : null;
const enu  = v => v == null ? null : String(v);                    // layoutMode, textCase, strokeAlign…
const font = n => (n.fontName && n.fontName !== figma.mixed)
  ? n.fontName.family + ' ' + n.fontName.style : 'MIXTA';
const lh   = n => (n.lineHeight && n.lineHeight !== figma.mixed && typeof n.lineHeight.value === 'number')
  ? n.lineHeight.value : 'MIXTA';
```

**`figma.mixed` aparece más de lo que parece**: cualquier texto con dos estilos en el mismo nodo
—una palabra en negrita dentro de un párrafo— lo devuelve en `fontName`, `fontSize`, `lineHeight`,
`textCase` y `fills`. Y `'MIXTA'` no es un valor perdido: es un dato. Si el aprobado tiene una
tipografía mixta donde el skill espera una sola, eso se declara en vez de silenciarse.

### Un timeout no es un rollback: verificar antes de reintentar

`figma_execute` devuelve `Execution timed out` cuando se le acaba el tiempo **de espera**, no
cuando el código falla. El código sigue corriendo en el sandbox y suele terminar. Tratar el
timeout como "no pasó nada" y reintentar el mismo bloque duplica todo lo que ya se creó — o peor,
si el bloque empieza con un `for (const c of page.children) c.remove()`, borra lo que la primera
ejecución acababa de construir.

Verificado el 2026-08-07: una llamada que creó página, frame raíz, encabezado y dos secciones
devolvió timeout. La verificación inmediata dio `null` —todavía no había terminado— y el reintento
salió con el puente caído. Al reconectar, las tres instancias estaban creadas y correctas: el
reintento habría destruido trabajo bueno.

**Protocolo después de cualquier timeout:**

1. **No reintentar de inmediato.** Esperar y consultar el estado en una llamada aparte, de solo
   lectura.
2. Si el puente no responde, `figma_get_status({ probe: true })` hasta que vuelva. La página activa
   que reporta ya es un indicio de hasta dónde llegó.
3. Recién con el árbol real a la vista, decidir: continuar desde donde quedó, o limpiar y rehacer.
4. **Escribir los bloques de forma que sean seguros de repetir**: buscar antes de crear, y nunca
   mezclar un borrado masivo con una creación en la misma llamada.

Corolario de diseño: si un bloque puede quedar a medias, partirlo. Un `figma_execute` que crea una
página, un encabezado y dos secciones es tres pasos disfrazados de uno.

### Cargar las fuentes una sola vez, antes del bucle

```javascript
for (const f of [
  { family: 'Roboto',   style: 'Bold' },     { family: 'Roboto',   style: 'SemiBold' },
  { family: 'Roboto',   style: 'Regular' },  { family: 'Roboto',   style: 'Medium' },
  { family: 'Segoe UI', style: 'Regular' },  { family: 'Segoe UI', style: 'Semibold' },
  { family: 'Inter',    style: 'Semi Bold' }
]) { try { await figma.loadFontAsync(f); } catch (e) {} }
// recién ahora crear las instancias, sin loadFontAsync adentro del bucle
```

Ese set cubre el `Comment`, la `Etiqueta Tipo` y los textos propios del skill en este kit. Para
descubrir el set de otro archivo: crear **una** instancia, leer las fuentes de sus nodos de texto,
cargarlas, y recién entonces crear el resto.

Si aun así se corta, partir en lotes de 4-5 instancias por llamada.

### Verificación visual — se presupuesta, no se deja para el final

`figma_capture_screenshot` es un recurso que **se agota**. Verificado el 2026-08-07: las tres
primeras capturas salieron sin problema y a partir de la cuarta hubo timeout consistente a 30s,
con el puente sano (`probe` en 3 ms) y reintentos fallando igual. El resultado fue una página de
seis paneles con **tres verificados visualmente y tres solo por estructura** — y no por falta de
tiempo, sino por haber dejado todas las capturas para el final.

**El arreglo es de orden, no de herramienta: capturar cada panel apenas se termina de construir.**
El export está fresco al principio, y un panel mal colocado se detecta cuando todavía es barato
corregirlo, no cuando ya hay cinco más encima.

```
construir panel 1 → capturar 1 → construir panel 2 → capturar 2 → …
```

y no:

```
construir 1..6 → capturar 1..6      ← lo que falla
```

Si aun así hay que racionar, el orden de prioridad es por **riesgo de estar mal colocado**, no por
comodidad:

1. El panel con **más marcadores** — más oportunidades de colisión y de desfase.
2. El que tiene el marcador **más chico** (un ícono de 34×36 delata un corrimiento que un área de
   500px se traga) y el que tiene el que **abarca todo** (revela si el origen está bien).
3. El panel de un **elemento faltante**, cuya área no se apoya en ningún elemento real.
4. El bloque de observaciones — texto recortado, numeración, etiquetas.
5. El panel del diseño aprobado, que es un clon y casi nunca falla.

**Cuando un export da timeout:**

1. `figma_get_status({ probe: true })`. Si el puente está caído, es otro problema — reconectar.
2. Si el puente está sano, es el export: `figma_reload_plugin` y **un** reintento.
3. Si vuelve a fallar, dejar de exportar. Insistir consume la sesión y no cambia el resultado.

**Y el cierre lleva la cobertura como fracción, siempre.** `Verificación: 3 de 6 paneles` es un
dato; `Verificación: visual` cuando fueron 3 de 6 es una afirmación falsa. Nombrar cuáles quedaron
sin mirar, para que quien lea sepa dónde no confiar.

### Verificación estructural cuando no hay imagen

```javascript
const maxX = Math.max(...panel.children.map(c => c.x + c.width));
const maxY = Math.max(...panel.children.map(c => c.y + c.height));
return { desborda: maxX > panel.width || maxY > panel.height,
         usado: Math.round(maxX) + '×' + Math.round(maxY) };
```

No reemplaza mirar la página. Cuando no se pueda mirar, **decirlo** y pedirle al usuario que la abra.

---

## La tipografía de la documentación NO es la del producto

Trampa fácil de repetir: el skill viene de medir el producto, tiene sus specs tipográficos frescos
—`Poppins SemiBold 15/24`, etc.— y los aplica a los textos que **él** crea. Está mal.

- **La tipografía del producto** es un *dato medido*. Vive en los hallazgos y en las observaciones,
  como contenido.
- **La tipografía de la documentación** es la del archivo de handoff. Es la que usan los textos que
  el skill escribe: rótulos de panel, botones de enlace, cualquier texto propio.

En este sistema la documentación usa **Inter** (`Semi Bold` para rótulos y enlaces), con `DM Sans`
en los títulos de `Section`. El producto usa Poppins. Escribir un rótulo en Poppins mete la voz del
producto dentro de la voz del sistema.

**No asumirlo: leerlo del archivo.** Antes de crear cualquier texto propio, mirar qué usa un nodo
equivalente ya existente:

```javascript
const ref = seccion.findAll(n => n.type === 'TEXT')[0];
const FN = ref.fontName;               // ← heredar, no elegir
await figma.loadFontAsync(FN);
```

Ojo con el nombre del estilo: en Inter es `'Semi Bold'` **con espacio**, no `'SemiBold'`. Verificar
con `figma.listAvailableFontsAsync()` si una carga falla.

---

## Fuentes

`loadFontAsync` antes de tocar cualquier texto, incluso vía `setProperties`. Las instancias traen
fuentes que no son las del proyecto: cargarlas leyéndolas del propio nodo.

```javascript
for (const t of nodo.findAll(n => n.type === 'TEXT')) {
  try { await figma.loadFontAsync(t.fontName); } catch (e) {}
}
```

Los textos con `fontName === figma.mixed` necesitan `getRangeFontName` por rango.

---

## Caso de referencia completo (verificado, 2026-08-09)

Una corrida real terminó con esta forma. No es una plantilla para copiar literal —los nombres del
componente, el conteo de hallazgos y el archivo son de ese caso puntual—, es el resultado de aplicar
las reglas de arriba en orden y dejar que cada disparador decida por sí solo:

- **Núcleo completo**: header con el nombre del módulo en el `Title` de CONTEXTO (no una etiqueta
  genérica), COMPARACIÓN con descripción real, dos paneles apilados (Desarrollo / Diseño aprobado),
  observaciones abajo.
- **Partición activada una sola vez, para una sola categoría.** De cuatro categorías posibles
  (geometría, espaciado, color, tipografía y contenido), el archivo solo disparó **espaciado**: un
  hallazgo con tres tramos medidos agrupaba un marcador de región amplia junto a siete marcadores
  puntuales de otros hallazgos en el mismo panel — el segundo disparador de "Partir el panel en
  copias por tipo de desviación", no colisión de badges. Resultado: `Panel «Desarrollo»` con los
  siete hallazgos puntuales, `Panel «Desarrollo» · ESPACIADO` con el hallazgo de espaciado y sus
  tres `Handoff — Spacing`, mismo número (`1`) en los tres. Las otras tres categorías **no** se
  partieron, porque nada las disparó — partir sin disparador es el error que la regla previene, no
  una demostración más completa.
- **Cotas obligatorias, no decorativas.** Ese mismo hallazgo de espaciado tenía tres tramos bajo un
  solo marcador y una nota de una línea que los mezclaba — ilegible. La corrección fue una
  `Handoff — Spacing` por tramo, cada una con su valor medido y su esperado, agrupadas fuera de la
  captura (como ya hacen las leyendas) porque el ancho fijo del componente no cabía pegado al gap
  real dentro de la tarjeta.
- **Todo hallazgo, sin excepción, con sus tres piezas.** El de "contra el diseño" —un error de
  tipeo del propio archivo— al principio solo tenía `Comment`; le faltaban `Marker` y leyenda en el
  panel de **Diseño aprobado** (no en Desarrollo, porque ahí el error no existe). La cadena
  marcador → leyenda → observación no admite atajos ni para los hallazgos que no son responsabilidad
  de dev.
- **Sin IDs de nodo ni la palabra "nodo" en texto visible** (ver arriba). En su lugar, la sección o
  el estado comparado en lenguaje llano; el ID vive en el `hyperlink` de los botones.
- **El botón de enlace va en la cabecera de cada panel**, alineado a la derecha del rótulo, blanco
  con borde gris y texto negro — nunca al pie, nunca azul de enlace.
- **La leyenda y el heading del `Comment` usan el mismo nombre para el mismo elemento.** Dos
  inconsistencias reales en esa corrida —una leyenda decía "Chevron" y su Comment decía "la
  flecha"; una leyenda decía "Retroceso del stepper" y su Comment decía "Indicador de paso"— no
  rompían nada técnicamente, pero obligaban a quien lee a inferir que eran lo mismo.

