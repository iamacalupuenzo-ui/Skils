# Skill Builder — Forcing Questions de entrevista

8 preguntas para extraer el dominio completo antes de diseñar la arquitectura, más la
forma del skill, que se decide entre Q1 y Q4.
Una pregunta por turno. Esperar respuesta antes de la siguiente.

---

## Q1 — Propósito y output

**Pregunta:**
> ¿Qué proceso orquesta este skill y cuál es su output esperado? Describilo en una frase: "Este skill toma [X] y produce [Y]."

**Por qué es la primera:** Define el núcleo. Sin esto, todo lo demás puede ser incorrecto.

**Decisión que habilita:** nombre del skill, primer párrafo del rol, description del frontmatter.

**Respuesta buena:**
> "Toma un componente React existente y produce una página de documentación completa con playground, variantes, Do/Don't y PropsTable."

**Respuesta que necesita más:**
> "Para trabajar con el design system."
→ Preguntar: ¿construir componentes, documentarlos, auditarlos, o todo eso?

---

## Q2 — Alcance: project-specific vs global

**Pregunta:**
> ¿Este skill aplica a un proyecto específico o a cualquier proyecto? Si es project-specific, ¿qué archivo del proyecto confirma que estamos en el lugar correcto?

**Por qué importa:** define si hay guard de proyecto y qué verifica.

**Decisión que habilita:** guard del SKILL.md, si va en `allowed-tools` Bash para verificación.

**Respuesta project-specific:**
> "Solo para lyse-ds. Se puede verificar con `astro.config.mjs` y `src/styles/tokens.css`."

**Respuesta global:**
> "Para cualquier proyecto React/Next. El guard verifica que existe `package.json` con `react` o `next`."

**Señal de que es global:** el dominio es una tecnología o metodología, no un proyecto.
**Señal de que es project-specific:** el dominio involucra tokens, inventarios o decisiones de un proyecto concreto.

---

## Q3 — Trigger phrases

**Pregunta:**
> Dame 6 frases exactas que diría un usuario cuando necesita este skill. Pensá en cómo lo activarías vos en una conversación real, no en cómo describís el skill.

**Por qué importa:** el campo `description` del frontmatter usa estas frases exactas. Sin ellas el sistema no va a sugerir el skill en el momento correcto.

**Decisión que habilita:** `description` del frontmatter, `argument-hint`.

**Respuesta buena:**
> "creá el componente Radio", "falta documentar el Stepper", "agregá la foundation de Icons", "qué componentes faltan", "status del DS", "continuemos con el design system"

**Respuesta que necesita más:**
> "Cuando el usuario quiere trabajar con el design system."
→ Traducir a frases reales: ¿qué *dice* exactamente?

**Tip:** si el usuario duda, pedir que recuerde la última vez que necesitó algo similar y qué escribió.

---

## Q3b — Forma del skill

**Pregunta:**
> ¿Este skill decide entre situaciones distintas, o corre siempre el mismo procedimiento? ¿Su peso está en conocimiento estático que no cambia, o en hablar con un sistema externo?

**Por qué es acá:** la forma decide si la pregunta siguiente (modos) tiene sentido. Ver `references/skill-shapes.md` para las 4 formas y lo que exige cada una.

**Decisión que habilita:** si hay tabla de modos, si hace falta `references/`, qué tipo de GUARD, y qué criterios del checklist no aplican.

**Respuesta buena:**
> "Siempre hace lo mismo: recibe un componente y devuelve un reporte con hallazgos." → ejecutor lineal, sin tabla de modos.

**Respuesta que necesita más:**
> "Depende de lo que necesite."
→ Preguntar por el output: si el output cambia según la situación, hay modos; si es siempre el mismo, es lineal.

**Señal de constructor:** el valor está en tokens, inventarios o decisiones ya tomadas.
**Señal de operador externo:** el skill escribe en Notion, ClickUp u otra base y necesita IDs y anti duplicado.

---

## Q4 — Modos y sus señales

**Pregunta:**
> ¿De cuántas formas distintas puede invocarse este skill? Para cada una, decime: ¿qué dice el usuario, qué hace el skill, y cuál es su output?

**Por qué importa:** define la tabla de modos y cuántos protocolos hay que escribir.

**Decisión que habilita:** tabla de Detección de modo, cantidad de bloques de protocolo en SKILL.md.

**Respuesta con modos claros:**
> "Tres modos: ADD para agregar un componente nuevo (output: 3 archivos + entrada en sidebar), STATUS para ver el inventario (output: tabla de estado), AUDIT para revisar accesibilidad de los componentes existentes (output: reporte con fixes)."

**Respuesta que necesita aclaración:**
> "Sirve para todo lo del design system."
→ Preguntar: ¿puede crear componentes? ¿puede solo consultarlos? ¿puede auditarlos? → separar en modos.

**Señal de modo nuevo:** cada vez que el output o el proceso cambia significativamente → modo nuevo.

---

## Q5 — Herramientas y acceso externo

**Pregunta:**
> ¿Qué herramientas necesita este skill? ¿Crea o edita archivos? ¿Ejecuta comandos de terminal? ¿Usa algún MCP server (Figma, Notion, etc.)? ¿Hace búsquedas web?

**Por qué importa:** define `allowed-tools` en el frontmatter. Incluir tools innecesarias agrega ruido; omitir tools necesarias bloquea el skill.

**Decisión que habilita:** `allowed-tools` en frontmatter.

**Mapeo de necesidades a tools:**
| Necesidad | Tool |
|-----------|------|
| Leer archivos del proyecto | Read, Glob, Grep |
| Crear archivos nuevos | Write |
| Editar archivos existentes | Edit |
| Ejecutar comandos PowerShell/bash | Bash |
| Interactuar con Figma | `mcp__figma-console-local__*` |
| Interactuar con Notion | `mcp__claude_ai_Notion__*` |
| Buscar en la web | WebSearch |
| Lanzar subagentes | Agent |

---

## Q6 — Conocimiento estático para references/

**Pregunta:**
> ¿Qué información necesita este skill que nunca cambia entre sesiones? Por ejemplo: tokens de diseño, patrones de código, decisiones tomadas, inventarios, mapas de configuración, checklists.

**Por qué importa:** todo lo que responda esta pregunta va en `references/`, no en SKILL.md. Define cuántos archivos de referencias crear y con qué contenido.

**Decisión que habilita:** estructura de `references/` y sus nombres de archivo.

**Respuesta buena:**
> "Los tokens CSS (colores, tipografía, espaciado), las decisiones de diseño ya tomadas (radios, triggers, overflow), el inventario de componentes con su estado (✅/⏳), y el patrón DemoShell que se usa en todas las doc pages."

→ Esto genera 4 archivos: tokens.md, decisions.md, inventory.md, patterns.md

**Señal de que algo va en references/:** es una tabla, una lista de tokens, un inventario, o un patrón de código fijo.
**Señal de que algo va en SKILL.md:** es un procedimiento, una fase, una decisión de flujo.

---

## Q7 — Blocking behaviors / reglas no negociables

**Pregunta:**
> ¿Qué no puede hacer nunca este skill, aunque el usuario lo pida? ¿Qué errores cometería un Claude sin restricciones que este skill debe prevenir?

**Por qué importa:** define los comportamientos bloqueantes (Bx). Sin ellos, el skill va a cometer exactamente los errores que el dominio tiene documentados.

**Decisión que habilita:** sección "Comportamientos bloqueantes".

**Respuesta buena:**
> "Nunca usar overflow-hidden en containers con dropdowns — lo aprendimos a las malas. Nunca hardcodear colores, siempre tokens. Nunca saltarse la confirmación del plan. Nunca escribir código si el guard falla."

**Forma de extraer si el usuario no recuerda bloqueantes:**
> "¿Hubo alguna vez que Claude hizo algo que rompió el proyecto? ¿Qué fue? Eso es un bloqueante."
> "¿Qué cosas siempre le aclarás a Claude antes de empezar? Eso también."

---

## Q8 — Registro en Notion

**Pregunta:**
> ¿A qué proceso de Notion pertenece este skill y qué rol ejecuta?

**Por qué importa:** define cómo se registra en la base de datos Skills & Marcos.

**Decisión que habilita:** propiedades de Notion al crear el registro.

**Procesos disponibles:** Discovery, Sprint, Handoff, Cliente, Transversal
**Roles disponibles:** Desarrollador, Diseñador, Analista, Revisor, Investigador, Gestor, Operativo

**Regla:** si el skill aplica a un proceso de diseño → Diseñador. Si ejecuta código → Desarrollador. Si audita/revisa → Revisor. Si es infraestructura/config → Operativo.

**Skills que son Transversal:** los que no pertenecen a una fase específica del flujo (ej: notion-workspace, project-context, skill-builder).

---

## Síntesis post-entrevista

Después de las 8 preguntas, presentar este bloque para confirmación:

```
Síntesis — /[nombre-propuesto]
-------------------------------
Propósito:   [una línea]
Alcance:     global | project-specific ([archivo de guard])
Effort:      low | medium | high

Frontmatter:
  description: [3 trigger phrases de ejemplo]
  allowed-tools: [lista]

Modos ([N]):
  [MODO_A]: [señal] → [output]
  [MODO_B]: [señal] → [output]

References/:
  [archivo-1.md]: [contenido]
  [archivo-2.md]: [contenido]

Bloqueantes clave:
  - [B1]
  - [B2]
  - [B3]

Notion:
  Proceso: [proceso(s)]
  Rol:     [rol(es)]

¿Continúo con esta base?
```
