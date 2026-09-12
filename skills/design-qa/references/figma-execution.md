# Figma Execution — Patrones de Código

Todos los patrones asumen que ya se corrió el **Paso 0** de `references/components.md` y que
existen los nodos resueltos por nombre. **Ningún ID hardcodeado.**

```javascript
await figma.loadAllPagesAsync();
const COMMENT  = figma.root.findOne(n => n.name === 'Comment' && n.type === 'COMPONENT');
const ETIQUETA = figma.root.findOne(n => n.name === 'Etiqueta Tipo' && n.type === 'COMPONENT_SET');
```

La **sección QA** también se resuelve por nombre y cambia según el proyecto. Preguntarle al
usuario cuál es si hay más de una candidata; no asumir.

```javascript
const SECTION = figma.currentPage.findOne(n => n.type === 'SECTION' && /Desarrollo/.test(n.name));
```

Las **claves de propiedad** (`Number#23:8`, `Heading#24:0`, `Comment#23:5`) sí son estables
entre archivos porque provienen del mismo componente de librería. Verificarlas igual con
`COMMENT.componentPropertyDefinitions` si algo no responde.

---

## Verificar Número Correlativo

```javascript
const numbers = SECTION.children
  .map(c => parseInt(c.componentProperties?.['Number#23:8']?.value || '0'))
  .filter(n => !isNaN(n) && n > 0);
const next = numbers.length ? Math.max(...numbers) + 1 : 1;
const padded = String(next).padStart(2, '0');   // '01', '02', ...
```

---

## Crear una Observación

```javascript
// 1. Clonar desde el MAIN component, nunca desde una instancia
const obs = COMMENT.clone();
SECTION.appendChild(obs);

// 2. Posicionar después del último hermano
const siblings = SECTION.children.filter(c => c.id !== obs.id);
const last = siblings[siblings.length - 1];
obs.x = last ? last.x + last.width + 24 : 24;
obs.y = last ? last.y : 24;

// 3. Textos y severidad
obs.setProperties({
  'Number#23:8':  padded,
  'Heading#24:0': 'Componente — descripción corta',
  'Comment#23:5': 'Problema: descripción.\nCorrección: qué debe quedar.',
  'Type': 'Problema mayor'          // o 'Problema menor' / 'Nota'
});

// 4. Etiqueta Tipo — SIEMPRE swapComponent
const etiqueta = obs.children.find(c => c.name === 'Etiqueta Tipo');
const variante = ETIQUETA.children.find(v => v.name.includes('Jerarquía Visual'));
etiqueta.swapComponent(variante);

return { id: obs.id, number: padded };
```

Clonar desde el main component y no desde una instancia existente evita heredar propiedades mal
inicializadas.

---

## Buscar Observación por Número

```javascript
const obs = SECTION.children.find(c =>
  c.componentProperties?.['Number#23:8']?.value === '07'   // con padding
);
```

---

## Editar Observación Existente

```javascript
obs.setProperties({
  'Heading#24:0': 'Nuevo título',
  'Comment#23:5': 'Problema actualizado.\nCorrección actualizada.'
});

obs.setProperties({ 'Type': 'Problema menor' });

// Etiqueta Tipo — siempre swapComponent
const etiqueta = obs.children.find(c => c.name === 'Etiqueta Tipo');
etiqueta.swapComponent(ETIQUETA.children.find(v => v.name.includes('Manejo de Errores')));
```

---

## Reparar Etiqueta Tipo con `componentProperties` vacío

Instancias clonadas antes de que el component set estuviera corregido muestran `{}`. Solución:
`swapComponent` al variant correcto.

```javascript
const variantMap = {};
for (const v of ETIQUETA.children) variantMap[v.name.replace('Estado=', '')] = v;
const etiqueta = obs.children.find(c => c.name === 'Etiqueta Tipo');
etiqueta.swapComponent(variantMap['Jerarquía Visual y Consistencia']);
```

---

## Leer Nodo para Specs

```javascript
const node = await figma.getNodeByIdAsync(nodeId);

const width  = node.width;      // exacto, sin redondear
const height = node.height;
const radius = node.cornerRadius;

// Color + token
const fill = node.fills?.find(f => f.type === 'SOLID');
const hex = fill ? '#' + ['r','g','b']
  .map(k => Math.round(fill.color[k] * 255).toString(16).padStart(2, '0')).join('').toUpperCase() : null;
const tokenId = fill?.boundVariables?.color?.id;
const token = tokenId ? (await figma.variables.getVariableByIdAsync(tokenId))?.name : null;

// Tipografía (nodo TEXT)
const { fontSize, lineHeight, textAlignHorizontal } = node;

return { width, height, radius, hex, token, fontSize, lineHeight };
```

Reportar **token + hex**. Un color sin token es un hallazgo, no un detalle.

---

## Leer Árbol de Hijos

```javascript
const node = await figma.getNodeByIdAsync(nodeId);
const children = (node.children || []).map(c => ({
  id: c.id, name: c.name, type: c.type, width: c.width, height: c.height
}));
return { id: node.id, name: node.name, width: node.width, height: node.height, children };
```

Un nivel por vez. `async` recursivo tira `Cannot unwrap symbol`.

---

## Leer Frame de Desarrollo por Nombre Numérico

```javascript
const devFrame = figma.currentPage.findOne(n => n.name === '1' && n.type === 'FRAME');
```

---

## Notas Importantes

- **`swapComponent` vs `setProperties`**: Etiqueta Tipo no está expuesta como propiedad de nivel
  superior del Comment. Siempre `swapComponent`.
- **Instancias**: para editar texto de una instancia usar `setProperties`. La edición directa
  del nodo puede fallar en silencio — salvo textos anidados no expuestos como propiedad, que sí
  se editan directo.
- **Fuentes**: `loadFontAsync` antes de tocar cualquier texto.
- **Cerrar con screenshot.** → `references/figma-gotchas.md`
