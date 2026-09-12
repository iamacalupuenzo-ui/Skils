# Trampas de Figma — Errores Verificados en Sesión

Cada entrada de este archivo costó tiempo real. Leerlo antes de escribir código de Figma.

---

## Render y validación visual

### Los drop shadows no renderizan en los exports
Un `DROP_SHADOW` con `spread` se aplica (los `absoluteRenderBounds` se expanden correctamente)
pero **no aparece en ningún export** — ni REST (`figma_take_screenshot`) ni plugin
(`figma_capture_screenshot`). Verificado con una sombra roja de 8px: bounds +16, cero píxeles.

**Consecuencia:** nunca usar drop shadow para nada que deba verse en la documentación —
anillos de foco, halos, resaltados. Un indicador que desaparece al exportar es inservible para
handoff.

**Alternativa:** borde con `strokeAlign: 'OUTSIDE'`. Renderiza siempre, no altera el box model
y equivale a un `outline` en código.

```javascript
node.strokes = [{ type:'SOLID', color: rgb('#0E3D99') }];
node.strokeWeight = 2;
node.strokeAlign = 'OUTSIDE';
```

### Un frame sin relleno no proyecta sombra
La sombra se genera desde la geometría pintada. Un frame con `fills: []` y sin stroke no
proyecta nada, aunque el efecto figure aplicado. Si tiene stroke, la sombra sale del stroke.

### El export a nivel de nodo recorta al bounding box
`figma_take_screenshot` y `figma_capture_screenshot` sobre un nodo individual cortan todo lo que
se salga de su caja: bordes OUTSIDE, sombras, líneas guía.

**Para validar algo que sobresale, capturar el nodo padre**, no el nodo.

### El screenshot REST cachea por parámetros
Dos llamadas con el mismo `nodeId` y `scale` devuelven la imagen cacheada aunque el diseño haya
cambiado (se detecta por `byteLength` idéntico). **Cambiar el `scale` para forzar un render
nuevo.** `scale` máximo aceptado: `4`.

### Un timeout NO significa que la operación no se ejecutó

`figma_execute` puede devolver `Execution timed out after 30000ms` y **la operación termina
igual en Figma, unos segundos después**. Peor: una consulta de verificación lanzada
inmediatamente después puede no verla todavía y hacer creer que no pasó nada.

Reintentar a ciegas duplica todo. En una sesión esto creó dos secciones y dos paneles completos,
ubicados después del footer.

**Ante un timeout:**
1. Esperar y verificar **por nombre**, no asumir.
2. Hacer toda creación idempotente — comprobar si ya existe antes de crear:
   ```javascript
   let panel = doc.children.find(c => c.name === nombre);
   if (!panel) { panel = figma.createFrame(); panel.name = nombre; /* … */ }
   ```
3. Si aparecen duplicados, comparar `children.length` y altura antes de borrar: **los dos pueden
   estar completos**, no siempre el segundo es el vacío.

Partir las operaciones pesadas en llamadas chicas reduce los timeouts, pero no elimina el
riesgo: la idempotencia sí.

### El plugin export hace timeout en nodos grandes
`figma_capture_screenshot` da `timed out after 30000ms` en frames grandes (un component set de
18 variantes, una página de documentación completa). Para nodos grandes usar REST; el plugin
export sirve para nodos chicos donde importa ver el estado actual sin caché.

### Aplicar ≠ renderizar
Que `setProperties` o una asignación no tiren error **no significa que se vea**. Leer la
propiedad de vuelta confirma que se aplicó, no que renderiza. **Cerrar siempre con screenshot.**
En esta sesión un anillo de foco quedó aplicado, verificado por lectura, y era invisible.

---

## API

### `documentAccess: dynamic-page`
Estos accesos síncronos fallan. Usar la versión async:

| Falla | Usar |
|-------|------|
| `node.mainComponent` | `await node.getMainComponentAsync()` |
| acceso a otras páginas | `await figma.loadAllPagesAsync()` primero |

### `async` recursivo rompe el bridge
Funciones de lectura profunda con `async` recursivo tiran `Cannot unwrap symbol`. Leer un nivel
de hijos a la vez.

### Fuentes antes de tocar texto
Cualquier cambio de `characters`, `fontSize` o `lineHeight` requiere la fuente cargada:

```javascript
const fonts = new Set();
root.findAll(n => n.type === 'TEXT').forEach(t => fonts.add(JSON.stringify(t.fontName)));
for (const f of fonts) { try { await figma.loadFontAsync(JSON.parse(f)); } catch(e) {} }
```

### Las claves de propiedad cambian entre variantes del mismo set
Un nodo con el mismo nombre puede responder a una clave distinta según la variante
(`Content#23:78` en `layout=Hero` vs `Content#24:2485` en `layout=Cards`). `setProperties` con
la clave equivocada **no falla** — simplemente no hace nada y queda el texto default.

**Ante cualquier texto que no cambió: setear el nodo TEXT hijo directo.**

### Los textos anidados no siempre son propiedades
En instancias, un TEXT que no está expuesto como propiedad se edita directo por
`findOne(n => n.type === 'TEXT' && n.name === '...')`. Aplica a `_Design system header`,
a las tarjetas de `Section layout=Cards` y a la letra de `Handoff — Marker`.

### Nodos de texto con ancho fijo recortan
No hay error ni advertencia: el texto sobrante desaparece con `…`. Verificar por screenshot.

### Autolayout en component sets
Un `COMPONENT_SET` con `layoutMode` posiciona solo los hijos nuevos: `set.appendChild(clone)`
alcanza, no hay que calcular x/y.

---

## Variables y tokens

### Las colecciones remotas son de solo lectura
`figma.variables.getLocalVariableCollectionsAsync()` puede devolver `[]` aunque el archivo use
tokens: vienen de una librería publicada. **No se pueden crear variables en una colección
remota desde el archivo consumidor** — solo se puede forkear con una colección local, que es
una decisión de sistema, no una corrección técnica.

Si falta un token, **documentarlo como pendiente para el dueño de la librería**. No inventar
hex y no forkear sin pedirlo.

### Catalogar los tokens realmente disponibles
Antes de proponer "usar el token X", verificar que exista. Escanear los que el archivo ya usa:

```javascript
await figma.loadAllPagesAsync();
const ids = new Set();
const collect = bv => { if (!bv) return; for (const k of Object.keys(bv)) {
  const v = bv[k]; if (Array.isArray(v)) v.forEach(x => x && x.id && ids.add(x.id));
  else if (v && v.id) ids.add(v.id); } };
for (const page of figma.root.children) for (const n of page.findAll(() => true)) {
  collect(n.boundVariables);
  for (const f of (n.fills && n.fills.length ? n.fills : [])) collect(f.boundVariables);
  for (const s of (n.strokes && n.strokes.length ? n.strokes : [])) collect(s.boundVariables);
}
const out = [];
for (const id of ids) { const v = await figma.variables.getVariableByIdAsync(id);
  if (v) out.push({ name: v.name, type: v.resolvedType, remote: v.remote }); }
return out.sort((a, b) => a.name.localeCompare(b.name));
```

### Atar un color a un token
```javascript
const v = await figma.variables.getVariableByIdAsync(varId);
const paint = figma.variables.setBoundVariableForPaint(
  { type:'SOLID', color: rgb('#1257CC') }, 'color', v);
node.fills = [paint];
```

Al leer specs, reportar **token + hex**, no solo el hex. Un color sin token es un hallazgo.

---

## Conexión

- El plugin Desktop Bridge se conecta **por archivo**. Si el archivo objetivo no lo tiene
  abierto, `figma_navigate` devuelve `websocket_file_not_connected` — pedirle al usuario que
  abra el plugin en ese archivo. No hay forma de hacerlo remotamente.
- `figma_list_open_files` muestra qué archivos están conectados y cuál está activo.
- Verificar **siempre** el nombre del archivo activo antes de escribir. El plugin puede estar
  apuntando a otro proyecto.
