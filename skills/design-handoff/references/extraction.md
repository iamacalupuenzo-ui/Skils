# Extraction — Patrones de Código Figma

Todos los patrones usan `figma_execute`. Regla transversal: **un nivel de profundidad
por llamada**. El async recursivo rompe con "Cannot unwrap symbol".

---

## Árbol de Anatomía

Primer paso siempre. Da el mapa de qué capas hay que extraer.

```javascript
const node = await figma.getNodeByIdAsync('NODE_ID');
const children = node.children?.map(c => ({
  id: c.id,
  name: c.name,
  type: c.type,          // FRAME, TEXT, VECTOR, INSTANCE, COMPONENT_SET...
  width: c.width,
  height: c.height,
  visible: c.visible,
  layoutMode: c.layoutMode || null,
  hasChildren: (c.children?.length || 0) > 0
})) || [];

return {
  id: node.id, name: node.name, type: node.type,
  width: node.width, height: node.height,
  children
};
```

Repetir sobre cada hijo con `hasChildren: true`.

---

## Box Model — Medidas y Auto Layout

Lo que dev necesita para reproducir el layout sin adivinar.

```javascript
const n = await figma.getNodeByIdAsync('NODE_ID');
return {
  width: n.width,
  height: n.height,

  // Auto Layout — si layoutMode es NONE, el layout es absoluto
  layoutMode: n.layoutMode,                    // 'HORIZONTAL' | 'VERTICAL' | 'NONE'
  itemSpacing: n.itemSpacing,                  // gap entre hijos
  counterAxisSpacing: n.counterAxisSpacing,    // gap en wrap
  layoutWrap: n.layoutWrap,                    // 'NO_WRAP' | 'WRAP'
  padding: {
    top: n.paddingTop, right: n.paddingRight,
    bottom: n.paddingBottom, left: n.paddingLeft
  },
  primaryAxisAlignItems: n.primaryAxisAlignItems,   // MIN|CENTER|MAX|SPACE_BETWEEN
  counterAxisAlignItems: n.counterAxisAlignItems,   // MIN|CENTER|MAX|BASELINE

  // Sizing — se traduce a hug / fill / fixed
  primaryAxisSizingMode: n.primaryAxisSizingMode,   // 'AUTO' = hug, 'FIXED' = fijo
  counterAxisSizingMode: n.counterAxisSizingMode,
  layoutGrow: n.layoutGrow,                    // 1 = fill container
  layoutAlign: n.layoutAlign,                  // 'STRETCH' = fill en contra-eje

  // Constraints — solo relevante si layoutMode === 'NONE'
  constraints: n.constraints,

  // Límites
  minWidth: n.minWidth, maxWidth: n.maxWidth,
  minHeight: n.minHeight, maxHeight: n.maxHeight
};
```

### Traducción a lenguaje de dev

| Figma | CSS / Dev |
|---|---|
| `primaryAxisSizingMode: 'AUTO'` | `width: fit-content` (hug) |
| `layoutGrow: 1` | `flex: 1` (fill) |
| `layoutAlign: 'STRETCH'` | `align-self: stretch` |
| `primaryAxisAlignItems: 'SPACE_BETWEEN'` | `justify-content: space-between` |
| `layoutMode: 'NONE'` | posicionamiento absoluto — reportar x/y y constraints |

---

## Fills — Fondos y Colores

Cubre sólido y gradiente. Nunca reportar solo el primer fill sin verificar el tipo.

```javascript
function toHex(c) {
  const h = v => Math.round(v * 255).toString(16).padStart(2, '0');
  return '#' + h(c.r) + h(c.g) + h(c.b);
}

const n = await figma.getNodeByIdAsync('NODE_ID');
const fills = (n.fills === figma.mixed ? [] : n.fills || []).map(f => {
  const base = { type: f.type, visible: f.visible, opacity: f.opacity, blendMode: f.blendMode };
  if (f.type === 'SOLID') {
    return { ...base, hex: toHex(f.color), alpha: f.opacity ?? 1 };
  }
  if (f.type.startsWith('GRADIENT')) {
    return {
      ...base,
      stops: f.gradientStops.map(s => ({ hex: toHex(s.color), alpha: s.color.a, position: s.position })),
      transform: f.gradientTransform
    };
  }
  if (f.type === 'IMAGE') {
    return { ...base, scaleMode: f.scaleMode, imageHash: f.imageHash };
  }
  return base;
});

return { fills, fillsMixed: n.fills === figma.mixed, boundVariables: n.boundVariables?.fills || null };
```

`boundVariables.fills` es la vía directa al token. Ver `tokens.md`.

---

## Strokes — Bordes

```javascript
const n = await figma.getNodeByIdAsync('NODE_ID');
return {
  strokes: (n.strokes || []).map(s => ({
    type: s.type,
    hex: s.type === 'SOLID' ? toHex(s.color) : null,
    alpha: s.opacity ?? 1
  })),
  strokeWeight: n.strokeWeight,           // figma.mixed si los lados difieren
  strokeTopWeight: n.strokeTopWeight,
  strokeRightWeight: n.strokeRightWeight,
  strokeBottomWeight: n.strokeBottomWeight,
  strokeLeftWeight: n.strokeLeftWeight,
  strokeAlign: n.strokeAlign,             // INSIDE | OUTSIDE | CENTER
  dashPattern: n.dashPattern              // [] = línea sólida
};
```

`strokeAlign: 'INSIDE'` → `box-sizing: border-box`. `OUTSIDE` → `outline`, no `border`.

---

## Effects — Sombras, Blur

```javascript
const n = await figma.getNodeByIdAsync('NODE_ID');
const effects = (n.effects || []).filter(e => e.visible).map(e => {
  if (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') {
    return {
      type: e.type,
      x: e.offset.x, y: e.offset.y,
      blur: e.radius,
      spread: e.spread || 0,
      hex: toHex(e.color),
      alpha: e.color.a,
      css: `${e.type === 'INNER_SHADOW' ? 'inset ' : ''}${e.offset.x}px ${e.offset.y}px ${e.radius}px ${e.spread || 0}px rgba(${Math.round(e.color.r*255)}, ${Math.round(e.color.g*255)}, ${Math.round(e.color.b*255)}, ${e.color.a.toFixed(2)})`
    };
  }
  return { type: e.type, radius: e.radius };  // LAYER_BLUR | BACKGROUND_BLUR
});

return { effects, boundVariables: n.boundVariables?.effects || null };
```

El campo `css` va directo al documento — es lo que dev copia.

---

## Corner Radius

```javascript
const n = await figma.getNodeByIdAsync('NODE_ID');
return {
  cornerRadius: n.cornerRadius,   // figma.mixed si las esquinas difieren
  topLeft: n.topLeftRadius,
  topRight: n.topRightRadius,
  bottomRight: n.bottomRightRadius,
  bottomLeft: n.bottomLeftRadius,
  cornerSmoothing: n.cornerSmoothing   // squircle iOS — dev debe saberlo
};
```

Si `cornerRadius === figma.mixed`, reportar las cuatro esquinas por separado.

---

## Tipografía

```javascript
const n = await figma.getNodeByIdAsync('TEXT_NODE_ID');
return {
  characters: n.characters,
  fontName: n.fontName,                    // { family, style }
  fontSize: n.fontSize,
  fontWeight: n.fontWeight,                // 400, 500, 700...
  lineHeight: n.lineHeight,                // { value, unit: 'PIXELS'|'PERCENT'|'AUTO' }
  letterSpacing: n.letterSpacing,          // { value, unit: 'PIXELS'|'PERCENT' }
  paragraphSpacing: n.paragraphSpacing,
  textAlignHorizontal: n.textAlignHorizontal,
  textAlignVertical: n.textAlignVertical,
  textAutoResize: n.textAutoResize,        // NONE|HEIGHT|WIDTH_AND_HEIGHT|TRUNCATE
  textTruncation: n.textTruncation,        // DISABLED | ENDING
  maxLines: n.maxLines,
  textCase: n.textCase,                    // ORIGINAL|UPPER|LOWER|TITLE
  textDecoration: n.textDecoration,
  textStyleId: n.textStyleId,              // vía al text style del DS
  hex: n.fills?.[0]?.type === 'SOLID' ? toHex(n.fills[0].color) : null
};
```

Si alguna propiedad devuelve `figma.mixed`, el texto tiene formato por rango —
extraer con `getStyledTextSegments(['fontSize','fontName','fills'])`.

`textTruncation` y `maxLines` responden el gap "¿qué pasa si el texto es largo?".

---

## Variantes y Estados

```javascript
const set = await figma.getNodeByIdAsync('COMPONENT_SET_ID');
if (set.type !== 'COMPONENT_SET') return { error: 'No es un component set', type: set.type };

return {
  propertyDefinitions: set.componentPropertyDefinitions,
  variants: set.children.map(v => ({
    id: v.id,
    name: v.name,                          // 'Size=Large, State=Hover'
    props: v.variantProperties,            // { Size: 'Large', State: 'Hover' }
    width: v.width,
    height: v.height
  }))
};
```

Cruzar contra la matriz obligatoria de `states.md`.

---

## Instancia — Propiedades Expuestas

Define la API del componente que dev tiene que implementar.

```javascript
const n = await figma.getNodeByIdAsync('INSTANCE_ID');
const main = await n.getMainComponentAsync();
return {
  mainComponent: { id: main?.id, name: main?.name, key: main?.key },
  componentProperties: n.componentProperties,   // { 'Label#1:0': {type:'TEXT', value:'Guardar'} }
  exposedInstances: n.exposedInstances?.map(i => ({ id: i.id, name: i.name })) || []
};
```

---

## Tokens Ligados

```javascript
const n = await figma.getNodeByIdAsync('NODE_ID');
const bound = n.boundVariables || {};
const out = {};
for (const [prop, ref] of Object.entries(bound)) {
  const refs = Array.isArray(ref) ? ref : [ref];
  out[prop] = [];
  for (const r of refs) {
    const v = await figma.variables.getVariableByIdAsync(r.id);
    out[prop].push({ id: r.id, name: v?.name, resolvedType: v?.resolvedType });
  }
}
return out;
```

Propiedad con entrada aquí → usar el nombre del token en el documento.
Propiedad sin entrada → valor crudo + gap tipo Advertencia. Ver `tokens.md`.

---

## Unidad Gráfica — Parámetros de Render

Una unidad gráfica no lista sus capas como anatomía, pero **no es una caja negra**.
Omitir la estructura no autoriza a omitir los valores: dev tiene que dibujarla.

> Regla: si dev necesita el número para renderizar, se extrae — esté o no en la
> anatomía. Una unidad gráfica sin sus parámetros es una spec que se completa
> inventando. Ver B2.

### Qué extraer siempre

| Parámetro | De dónde |
|---|---|
| Tamaño del contenedor | `width` / `height` del frame |
| Diámetro o caja de cada forma | `width` de la elipse / rectángulo |
| **Grosor de cada trazo** | `strokeWeight` de la forma, no del frame |
| Color de trazo y de relleno | `strokes[]` y `fills[]` de cada forma |
| Texto embebido | fuente, tamaño, interlineado, color, posición |
| Alineación del trazo | `strokeAlign` — cambia el diámetro efectivo |

### Bajar dentro de una operación booleana

El nodo booleano reporta un `fill` propio que **oculta** el de sus hijos. El grosor
real vive en la forma de adentro.

```javascript
const bool = await figma.getNodeByIdAsync('BOOLEAN_ID');
const kids = [];
for (const k of bool.children || []) {
  kids.push({
    name: k.name, type: k.type,
    w: k.width, h: k.height, x: k.x, y: k.y,
    strokeWeight: k.strokeWeight,
    strokeAlign: k.strokeAlign,
    strokes: (k.strokes || []).length,
    fills: (k.fills === figma.mixed ? [] : k.fills || []).length,
    op: k.booleanOperation
  });
}
return { boolOp: bool.booleanOperation, w: bool.width, h: bool.height, kids };
```

| Trampa | Realidad |
|---|---|
| El booleano dice `strokeWeight: 1.1` | Es un valor residual del nodo contenedor |
| El booleano dice `fill: #D41117` | Correcto, pero no dice el **grosor** del anillo |
| Los `RECTANGLE` hijos parecen decorativos | Suelen ser la **máscara** que recorta el progreso |

Un anillo de progreso hecho con `INTERSECT` de un círculo con trazo y rectángulos de
recorte se traduce a `stroke-dasharray`, no a paths exportados. Los rectángulos son la
fracción, no geometría a reproducir.

### Círculo con trazo → SVG

```
radio        = diametroFigma / 2
circunferencia = 2 * Math.PI * radio
```

Con `strokeAlign: 'CENTER'` el diámetro de Figma ya es la línea media del trazo: se usa
tal cual como `r`. Con `INSIDE` u `OUTSIDE` hay que corregir en medio grosor.

**Nunca redondear el radio ni el grosor a un entero "prolijo" al escribir el SVG.**
Un `r=28` donde el nodo dice `28.69` es un valor inventado.

---

## Verificar Centrado — Antes de Reportar un Desvío

Una coordenada distinta de `0` no significa que algo esté descentrado. Calcular
siempre contra el centro ideal.

```javascript
const parent = await figma.getNodeByIdAsync('PARENT_ID');
const child = await figma.getNodeByIdAsync('CHILD_ID');
const ideal = { x: (parent.width - child.width)/2, y: (parent.height - child.height)/2 };
return {
  actual: { x: child.x, y: child.y },
  ideal: { x: Math.round(ideal.x*100)/100, y: Math.round(ideal.y*100)/100 },
  desvio: { x: Math.round((child.x - ideal.x)*100)/100, y: Math.round((child.y - ideal.y)*100)/100 }
};
```

| Desvío | Lectura |
|---|---|
| `< 0.5px` | Centrado. **No reportar** — es redondeo del vector |
| `0.5px` a `1px` | Mencionar como higiene, no como bug |
| `> 1px` | Desvío real. Reportar con el cálculo |

> Caso real: un vector de `16.34×30` en un frame de `24×48` con `x: 4` parece
> descentrado. El centro ideal es `3.83` → desvío de `0.17px`. Está centrado.
> Reportarlo como bug hace que dev use `position: absolute` sin necesidad.

La misma lógica aplica a cualquier afirmación de desalineación: obtener el valor
esperado por cálculo y comparar. Nunca deducirlo de que la coordenada "se ve rara".

---

---

## Componente en Página de Handoff — Contenedor

Cuando se muestra un componente como referencia visual en la página de documentación,
nunca se coloca suelto en el canvas. Va dentro de un contenedor que lo centra.

### Por qué

| Sin contenedor | Con contenedor |
|---|---|
| El componente queda pegado al borde superior izquierdo | Centrado horizontal y verticalmente |
| Se confunde con el fondo de la página | Tiene un "aire" visual que lo separa |
| Difícil agregar anotaciones alrededor | La anotación se posiciona relativa al contenedor |
| Componentes de distinto tamaño se ven desordenados | Todos los componentes se ven como unidades coherentes |

### Código

```javascript
// 1. Obtener o crear el componente
const source = await figma.getNodeByIdAsync('COMPONENT_ID');
const comp = source.type === 'INSTANCE'
  ? source.clone()           // clonar instancia
  : source.createInstance(); // o crear desde variant

// 2. Crear contenedor
const contenedor = figma.createFrame();
contenedor.name = 'Componente — ' + comp.name;
contenedor.resize(800, Math.max(180, comp.height + 124));
contenedor.fills = [];               // transparente
contenedor.layoutMode = 'NONE';       // posicionamiento absoluto
contenedor.clipsContent = false;      // no cortar

// 3. Centrar componente
contenedor.appendChild(comp);
comp.x = Math.round((contenedor.width - comp.width) / 2);
comp.y = 62;

// 4. Insertar en la página
pagina.appendChild(contenedor);
```

### Altura del contenedor

| Componente | Alto del comp | Cálculo | Contenedor |
|---|---|---|---|
| Chico (botón, badge) | `24-48px` | `24 + 124 = 148` → mínimo `180` | `800 × 180` |
| Mediano (input, card) | `56-120px` | `72 + 124 = 196` | `800 × 196` |
| Grande ( Verification code) | `72px` | `72 + 124 = 196` | `800 × 200` |
| Muy grande (>300px) | `400px` | `400 + 80` → reducir padding | `800 × 480` |

### Excepción

No se envuelve si el componente **ya es un frame de página completa** (ej. layout
de 800px con su propio padding). Envolverlo agregaría una capa sin propósito.

### Regla de verificación

Después de centrar, verificar por cálculo:

```javascript
const esperado = (contenedor.width - comp.width) / 2;
if (Math.abs(comp.x - esperado) > 0.5) {
  // Hay un desvío — corregir
  comp.x = Math.round(esperado);
}
```

---

## Screenshot de Apoyo

```
figma_take_screenshot sobre el nodeId
```

Solo para ilustrar el documento. **Nunca es fuente de medidas** — todo valor viene
del nodo. Un screenshot en el doc sirve para que dev reconozca el componente, no
para que mida sobre él.
