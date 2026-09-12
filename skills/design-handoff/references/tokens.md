# Tokens — Mapeo de Valor Crudo a Token

Un documento de handoff con hex sueltos obliga a dev a decidir. Un documento con
tokens le dice qué usar. El objetivo es que **cero valores crudos** lleguen al doc.

---

## Jerarquía de Resolución

Aplicar en orden. El primero que resuelve, gana.

| # | Vía | Cómo | Confianza |
|---|-----|------|-----------|
| 1 | `boundVariables` del nodo | `extraction.md` → Tokens Ligados | Exacta |
| 2 | Style ID (`fillStyleId`, `textStyleId`, `effectStyleId`) | resolver con `getStyleByIdAsync` | Exacta |
| 3 | Match por valor en la colección de variables | comparar hex/número contra todos los tokens | Alta |
| 4 | Sin match | valor crudo + gap Advertencia | — |

Nunca saltar del 1 al 3. Si el nodo tiene variable ligada, esa es la respuesta aunque
otro token tenga el mismo valor.

---

## Resolver Style ID

```javascript
const n = await figma.getNodeByIdAsync('NODE_ID');
const out = {};
for (const key of ['fillStyleId', 'strokeStyleId', 'effectStyleId', 'textStyleId', 'gridStyleId']) {
  const id = n[key];
  if (id && id !== figma.mixed) {
    const style = await figma.getStyleByIdAsync(id);
    out[key] = { id, name: style?.name, description: style?.description };
  }
}
return out;
```

El `name` del style suele venir con jerarquía (`Color/Accent/Default`) — se usa tal cual.

---

## Match por Valor

Solo cuando 1 y 2 fallan. Trae todas las variables y busca coincidencia exacta.

```javascript
function toHex(c) {
  const h = v => Math.round(v * 255).toString(16).padStart(2, '0');
  return '#' + h(c.r) + h(c.g) + h(c.b);
}

const TARGET = '#e8603c';   // en minúscula
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const matches = [];

for (const col of collections) {
  for (const vid of col.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(vid);
    if (v?.resolvedType !== 'COLOR') continue;
    for (const [modeId, val] of Object.entries(v.valuesByMode)) {
      if (val?.type === 'VARIABLE_ALIAS') continue;
      if (val && toHex(val) === TARGET) {
        const mode = col.modes.find(m => m.modeId === modeId);
        matches.push({ collection: col.name, name: v.name, mode: mode?.name });
      }
    }
  }
}
return matches;
```

Para números (spacing, radius, size) reemplazar el filtro por `resolvedType === 'FLOAT'`
y comparar `val === TARGET_NUMBER`.

### Interpretar el resultado

| Resultado | Acción |
|---|---|
| 1 match | Usar ese token |
| Varios matches | Elegir el semántico sobre el primitivo (`color/accent/default` > `orange/500`). Si sigue ambiguo → gap |
| 0 matches | Valor crudo + gap Advertencia |

---

## Primitivo vs Semántico

Preferir siempre el semántico en el documento. El primitivo es implementación interna
del design system.

```
color/accent/default          ← usar este
  └─ orange/500 (#E8603C)     ← no este
```

Detección: si un token tiene `valuesByMode` con `type: 'VARIABLE_ALIAS'`, es semántico
y apunta a un primitivo. Resolver el alias para mostrar el valor final:

```javascript
const v = await figma.variables.getVariableByIdAsync('VAR_ID');
const modeId = Object.keys(v.valuesByMode)[0];
let val = v.valuesByMode[modeId];
const chain = [v.name];
while (val?.type === 'VARIABLE_ALIAS') {
  const next = await figma.variables.getVariableByIdAsync(val.id);
  chain.push(next.name);
  val = next.valuesByMode[Object.keys(next.valuesByMode)[0]];
}
return { chain, finalValue: val };
```

En el documento se escribe el primero de la cadena, con el valor final entre paréntesis.

---

## Modos — Light / Dark

Si la colección tiene más de un modo, el documento debe listar el valor por modo.

```javascript
const col = (await figma.variables.getLocalVariableCollectionsAsync())
  .find(c => c.name === 'COLLECTION_NAME');
return { modes: col.modes.map(m => ({ id: m.modeId, name: m.name })) };
```

Componente con token multi-modo → la tabla de color lleva una columna por modo.
Componente con valor crudo en un DS multi-modo → **gap Bloqueante**: no se puede
resolver el dark mode sin decisión del usuario.

---

## Formato en el Documento

| Situación | Cómo se escribe |
|---|---|
| Token resuelto | `color/accent/default` `#E8603C` |
| Token multi-modo | `color/surface/base` — light `#FFFFFF` / dark `#1A1A1A` |
| Match por valor (vía 3) | `spacing/md` `16px` `[match por valor]` |
| Sin token | `#E8603C` `⚠ sin token` |

El marcador `⚠ sin token` queda visible en el doc a propósito — le señala al equipo
de DS una deuda pendiente.

---

## Escalas Comunes

Al mapear números, verificar que el valor pertenezca a la escala del DS. Un `13px`
en una escala de múltiplos de 4 es un error de diseño, no un token faltante →
reportarlo como gap.

```javascript
const SCALE_STEP = 4;
const value = 13;
const isOnScale = value % SCALE_STEP === 0;
return { value, isOnScale, nearest: Math.round(value / SCALE_STEP) * SCALE_STEP };
```

Fuera de escala → gap Advertencia: "13px no pertenece a la escala de 4. ¿Es intencional
o debería ser 12px?"
