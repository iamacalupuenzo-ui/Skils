# Gaps — Qué se Extrae, Qué se Infiere, Qué se Pregunta

Define el límite exacto entre lo que la skill resuelve sola y dónde interviene el
usuario. Sin este límite el documento se llena de valores plausibles pero falsos —
peor que un documento incompleto, porque dev los implementa sin dudar.

---

## Clasificación de Todo Dato del Documento

| Origen | Marcador | Regla |
|--------|----------|-------|
| **Extraído** | ninguno | Leído del nodo. Se escribe sin marcador porque es el caso normal |
| **Derivado** | `[derivado]` | Calculado con una regla del DS que el usuario confirmó. Se muestra el cálculo |
| **Inferido** | `[inferido]` | Deducido de un patrón observado en otros componentes. Requiere OK del usuario |
| **Pendiente** | `⛔ TODO` | No existe y no se puede derivar. Bloquea la implementación de esa sección |
| **Sin token** | `⚠ sin token` | Solo si el proyecto documenta con tokens. Por defecto **no se usa**: ver Política de Tokens en el orquestador y D3 en `decisiones.md` |

Regla dura: **ningún dato del documento carece de origen**. Si no encaja en ninguna
de las cinco filas, no se escribe.

---

## Identificación del Nodo

Antes de cualquier extracción.

### Con URL
```
figma.com/design/ABC/File?node-id=7-22946
                              ↑ convertir a '7:22946'
```
El separador en la URL es `-`, la API usa `:`.

### Sin URL
```javascript
await figma.loadAllPagesAsync();
const found = figma.root.findAll(n =>
  (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') &&
  n.name.toLowerCase().includes('button')
).map(n => ({ id: n.id, name: n.name, type: n.type, page: n.parent?.name }));
return found;
```

| Resultado | Acción |
|---|---|
| 1 match | Confirmar con el usuario antes de documentar |
| Varios | Tabla de opciones, esperar elección |
| 0 | Pedir URL. **No documentar desde screenshot** — B1 |

### Instancia vs Main Component

Documentar siempre el **main component**, no la instancia. Una instancia puede tener
overrides que no representan el componente.

```javascript
const n = await figma.getNodeByIdAsync('NODE_ID');
if (n.type === 'INSTANCE') {
  const main = await n.getMainComponentAsync();
  return {
    warning: 'Es una instancia',
    instanceId: n.id,
    mainId: main?.id,
    mainSetId: main?.parent?.type === 'COMPONENT_SET' ? main.parent.id : null,
    overrides: n.overrides?.length || 0
  };
}
return { type: n.type, ok: true };
```

Si hay `mainSetId`, documentar el component set — trae todas las variantes.

---

## Qué NO Está en Figma

Ningún archivo de Figma responde estas preguntas. Son las que generan gaps
sistemáticamente. Revisar la lista completa en cada componente.

| Categoría | Preguntas | Tipo |
|---|---|---|
| **Contenido** | ¿Qué pasa si el texto excede? ¿Truncar, wrap, scroll? ¿Largo máximo? | Bloqueante |
| **Responsive** | ¿Cómo se comporta bajo el breakpoint diseñado? ¿Se apila? ¿Cambia de size? | Bloqueante |
| **Interacción** | Duración y easing de transiciones. ¿Hay feedback háptico en mobile? | Advertencia |
| **A11y** | Rol ARIA, label accesible, orden de foco, anuncio al lector de pantalla | Bloqueante |
| **Datos** | ¿De dónde viene el contenido? ¿Es async? ¿Qué se muestra mientras carga? | Bloqueante si async |
| **Errores** | ¿Qué se muestra si el dato falla? ¿Reintento? | Bloqueante si async |
| **Vacío** | ¿Qué se muestra sin datos? | Bloqueante en listas |
| **Permisos** | ¿Se oculta o se deshabilita según rol? | Advertencia |
| **i18n** | ¿Soporta RTL? ¿El layout aguanta textos 30% más largos? | Advertencia |

Parte de esto sí se extrae — `textTruncation`, `maxLines` y `minWidth/maxWidth` están
en el nodo (ver `extraction.md`). Extraer primero, preguntar solo lo que quedó vacío.

---

## Reglas de Inferencia Permitida

Inferir solo con evidencia dentro del mismo archivo, nunca por conocimiento general.

### Permitido
- El patrón se repite en **3 o más componentes** del mismo archivo → inferir y marcar `[inferido]`
- Existe un token que cubre el caso y ningún otro compite → usar el token
- El component set tiene el estado en otra variante del mismo set → extraerlo de ahí

### Prohibido
- "Los botones normalmente tienen hover más oscuro" → conocimiento general, no evidencia
- "Material Design usa 200ms" → otro design system, no este
- Copiar el valor de un componente visualmente parecido pero de otra familia
- Rellenar un estado faltante con el valor del default más un ajuste estimado

### Verificar un patrón antes de inferir

```javascript
await figma.loadAllPagesAsync();
const sets = figma.root.findAll(n => n.type === 'COMPONENT_SET');
const withHover = sets.filter(s =>
  s.children.some(v => /hover/i.test(v.name))
);
return {
  totalSets: sets.length,
  withHover: withHover.length,
  names: withHover.map(s => s.name).slice(0, 10)
};
```

3+ ocurrencias → el patrón existe, se puede inferir declarándolo.
Menos de 3 → no hay patrón, es un gap.

---

## Presentación de Gaps al Usuario

Una sola tabla, ordenada por tipo. Bloqueantes primero.

```
Gaps — Button
| # | Qué falta | Tipo | Propuesta |
|---|-----------|------|-----------|
| 1 | Estado focus no diseñado | Bloqueante | ¿Regla global de focus ring en el DS? |
| 2 | Comportamiento con label largo | Bloqueante | textTruncation está en DISABLED. ¿Trunca o wrap? |
| 3 | Duración de transición | Advertencia | Sin prototipo. ¿Hay token de motion? |
| 4 | #E8603C sin token en el fondo | Advertencia | Sugiero color/accent/default |

Respondé 1 y 2 para que pueda escribir el documento.
Las advertencias las documento marcadas si preferís avanzar.
```

### Reglas de la tabla
- Una fila = un gap. No agrupar
- La propuesta es una **pregunta cerrada** o una sugerencia verificable, nunca un valor inventado
- No escribir el documento con bloqueantes abiertos — ver la tabla "Qué bloquea el
  documento y qué no" en el orquestador. Un estado sin diseñar **no** bloquea: va
  como `⛔ TODO`
- Las advertencias no bloquean: se documentan con su marcador

---

## Trazabilidad

Cada documento cierra con el registro de qué se preguntó y qué se respondió. Permite
auditar el doc meses después sin repetir la conversación.

```markdown
## Registro de Decisiones

| Fecha | Gap | Decisión | Quién |
|-------|-----|----------|-------|
| 2026-07-24 | Estado focus | Ring 2px color/focus/ring, offset 2px | Enzo |
| 2026-07-24 | Label largo | Trunca con ellipsis a 1 línea | Enzo |
| 2026-07-24 | Transición | 150ms ease-out — regla global del DS | Enzo |
```

Un gap resuelto por decisión del usuario deja de ser gap, pero **no** se convierte en
dato extraído. Queda registrado como decisión — si el diseño cambia después, esta
tabla dice quién decidió qué y cuándo.
