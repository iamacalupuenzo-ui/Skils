# Anti-Alucinación — Reglas de Specs y Validación

## Protocolo de 6 pasos — ANTES de reportar cualquier medida o color

1. **Identificar el nodo exacto** — no el primero con nombre similar. Nodos distintos dentro del mismo componente (contenedor vs ícono, frame vs vector) tienen valores distintos. Leer el árbol si hay ambigüedad.
2. **Leer desde la API** — usar `getNodeByIdAsync(nodeId)` y acceder a la propiedad directamente (`.width`, `.height`, `.fills[0].color`, `.cornerRadius`, etc.)
3. **Reportar solo lo que devuelve Figma** — sin redondear, estimar ni inferir. Si Figma dice `23.5`, el valor es `23.5`.
4. **Ambigüedad contenedor / ícono** — si el problema puede ser del contenedor o del ícono interno, leer ambos nodos y aclarar cuál es cuál antes de escribir la observación:
   - Contenedor: el frame/group que envuelve al ícono
   - Ícono: el vector o instancia interna
5. **Nodo no disponible** → declararlo explícitamente en una línea y pedir el URL al usuario antes de dar cualquier medida. No suponer el tamaño por contexto visual.
6. **No recordar medidas de sesiones anteriores** — cada observación se valida desde el nodo en el momento. Las medidas de OBS anteriores no aplican a OBS nuevas aunque sean del mismo componente.

---

## Validación desde Imagen Compartida

Cuando el usuario comparte una captura que muestra desarrollo vs aprobado:

1. **Analizar visualmente ambos lados** — identificar diferencias de: tamaño relativo, copy, alineación, estructura, estados, colores
2. **Listar las diferencias observadas** antes de emitir medidas
3. **Leer el nodo de Figma correspondiente** para confirmar specs exactas — la imagen es orientativa, el nodo es la fuente de verdad
4. **Nunca reportar medidas solo desde la imagen visual** — "parece que mide X" no es válido. Siempre confirmar con nodo
5. Si el nodo no está disponible: indicarlo y pedir el URL. Si la observación es sobre copy o estructura (no medidas) → sí se puede reportar desde la imagen

---

## Identificación de Nodo Correcto

Cuando el usuario provee una URL de nodo Figma (ej: `figma.com/file/ABC/...?node-id=7:22946`):
- Extraer el `node-id` del URL
- Leer con `getNodeByIdAsync('7:22946')`
- Si el nodo es un componente con hijos: leer los hijos relevantes también para entender la jerarquía

Cuando el usuario NO provee nodo:
1. Tomar screenshot del frame de desarrollo (frame numerado: `1`, `2`, `3`...)
2. Analizar visualmente el elemento afectado
3. Si el usuario puede proveer el nodo del diseño aprobado → pedirlo para confirmar specs
4. Si no hay nodo disponible → la observación se basa en lo visual (solo para copy/estructura, no medidas)

---

## Errores Comunes a Evitar

| Error | Correcto |
|-------|----------|
| Leer `iconfondo` (hijo) cuando el problema es el contenedor `Frame` | Leer el `Frame` directamente |
| Reportar `28×28px` porque el ícono vector mide eso | Reportar el contenedor frame: `40×40px` |
| "El componente mide aproximadamente X" | Leer el nodo y reportar el valor exacto |
| Reusar medidas de una observación anterior | Leer el nodo de esta observación específica |
| Reportar medidas desde una imagen sin verificar nodo | Pedir URL del nodo primero |
| Reportar solo el hex | Reportar **token + hex** — un color sin token es un hallazgo |
| Dar por hecho que un cambio se ve porque se aplicó | Cerrar con screenshot |
| Afirmar que falta un token sin comprobarlo | Catalogar los tokens que el archivo realmente usa |
| Usar un ID de nodo de una sesión anterior | Resolver por nombre en cada sesión |

---

## Aplicar no es renderizar

Que `setProperties` o una asignación no tiren error **no significa que el resultado se vea**.
Leer la propiedad de vuelta confirma que se aplicó, no que renderiza.

Verificado en sesión: un anillo de foco quedó aplicado, con los `absoluteRenderBounds`
expandidos correctamente, y era **invisible** en todos los exports.

Reglas:

1. **Cerrar toda escritura visual con screenshot.**
2. Capturar el **nodo padre** cuando hay bordes exteriores, sombras o líneas guía — el export a
   nivel de nodo recorta al bounding box.
3. Verificar **a escala de panel**, no solo del conjunto: solapamientos, textos recortados y
   flechas mal apuntadas no se ven en la vista completa.
4. El screenshot REST cachea por parámetros — cambiar el `scale` para forzar un render nuevo.

→ detalle en `references/figma-gotchas.md`

---

## Una lectura truncada no prueba que algo esté vacío

Los volcados de árbol se hacen con profundidad limitada. **Un frame que aparece sin hijos a
profundidad 5 puede tener contenido a profundidad 7.** Concluir "está vacío" desde ahí es
inventar una carencia — y termina escrito en la documentación como un hallazgo falso.

Ocurrió en sesión: un frame llamado `Text Field/false/true/false` se reportó como 80px de
espacio muerto en dos lugares del documento. Contenía un stepper completo, anidado bajo tres
frames intermedios con nombres que no lo describían.

**Antes de afirmar que un bloque está vacío o es de relleno**, contar sus nodos reales:

```javascript
const total = frame.findAll(() => true).length;
const visibles = frame.findAll(n => n.visible).length;
const textos = frame.findAll(n => n.type === 'TEXT' && n.visible).map(t => t.characters);
```

Si `visibles > 0`, no está vacío: hay que bajar hasta encontrar qué hay.

**Inventariar los bloques antes de documentar.** Recorrer el árbol completo una vez y listar
todo lo que ocupa espacio, para que ninguno quede fuera del despiece ni de las specs:

```javascript
const bloques = [];
(function walk(n, prof){
  for (const c of (n.children || [])) {
    if (!c.visible) continue;
    if (c.findAll(x => x.type === 'TEXT' && x.visible).length || c.type === 'INSTANCE')
      bloques.push({ ruta: prof.concat(c.name).join(' › '), w: c.width, h: c.height });
    walk(c, prof.concat(c.name));
  }
})(root, []);
```

Los nombres de capa **no** sirven para decidir qué mirar: `Text Field/false/true/false`,
`Frame 2608023` y `Titulo+cuerpo` no dicen nada de su contenido.

---

## Verificar antes de afirmar una carencia

Antes de reportar "falta el token X" o "no existe el componente Y", comprobarlo. Un hallazgo
mal fundado es peor que no reportarlo: manda al equipo a buscar algo que sí estaba.

Tres cosas que se comprueban rápido y suelen sorprender:

- **Los tokens vienen de librerías remotas.** `getLocalVariableCollectionsAsync()` puede
  devolver `[]` en un archivo lleno de tokens. Escanear los que el archivo ya usa.
- **Una propiedad puede responder a otra clave** según la variante. Si un texto no cambió, no
  es que no exista: es que la clave era otra.
- **Un texto puede estar recortado, no ausente.** Los nodos de ancho fijo cortan sin avisar.
