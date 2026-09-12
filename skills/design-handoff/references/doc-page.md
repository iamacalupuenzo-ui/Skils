# Doc Page — Página de Documentación en Figma

Segundo kit del archivo, independiente del `Handoff —`. Sirve para armar una **página
de documentación** navegable dentro de Figma, no para redlinear sobre el diseño.

**Requiere OK del usuario antes de ejecutar** — escribe en su archivo.

---

## Cuándo usar cada kit

| Kit | Produce | Para |
|---|---|---|
| `Handoff —` | Medidas y markers sobre el diseño | Construir **un componente** |
| Doc Page | Página de secciones con texto y ejemplos | Explicar **un sistema** |

No compiten. Un componente se redlinea; un design system se documenta. Si el pedido
es de un solo componente, no armar una página de documentación.

---

## Descubrir el Kit

Estos componentes **no comparten prefijo**. Buscarlos por nombre exacto.

```javascript
await figma.loadAllPagesAsync();
const NOMBRES = ['Secciones', 'Annotation Status', '_Design system header',
                 '_Design system footer', '_Tip', 'Divider Container'];
const kit = {};
for (const n of figma.root.findAll(n =>
  (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && NOMBRES.includes(n.name))) {
  kit[n.name] = {
    id: n.id, type: n.type,
    props: n.componentPropertyDefinitions,
    variants: n.type === 'COMPONENT_SET' ? n.children.map(v => v.name) : null
  };
}
return kit;
```

---

## Inventario

| Componente | Tipo | Variantes | Ancho | Rol |
|---|---|---|---|---|
| `Secciones` | Set | 11 | `800` | Bloques de contenido |
| `Annotation Status` | Set | 4 | `98–166` | Estado de una observación |
| `_Design system header` | Set | 2 (`Main`, `Sub`) | `1440` | Portada y encabezado de sección |
| `_Design system footer` | Componente | — | `1440` | Cierre de página |
| `_Tip` | Componente | — | `400` | Aviso destacado |
| `Divider Container` | Componente | — | `800` | Separador |

Ancho de contenido: **`800px`**. La portada y el pie van a `1440`.

---

## `Secciones` — Mapa de Variantes

Los nombres `Tipo1`…`Tipo12` no dicen nada. Esta tabla traduce cada uno por su
**estructura**, no por el texto que trae de ejemplo.

| Variante | Alto | Estructura | Usar para |
|---|---|---|---|
| `Tipo3` | `250` | Eyebrow + título + párrafo | Apertura de un tema |
| `Tipo12` | `242` | Eyebrow + título + subtítulo | Encabezado de subsección |
| `Tipo8` | `430` | Título + filas | Reglas, buenas prácticas, checklist |
| `Tipo1` | `662` | Section header + contenido + muestra | Bloque con ejemplo visual |
| `Tipo9` | `662` | Título + how-to + 2 contenidos | Ejemplos de uso |
| `Tipo2` | `686` | Section header + contenido + muestra | Bloque con ejemplo visual |
| `Tipo4` | `686` | Section header + contenido + muestra | Bloque con ejemplo visual |
| `Tipo7` | `684` | Head + contenido + ejemplo + contenido | Concepto con ejemplo intercalado |
| `Tipo6` | `740` | Header + contenido + ejemplo + contenido | Concepto con ejemplo intercalado |
| `Tipo11` | `1050` | Header + subheader + 4 contenidos | Guía paso a paso |
| `Tipo5` | `1182` | Header + pares ejemplo/descripción | Convención de nombres |

`Tipo10` no existe. No asumir secuencia continua.

> **Verificar siempre contra el descubrimiento.** Estas variantes traen copy de ejemplo
> del template Lyse (colores y tokens). Se elige por estructura y se reemplaza el texto
> — nunca dejar el copy de origen.

### Riesgo de nombres

`Tipo7` no le dice nada a quien abra el archivo dentro de seis meses, ni a una sesión
nueva de esta skill. Si el usuario los renombra por función (`Seccion — Concepto con
ejemplo`), esta tabla queda obsoleta: **regenerarla desde el descubrimiento**, no
confiar en el mapa escrito.

---

## `Annotation Status`

Da ciclo de vida a una observación. Cubre el hueco de `OJO` y `TODO`, que hoy no
distinguen lo pendiente de lo resuelto.

| Variante | Significado |
|---|---|
| `To do` | Detectado, sin trabajar |
| `In progress` | Diseño lo está resolviendo |
| `In review` | Resuelto, falta validar |
| `Done` | Cerrado |

```javascript
const set = await figma.getNodeByIdAsync('STATUS_SET_ID');
const v = set.children.find(c => c.name === 'Status=To do');
const inst = v.createInstance();
```

Regla: todo `TODO` del canvas o del documento lleva su chip de estado al lado. Al
regenerar la anotación, **leer el estado anterior antes de recrear** — si no, todo
vuelve a `To do` y se pierde el avance del equipo.

---

## `_Tip`

| Propiedad | Para |
|---|---|
| `Description#184:0` | El aviso |
| `Link#185:0` | Texto del enlace |

Usar para la alerta que **sí** pasa el filtro de NORMAL: una instrucción que cambia lo
que dev escribe. No usar para crítica de construcción — eso va a Reconstrucción.

---

## Editar el Texto de una Sección

Ni `Secciones` ni `_Design system header` exponen propiedades de texto. Hay que
recorrer la instancia y escribir sobre los nodos `TEXT`. Tres trampas, todas
encontradas en uso real.

### 1 · Rutas duplicadas — indexar, no mapear por nombre

Varios nodos comparten nombre y ruta completa. `_Design system header` tiene dos
`Supporting text` bajo la misma ruta: el separador `/` y el nombre de la sección.
Mapear por ruta escribe el mismo valor en los dos.

```javascript
const txt = [];
const col = (n, d) => { if (d > 7) return;
  for (const c of n.children || []) {
    if (c.type === 'TEXT') txt.push(c); else if (c.children) col(c, d + 1);
  } };
col(instancia, 0);   // orden estable: recorrido en profundidad
```

Recolectar primero, imprimir el índice con su contenido actual, y recién ahí asignar
por índice. **Nunca asignar a ciegas** — el orden depende del variant.

### 2 · Fuentes mixtas

`loadFontAsync(node.fontName)` revienta con `Cannot unwrap symbol` cuando el texto
tiene formato por rango: `fontName` devuelve `figma.mixed`, que es un símbolo.

```javascript
const loadFonts = async (n) => {
  if (n.fontName === figma.mixed) {
    for (const s of n.getStyledTextSegments(['fontName'])) await figma.loadFontAsync(s.fontName);
  } else {
    await figma.loadFontAsync(n.fontName);
  }
};
```

Los párrafos descriptivos suelen tener una palabra en negrita — asumir fuente única
falla a mitad del bucle y deja la sección a medio escribir.

### 3 · No se puede modificar la estructura de una instancia

| Operación | Resultado |
|---|---|
| `hijo.remove()` dentro de una instancia | `Removing this node is not allowed` |
| `instancia.appendChild(nodo)` | No permitido |
| `hijo.visible = false` | **Sí funciona** |
| Escribir `characters` en un `TEXT` anidado | **Sí funciona** |

Para poner el componente documentado dentro de una sección: **no se inserta en la
instancia**. Se oculta su área ilustrativa con `visible = false` y se agrega un frame
propio como hermano, dentro del Auto Layout de la página.

```javascript
const ilustracion = seccion.children.find(c => c.name === 'Design system header');
ilustracion.visible = false;          // sale del flujo del Auto Layout

const muestra = figma.createFrame();  // frame propio, sí editable
doc.appendChild(muestra);
muestra.resize(800, 240);
muestra.layoutMode = 'HORIZONTAL';
muestra.primaryAxisAlignItems = 'CENTER';
muestra.counterAxisAlignItems = 'CENTER';
muestra.appendChild(componente.clone());
```

> Si una llamada falla a mitad, la instancia ya insertada **queda**. Antes de
> reintentar, listar los hijos del contenedor y borrar los duplicados — ver
> `annotation.md`, sección Limpieza ante Fallo.

---

## Armado de la Página

### Orden estándar

La anotación va **dentro** de la página, no en una sección aparte. Un solo artefacto:
dev abre una página y tiene todo.

| # | Bloque | Ancho | Contenido |
|---|---|---|---|
| 1 | `_Design system header` (`Main`) | `1440` | Nombre, descripción, autor, fecha, versión |
| 2 | `Secciones` (`Tipo3`) | `800` | Qué es y cuándo se usa |
| 3 | `Secciones` (`Tipo1`) | `800` | Título "Anatomía" + descripción de las capas |
| 4 | Frame propio — componente limpio | `800` | Instancia real, sin anotar |
| 5 | Frame propio — anotación | `1280` | El redline completo del kit `Handoff —` |
| 6 | Frame propio — estados | `1280` | Cada variante instanciada y etiquetada |
| 7 | `Secciones` (`Tipo8`) | `800` | Observaciones con chip de estado |
| 8 | `Divider Container` | `800` | Separador antes del cierre |
| 9 | `Unlock Lyse Beta` | `1440` | Bloque de cierre + pie |

Los bloques 3 a 7 se repiten **una vez por componente** cuando la página documenta
varios. Numerar los encabezados (`1 · ENCABEZADO`, `2 · CAMPO`) para que se lea como
secuencia. Las observaciones de un componente van pegadas a su bloque; las
transversales, al final.

### Bloque de estados

Obligatorio si el componente tiene variantes de estado. Cada una **instanciada desde
el component set**, con su etiqueta al lado.

```javascript
const set = await figma.getNodeByIdAsync('SET_ID');
const cols = [60, 480, 900];
const rows = [100, 340, 580];
set.children.forEach((v, i) => {
  const inst = v.createInstance();     // render canónico, sin overrides de pantalla
  f.appendChild(inst);
  inst.x = cols[i % 3]; inst.y = rows[Math.floor(i / 3)];
  // etiqueta con Handoff — Note en inst.y - 30
});
```

Grilla de 3 columnas a `1280` de ancho. La etiqueta lleva el nombre del estado y lo
que cambia respecto al reposo — no la spec completa, que ya está en la anotación.

> Instanciar **desde el set**, no clonar una instancia de la pantalla: esa puede traer
> overrides que ocultan el comportamiento real de la variante.

Si una variante contiene otro component set anidado, mostrarlo aparte al pie del
bloque. Sin eso, dev construye dos componentes donde hay uno.

`Unlock Lyse Beta` incluye su propio `_Design system footer`: no agregar el footer por
separado. Trae 9 nodos de texto con copy del template — **reemplazarlos todos**.

| # | Nodo | Contenido del handoff |
|---|---|---|
| 0 | Título | La acción que sigue: `Antes de implementar` |
| 1 | Descripción | Qué revisar antes de construir |
| 2–3 | Botones | Destinos reales, no enlaces inventados |
| 4 | Enlace del pie | Origen del documento |
| 5 | Texto del pie | Garantía de método |
| 6–8 | `©`, `/`, versión | Año y versión del documento |

La portada **siempre primero**. Un bloque de apertura antes del header deja la página
sin entrada.

### Contenedor — valores del estándar

Tomados del frame `Documentation` del archivo. No inventarlos: leerlos de ahí si
existe, y sólo usar estos como respaldo.

| Propiedad | Valor |
|---|---|
| Fondo | `#FAFAFA` — **no blanco** |
| Padding | `40` en los 4 lados |
| Gap entre bloques | `40` |
| Alineación | `MIN` — izquierda |
| Ancho | `1520` = contenido `1440` + padding |
| `clipsContent` | `false` |
| Contenedor | Frame **directo en la página**, sin section |

```javascript
doc.layoutMode = 'VERTICAL';
doc.counterAxisAlignItems = 'MIN';
doc.primaryAxisSizingMode = 'AUTO';
doc.counterAxisSizingMode = 'FIXED';
doc.itemSpacing = 40;
doc.paddingTop = doc.paddingRight = doc.paddingBottom = doc.paddingLeft = 40;
doc.resize(1520, doc.height);
doc.clipsContent = false;
doc.fills = [{ type:'SOLID', color:{ r:0.980, g:0.980, b:0.980 } }];
```

Alineación a la izquierda: los bloques comparten borde izquierdo aunque midan `800`,
`1280` o `1440`. Centrar hace que cada uno arranque en una `x` distinta y la lectura
salta.

### Sin section

El estándar pone el frame **directo en la página**. Una section alrededor agrega un
contenedor sin función y un segundo nombre que mantener. La página `Handoff` ya cumple
el rol de agrupar.

### Leer el estándar antes de construir

```javascript
const ref = figma.root.findOne(n => n.type === 'FRAME' && n.name === 'Documentation');
if (ref) return {
  fills: ref.fills, itemSpacing: ref.itemSpacing,
  pad: [ref.paddingTop, ref.paddingRight, ref.paddingBottom, ref.paddingLeft],
  align: ref.counterAxisAlignItems, w: ref.width,
  orden: ref.children.map(c => c.name)
};
```

Si el archivo trae una página de documentación de referencia, **sus valores mandan**
sobre esta tabla.

### La anotación dentro de la página

Se construye **directamente al ancho final**. No se escala.

| Ancho del bloque | Resultado |
|---|---|
| `800` | Las medidas quedan ilegibles |
| `1280` con la anotación a ese ancho | Se lee sin zoom |

El redline es el único bloque que rompe la grilla de `800`. Es intencional: necesita el
ancho.

> **Nunca `rescale()` sobre la anotación.** Las etiquetas son texto: al escalar, siguen
> diciendo `342px` mientras el componente pasa a medir otra cosa. Ver `annotation.md`,
> sección Escala.

---

## Regla de No Duplicación

Cada dato vive en **un solo bloque**. Es la misma regla que rige entre canvas y
markdown, aplicada dentro de la página.

| Dato | Único dueño |
|---|---|
| Medidas, spacing, colores, tipografía | La anotación (bloque 5) |
| Anatomía por capa | La leyenda de la anotación |
| Pendientes y su estado | Observaciones (bloque 6) |
| Qué es y cuándo se usa | Apertura (bloque 2) |

### Al insertar la anotación, quitarle los pendientes

El redline suelto lleva su `TODO` con chip. Dentro de la página **ese `TODO` sobra**:
ya está en Observaciones, con más contexto y estado editable.

```javascript
for (const c of [...red.children]) {
  if (/^W-|^ST-/.test(c.name)) c.remove();   // alertas y chips de estado
}
```

Sin este paso el mismo pendiente aparece dos veces en la misma página, y al primer
cambio quedan diciendo cosas distintas.

### Botones que dejan de aplicar

`Tipo1` trae un botón "View example" que apunta afuera. Con la anotación inline
**no aplica**: ocultarlo con `visible = false`. Un enlace que lleva a lo que ya está
abajo enseña a desconfiar de los enlaces.

### Componente limpio y anotado

Los dos, en ese orden. No es duplicación: cumplen funciones distintas.

| Bloque | Para |
|---|---|
| Componente limpio | Inspeccionar y copiar la instancia en Figma |
| Anotación | Leer las medidas |

En la anotación el componente queda cubierto por las bandas de spacing — no sirve para
seleccionarlo ni para ver el diseño real.

---

## Qué NO va en esta página

| Contenido | Dónde va |
|---|---|
| Tabla de tokens y valores hex | Documento markdown |
| Cobertura de estados detallada | Documento markdown |
| API del componente | Documento markdown |

La página explica **qué es** y muestra **cuánto mide**. El markdown lleva lo que se
versiona con el código: tokens, API, cobertura. Un hex repetido en los tres lugares se
desincroniza al primer cambio.

Única excepción: un valor puede repetirse si **es el tema** de la observación —
"tokenizar `#D41117`" necesita nombrar el color.
