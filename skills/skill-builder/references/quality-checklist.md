# Skill Builder — Checklist de calidad

21 criterios organizados en 5 categorías. Verificar cada uno contra el contenido real
del skill — no marcar ✅ por intuición.

**Antes de empezar, identificar la forma del skill** con `references/skill-shapes.md`.
No todos los criterios aplican a las 4 formas: un ejecutor lineal no tiene tabla de modos
ni carpeta de referencias. Lo que no aplica se marca como tal, con la razón, en vez de
reprobarse.

---

## Categoría 1: Frontmatter

**C1 — Nombre en kebab-case**
El campo `name:` coincide exactamente con el nombre del directorio en `~/.claude/skills/`.
✅ `name: react-dev` + directorio `react-dev/`
❌ `name: ReactDev` o `name: react_dev`

**C2 — Trigger phrases reales**
El campo `description:` contiene frases entre comillas que un usuario real diría.
✅ `"creá un componente", "necesito agregar el botón", "construí la feature de X"`
❌ `"Usar cuando se requiere asistencia con el desarrollo de React"`

**C3 — Argument-hint específico**
El campo `argument-hint:` describe el argumento esperado, no es genérico.
✅ `"[componente o foundation a construir, o 'status']"`
❌ `"[argumento]"` o ausente

**C4 — Herramientas justificadas**
Cada tool en `allowed-tools` es efectivamente usada en el SKILL.md.
Verificar: ¿hay Bash? → ¿el skill ejecuta comandos de terminal?
¿hay Write? → ¿el skill crea archivos?
¿hay Agent? → ¿el skill lanza subagentes?

**C5 — Effort coherente**
`low` solo si: 1 modo + sin references + respuesta breve.
`high` si: ≥3 modos + preflight + references + cierre estructurado.
❌ `effort: high` en un auditor de 30 líneas.

---

## Categoría 2: Orquestación

**C6 — Guard presente y accionable**
Existe una sección GUARD que verifica contexto antes de actuar.
El guard especifica qué hacer si falla (avisar al usuario + detenerse).
❌ Guard que solo verifica pero no tiene consecuencia.

**C7 — Guard verifica el proyecto correcto**
Para skills project-specific: el guard verifica ≥2 archivos que identifican el proyecto.
✅ `Test-Path "astro.config.mjs"` + `Test-Path "src/styles/tokens.css"`
❌ `Test-Path "package.json"` (demasiado genérico)

**C8 — Modo declarado en primera línea**
La sección de Detección de modo indica que se debe declarar el modo activo antes de actuar.
Verificar que el Formato de respuesta también lo requiere.

**C9 — Cada modo tiene protocolo completo**
Todo modo listado en la tabla tiene un bloque de protocolo con fases numeradas.
❌ Modo listado en la tabla pero sin protocolo → comportamiento indefinido.

**C10 — Confirmación antes de ejecutar**
Las fases de planificación (plan, arquitectura, spec) terminan con pausa explícita.
✅ "Esperar confirmación antes de continuar."
❌ Skill que pasa de planificar a ejecutar sin pausa.

**C11 — Cierre definido por modo**
Cada modo tiene un bloque de cierre con formato fijo que define qué información entrega.
✅ Bloque con archivos creados, resultado de validación, próximo paso.
❌ Skill que termina sin reportar qué hizo.

---

## Categoría 3: Referencias

**C12 — SKILL.md cita referencias que existen**
Para cada `references/nombre.md` citado en el SKILL.md:
```powershell
Test-Path "$env:USERPROFILE\.claude\skills\[nombre-skill]\references\[archivo].md"
```
❌ Citar `references/inventory.md` sin que el archivo exista.

**C13 — Conocimiento estático en references/, no en SKILL.md**
SKILL.md no contiene tablas de tokens, listas de componentes, decisiones de diseño,
patrones de código extensos, o cualquier contenido que no varía con el contexto.
Señal de alerta: SKILL.md > 400 líneas → probablemente hay knowledge dump.

**C21 — Dependencias cruzadas verificadas**
Si el SKILL.md cita la referencia de otro skill, la cita lleva la ruta completa
(`otro-skill/references/archivo.md`) y ese archivo existe en el skill dueño.
✅ `design-handoff/references/decisiones.md` citado, y el archivo está
❌ Citar `references/tooling.md` de otro skill sin nombrarlo, o citar un archivo inexistente

**C14 — References/ citadas en la sección de Referencias**
La sección final "Referencias" lista todos los archivos de references/ con descripción.
❌ Archivo en `references/` que no aparece en la sección de Referencias del SKILL.md.

---

## Categoría 4: Bloqueantes

**C15 — Mínimo 5 bloqueantes**
Skills `effort: high` tienen ≥7 bloqueantes.
Skills `effort: medium` tienen ≥5 bloqueantes.
Skills `effort: low` tienen ≥3 bloqueantes.

**C16 — Bloqueantes numerados**
Todos empiezan con `B[N] — Nombre:` para poder referenciarlos.
❌ Lista sin numeración.

**C17 — Bloqueantes concretos y con consecuencia**
Cada bloqueante describe una acción específica prohibida y qué pasaría si se viola.
✅ "B3 — overflow-hidden: nunca usar en containers con dropdowns → corta el menú absolutamente posicionado"
❌ "B3 — Calidad del código: siempre escribir código limpio"

---

## Categoría 5: Formato y completitud

**C18 — Formato de respuesta definido**
Existe una sección "Formato de respuesta" que especifica:
- Cómo declarar el modo
- Idioma y tono
- Al menos una restricción específica (sin emojis, máximo N preguntas por turno, etc.)

**C19 — Sección de Referencias al final**
El SKILL.md termina con una sección "Referencias" que lista los archivos de references/.

**C20 — Registro en Notion**
El skill está registrado en la base de datos Skills & Marcos con:
- Nombre, Comando, Tipo: Skill Claude, Status: Activo
- Proceso asociado correcto
- Rol correcto
(Este criterio se verifica externamente, no en el archivo)

---

## Resultado

```
Auditoría — /nombre-del-skill
-------------------------------
Categoría 1 — Frontmatter:       [N/5 ✅]
Categoría 2 — Orquestación:      [N/6 ✅]
Categoría 3 — Referencias:       [N/4 ✅]
Categoría 4 — Bloqueantes:       [N/3 ✅]
Categoría 5 — Formato:           [N/3 ✅]

Total: [N/21] criterios cumplidos, sin contar los que no aplican por la forma

APROBADO             → 19-21 ✅
APROBADO CON OBS.    → 16-18 ✅ (ningún ❌ en C6, C7, C9, C10)
RECHAZADO            → <16 ✅ o cualquier ❌ en criterios críticos (C6, C9, C12, C17, C21)
```

### Criterios críticos (❌ en cualquiera = RECHAZADO)
- C6 — Guard presente
- C9 — Cada modo tiene protocolo completo
- C12 — References citadas existen en disco
- C17 — Bloqueantes concretos
- C21 — Dependencias cruzadas verificadas
