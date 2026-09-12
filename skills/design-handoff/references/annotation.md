# Annotation — Redlining en Figma con el kit `Handoff —`

Cómo anotar el diseño sobre el canvas. Complementa al documento markdown: el canvas
lleva medidas en contexto, el documento lleva estados, API y accesibilidad.

**Requiere OK del usuario antes de ejecutar** — escribe en su archivo de Figma.

---

## Descubrir el Kit

Los nodeIds son específicos de cada archivo y de cada sesión. Descubrirlos siempre
al iniciar, nunca reutilizar los de una sesión anterior.

```javascript
await figma.loadAllPagesAsync();
const kit = {};
for (const n of figma.root.findAll(n =>
  (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && /^Handoff/.test(n.name))) {
  kit[n.name] = {
    id: n.id,
    type: n.type,
    props: n.componentPropertyDefinitions,
    variants: n.type === 'COMPONENT_SET'
      ? n.children.map(v => ({ id: v.id, name: v.name }))
      : null
  };
}
return kit;
```

Sin resultados → avisar al usuario y generar solo el documento markdown.

---

## Componentes del Kit

Nombres y propiedades observados. Verificar contra el descubrimiento — pueden variar
entre archivos.

| Componente | Propiedades | Para qué |
|---|---|---|
| `Handoff — Spacing` | `Size` (4→80px), `Vertical`, `Side text` | Gaps y padding |
| `Handoff — Element Measure` | `Text#…`, `Vertical`, `Side` | Ancho/alto de una capa |
| `Handoff — Icons Measure` | `Size` (24/32px), `Side`, `Type#…`, `Text type#…` | Medida de íconos |
| `Handoff — Marker` | `Marker Text#…`, `Marker Letter#…`, `Type`, `Color` | Etiqueta Ⓐ Ⓑ Ⓒ |
| `Handoff — Text` | `Marker`, `Title`, `Description` | Nota con título y cuerpo |
| `Handoff — Arrows` | 48 variantes direccionales | Apuntar a una capa |
| `Handoff — Area` | `Position` | Encuadrar una zona |
| `Handoff — Code` | `Type` (Icon/Marker) | Nombre de ícono o token |
| `Handoff — Note` | — | Nota suelta |

`Handoff — Note` expone un solo campo: `↪ Text Note#112:10`.

---

## Orientación y Resize — Contrato por Componente

El punto donde una sesión nueva se equivoca. `Vertical` describe **cómo se dibuja la
barra**, no la dirección del espacio que mide. Son opuestos.

| Quiero medir | Variante | Instancia | Eje que se resize |
|---|---|---|---|
| Un **gap horizontal** (entre dos elementos lado a lado) | `Vertical=True` | `Size × 100` | el **alto** |
| Un **gap vertical** (padding superior, separación apilada) | `Vertical=False` | `100 × Size` | el **ancho** |

El eje que lleva `Size` es el valor medido y **no se toca**. El eje que vale `100` es
largo libre: se ajusta para cubrir el elemento anotado.

```javascript
// gap horizontal de 16px entre dos elementos de 48px de alto
const i = pick(SP, 'Vertical=True, Side text=True, Size=16px'); // 16 × 100
i.resize(16, 48);   // el 16 se conserva, el 100 pasa a 48
i.x = gapX; i.y = elementoY;

// padding superior de 8px sobre un ancho de 310px
const j = pick(SP, 'Vertical=False, Side text=True, Size=8px'); // 100 × 8
j.resize(310, 8);   // el 8 se conserva, el 100 pasa a 310
```

> Si el resize altera el eje de `Size`, la anotación miente: dice `16px` y mide otra
> cosa. Verificar `width`/`height` después de cada `resize`.

### `Element Measure`

Acá `Vertical` sí coincide con la dimensión medida.

| Quiero medir | Variante | Instancia | Resize |
|---|---|---|---|
| Un **ancho** | `Vertical=False, Side=True` | `100 × 24` | `resize(ancho, 24)` |
| Un **alto** | `Vertical=True, Side=True` | `24 × 100` | `resize(24, alto)` |

El `24` es el grosor del corchete: constante, nunca se modifica. El valor va por texto
en `Text#17:0`, así que **admite decimales** — `57.38px` se escribe tal cual.

| Componente | Valor exacto | Cuándo usarlo |
|---|---|---|
| `Spacing` | No — lista cerrada | La medida cae en la escala |
| `Element Measure` | **Sí** — campo de texto | Cualquier otro caso |

### Restricción de `Spacing`

`Size` es una lista cerrada de múltiplos: `4, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80`.

| Medida real | Acción |
|---|---|
| Está en la lista | Usar el variant |
| No está (ej. `12px`, `13px`) | **No redondear.** Usar `Element Measure` con el valor exacto en el campo de texto |

Redondear una medida para que entre en el kit produce una anotación falsa. B2 aplica
igual sobre el canvas que sobre el documento.

---

## Dónde se Trabaja

| Página | Rol | ¿Se escribe? |
|---|---|---|
| `Componentes` | Librería. De acá se **toman** instancias | **Nunca** |
| `Handoff` | Anotaciones, documentación, entregables | Sí |

Antes de crear cualquier nodo, verificar la página de destino. `figma.currentPage`
puede ser la librería si el usuario la tenía abierta.

```javascript
await figma.loadAllPagesAsync();
const destino = figma.root.children.find(p => p.name === 'Handoff');
if (!destino) return { error: 'No existe la página Handoff. Preguntar al usuario.' };
destino.appendChild(seccion);
```

Los component sets se leen desde donde estén — leer no ensucia. Lo que nunca va a la
librería es una sección de trabajo.

> Si aparecen artefactos de trabajo en la librería, **moverlos, no borrarlos**. Pueden
> ser del usuario. Reubicar y avisar.

---

## Escala — Nunca Reescalar una Anotación

`rescale()` cambia la geometría **pero no el significado de las etiquetas**. Una
anotación escalada a `1.22` sigue diciendo `342px` mientras dibuja `419px`: el
artefacto se contradice a sí mismo y no hay forma de notarlo leyéndolo.

| Necesidad | Qué hacer |
|---|---|
| La anotación no se lee | **Rehacerla** al ancho final |
| Entra en un bloque más chico | Agrandar el bloque, nunca encoger la anotación |
| El componente cambió de tamaño | Re-extraer del nodo y regenerar |

Regla: el componente dentro de una anotación conserva **siempre** sus medidas reales.
Verificarlo después de cualquier operación de layout.

```javascript
const dentro = red.findOne(c => /Stepper/.test(c.name));
return { w: dentro.width, h: dentro.height };   // debe coincidir con el nodo original
```

Esto vale igual para `resize()` sobre un contenedor con Auto Layout que arrastre a los
hijos. Medir después, siempre.

---

## Preparar el Lienzo

Nunca anotar encima del diseño original. Duplicar a una sección propia.

```javascript
const src = await figma.getNodeByIdAsync('NODE_ID');

let section = figma.currentPage.findOne(n =>
  n.type === 'SECTION' && n.name === 'Handoff — ' + src.name);
if (!section) {
  section = figma.createSection();
  section.name = 'Handoff — ' + src.name;
  const bounds = figma.currentPage.children
    .filter(c => c.id !== section.id)
    .reduce((a, c) => Math.max(a, c.x + c.width), 0);
  section.x = bounds + 200;
  section.y = 0;
  section.resizeWithoutConstraints(src.width + 400, src.height + 400);
}

const copy = src.clone();
section.appendChild(copy);
copy.x = 200;
copy.y = 200;
return { sectionId: section.id, copyId: copy.id, w: copy.width, h: copy.height };
```

Reejecutar sobre una sección existente → borrar sus hijos primero, no acumular.

---

## Instanciar una Anotación

```javascript
const set = await figma.getNodeByIdAsync('SPACING_SET_ID');
const variant = set.children.find(v =>
  v.name === 'Vertical=False, Side text=True, Size=16px');
const inst = variant.createInstance();

const section = await figma.getNodeByIdAsync('SECTION_ID');
section.appendChild(inst);
inst.x = 240;
inst.y = 180;
return { id: inst.id };
```

Componente sin variantes (`Handoff — Note`) → `component.createInstance()` directo.

### Setear texto

```javascript
const inst = await figma.getNodeByIdAsync('INSTANCE_ID');
inst.setProperties({ 'Text#17:0': '342px' });
```

Las claves llevan sufijo de nodeId (`Text#17:0`). Leerlas del descubrimiento, nunca
escribirlas de memoria — cambian entre archivos.

> Editar el texto de una instancia con `node.characters = '...'` **falla en silencio**.
> Siempre `setProperties`.

---

## Posicionamiento

Coordenadas relativas al padre. Para ubicar una anotación junto a una capa anidada,
convertir desde la posición absoluta.

```javascript
const target = await figma.getNodeByIdAsync('TARGET_ID');
const section = await figma.getNodeByIdAsync('SECTION_ID');
const t = target.absoluteBoundingBox;
const s = section.absoluteBoundingBox;
return { relX: t.x - s.x, relY: t.y - s.y, w: t.width, h: t.height };
```

### Convenciones

| Anotación | Dónde |
|---|---|
| Spacing horizontal | Centrado en el gap, `16px` por debajo de la capa |
| Spacing vertical | Centrado en el gap, `16px` a la izquierda |
| Element Measure ancho | `24px` por debajo del borde inferior |
| Element Measure alto | `24px` a la derecha del borde derecho |
| Marker | Esquina superior izquierda de la capa, offset `-12,-12` |
| Text / Note | Columna a la derecha del diseño, apilada verticalmente |

Nunca superponer una anotación sobre otra. Verificar colisiones antes de posicionar.

---

## Markers — Vínculo con el Documento

Los markers son el índice compartido entre canvas y markdown.

| Regla | |
|---|---|
| Secuencia | `A`, `B`, `C`… en orden de lectura: arriba→abajo, izquierda→derecha |
| Correspondencia | La letra del canvas = la fila de Anatomía del documento |
| Color | Uno solo por documento. Cambiar de color solo para separar capas de información |
| Cobertura | Toda fila de Anatomía existe en la leyenda. **No toda fila va al canvas** |

### Qué capa lleva marker en el canvas

Solo las **espacialmente distinguibles**: si dos capas ocupan la misma zona, un marker
para cada una no aclara, confunde.

| Capa | ¿Marker en canvas? |
|---|---|
| Ocupa una zona propia | Sí, con línea guía |
| Contenedor exterior | Sí, marca simple al borde — su límite ya se ve |
| Hijo que llena a su padre (el texto dentro de su bloque) | **No.** Va anidado bajo el padre en la leyenda |

Un marker que no se puede anclar no es un problema de posicionamiento: es señal de que
esa capa **no es hermana de las otras**. Antes de buscarle lugar, revisar la jerarquía.
Sangrar el ítem bajo su padre en la leyenda resuelve lo que ninguna flecha resuelve.

### Marker suelto

```javascript
const set = await figma.getNodeByIdAsync('MARKER_SET_ID');
const variant = set.children.find(v => v.name === 'Type=True, Color=Red');
const inst = variant.createInstance();
inst.setProperties({
  '↪ Marker Letter#26:30': 'A',
  '↪ Marker Text#26:0': 'Flecha atrás'
});
```

### Marker con línea guía

`Handoff — Arrows` con `Marker=Marker` trae círculo **y** línea en una sola instancia.
Preferirlo cuando el marker no puede tocar su capa.

| Variante | Medida | Geometría |
|---|---|---|
| `Type=Vertical, Orientation=True` | `20×64` | Círculo arriba, línea baja `44px` |
| `Type=Vertical, Orientation=False` | `20×64` | Línea arriba, círculo abajo |
| `Type=Horizontal, …` | `155×20` | Línea `135px` + círculo en un extremo |
| `Type=Corner Top / Corner Bottom` | `119×60` | Codo para esquivar otras capas |

Para señalar desde arriba, `Orientation=True` y posicionar en
`y = borde superior de la capa − alto de la guía`, `x = centro de la capa − 10`.

```javascript
const AR = await figma.getNodeByIdAsync('ARROWS_SET_ID');
const v = AR.children.find(c => c.name === 'Type=Vertical, Orientation=True, Marker=Marker, Label=False');
const lead = v.createInstance();
lead.x = targetX + targetW/2 - 10;
lead.y = targetY - 64;

// La letra vive en la instancia anidada — el set de Arrows no la expone
const inner = lead.children.find(c => c.name === 'Handoff — Marker');
inner.setProperties({ '↪ Marker Letter#26:30': 'C', 'Color': 'Red' });
```

> El set `Arrows` **no expone** propiedades de texto: `componentPropertyDefinitions`
> solo trae las variantes. Buscar la instancia anidada `Handoff — Marker` y aplicarle
> `setProperties`. Ahí sí funciona, incluso para la variante `Color` — a diferencia de
> `Etiqueta Tipo` en `design-qa`, este anidado no requiere `swapComponent`.

---

## Qué Anotar y Qué No

### Sobre el canvas
- Medidas de capa: ancho y alto de lo que dev debe fijar
- Gaps y padding del Auto Layout
- Tamaño de íconos
- Markers de anatomía
- Notas de comportamiento que dependen de la posición

### Solo en el documento
- Colores y valores hex — se pierden entre las medidas
- Tipografía completa
- Estados y su cobertura
- Accesibilidad
- API del componente
- Pendientes

Regla: **si dev necesita medirlo, va al canvas. Si necesita leerlo, va al documento.**
Duplicar todo en ambos lados garantiza que se desincronicen.

---

## Verificación Visual

Obligatoria. Toda anotación se valida por captura antes de cerrar.

### Qué herramienta de captura usar

| Herramienta | Lee | Cuándo |
|---|---|---|
| `figma_capture_screenshot` | Estado del plugin — **incluye cambios sin guardar** | Primera opción |
| `figma_take_screenshot` | Estado guardado en la nube — **va con retraso** | Fallback |

`figma_take_screenshot` inmediatamente después de crear nodos devuelve el diseño
**sin las anotaciones**. Si la captura no muestra lo recién creado, no volver a crear
los nodos: verificar por API con una lectura de `section.children` y cambiar de
herramienta.

> `figma_capture_screenshot` puede agotar el timeout de 30s en secciones con muchas
> instancias, incluso con la conexión sana (`figma_get_status` con `probe` en 4ms).
> No es señal de que la anotación falló. Confirmar por API y usar el fallback REST,
> que para entonces ya suele estar sincronizado.

1. Capturar la sección completa
2. Revisar: superposiciones, anotaciones fuera del encuadre, flechas que no apuntan
   a la capa correcta, markers duplicados o fuera de secuencia
3. Corregir y repetir — máximo 3 iteraciones
4. Captura final para confirmar

Si tras 3 iteraciones sigue habiendo superposiciones, ampliar la sección y redistribuir
en lugar de seguir ajustando posiciones individuales.

---

## Limpieza ante Fallo

Un error a mitad de la anotación deja instancias huérfanas.

```javascript
const section = await figma.getNodeByIdAsync('SECTION_ID');
for (const c of [...section.children]) {
  if (/^Handoff/.test(c.name)) c.remove();
}
return { remaining: section.children.length };
```

Reintentar siempre desde lienzo limpio, nunca sobre una anotación a medio construir.
