# Skill Builder — Catálogo de patrones reales

Fragmentos extraídos de skills existentes. Usar como referencia de estilo y estructura.
Nunca copiar literalmente — adaptar al dominio del skill que se está construyendo.

---

## Patrón 1: Frontmatter — skill complejo (react-dev)

```yaml
---
name: react-dev
description: >
  Senior Full Stack Engineer (frontend-heavy) para proyectos React / Next.js 15.
  Activar cuando el usuario quiere construir una feature, componente, página o
  necesita arrancar un proyecto nuevo con template-next.
  Orquesta los auditores (a11y, spacing, copy, security) según lo que se construye.
argument-hint: "[feature o componente a construir]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent, WebSearch
shell: powershell
effort: high
---
```

**Lección:** description combina rol ("Senior Full Stack Engineer") con qué activa el skill
y qué orquesta. Es más largo que el mínimo porque el skill es complejo.

---

## Patrón 2: Frontmatter — skill de auditoría (audit-a11y)

```yaml
---
name: audit-a11y
description: >
  Auditor de accesibilidad WCAG 2.2 AA para componentes web (Angular y React/Next).
  Activar después de construir botones, formularios, modales, dropdowns, navegación
  o cualquier UI interactiva, o cuando el usuario pide "revisar accesibilidad",
  "audit a11y" o "cumplir WCAG". Reporta hallazgos verificados con severidad y fix concreto.
argument-hint: "[componente, carpeta o feature a auditar]"
allowed-tools: Read, Glob, Grep, Bash
effort: medium
---
```

**Lección:** skills de solo lectura no necesitan Write/Edit/Agent. effort: medium para
auditores sin orquestación compleja.

---

## Patrón 3: Frontmatter — skill de rol conversacional (design-director)

```yaml
---
name: design-director
description: Use this skill when the user wants to debate, refine, redefine, challenge
  or get senior-level guidance on a UX/product design decision — no matter how small.
  Acts as a Director of UX / VP of Design that reasons from multiple industry mental
  models, self-critiques before answering, never rubber-stamps, and teaches. Trigger on
  phrases like "debatí esta decisión", "discutamos este flujo", "como VP de diseño qué harías"...
version: 1.0.0
---
```

**Lección:** skills conversacionales sin fases complejas pueden prescindir de argument-hint
y allowed-tools específicos. `version:` es útil para skills que evolucionan.

---

## Patrón 4: Guard de proyecto (lyse-ds)

```markdown
## GUARD — verificar proyecto antes de continuar

Antes de cualquier acción, confirmar que estamos en el proyecto correcto:
```powershell
Test-Path "astro.config.mjs"
Test-Path "src/styles/tokens.css"
```
Si alguno falla → este proyecto NO es lyse-ds. Avisá al usuario y detené.
Si pasan → registrá el working directory y continuá.
```

**Lección:** verificar ≥2 archivos específicos del proyecto para evitar falsos positivos.
Decir qué hacer si falla (no solo verificar).

---

## Patrón 5: Guard de stack en código (react-dev)

```markdown
## GUARD DE STACK — verificar antes de continuar

Si hay `package.json` en el proyecto, leelo ANTES de cualquier otra cosa:
- Tiene `@angular/core` → este skill NO aplica. Avisá al usuario y derivá a `/angular-dev`.
- Tiene `next` o `react` → continuá acá.
- No hay `package.json` → proyecto nuevo: andá a FASE 0.0 (clonar plantilla).
```

**Lección:** el guard puede leer un archivo y tomar decisiones basadas en su contenido,
no solo verificar si existe.

---

## Patrón 6: Tabla de modos — skill complejo

```markdown
## Detección de Modo

Declarar el modo en la primera línea antes de cualquier acción.

| Modo | Señales | Acción |
|------|---------|--------|
| `FROM_CODE` | El usuario muestra/nombra un componente existente en el código | Leer HTML + SCSS, extraer specs, crear en Figma |
| `FROM_DESCRIPTION` | El usuario describe un componente sin código de referencia | Inferir specs desde el design system activo, crear |
| `AUDIT` | "qué componentes faltan", "qué no tenemos en Figma" | Comparar codebase vs componentes existentes |
| `EXTRACT` | "extraé las specs de este componente de Figma" | Leer props internas y documentar |
| `FIX` | "el componente quedó mal", "corregí el sizing" | Leer estado actual, identificar problema, corregir |
```

**Lección:** las señales del modo FROM_CODE son condiciones observables, no solo frases.
Cada modo tiene una acción descriptiva, no solo un nombre.

---

## Patrón 7: Tabla de modos — skill conversacional

```markdown
| Modo | Señales clave |
|------|--------------|
| SPARRING | "debatí esto", "discutamos", "qué opinás de", "estoy pensando en hacer X" |
| CRÍTICA | "criticá este diseño", "revisá como senior", "qué está mal acá" |
| DECISIÓN | "estoy entre A y B", "ayudame a decidir", "cuál conviene" |
| ENSEÑANZA | "qué leo para", "explícame por qué", "qué referente sabe de esto" |
```

**Lección:** skills conversacionales tienen señales de texto puro, no condiciones de código.
La columna "Acción" puede omitirse si los protocolos de cada modo son largos.

---

## Patrón 8: Fase con preflight y reporte (figma-component-builder)

```markdown
## Paso 0 — Preflight (Obligatorio)

Fase B — Contexto del design system (en paralelo):
1. figma_get_variables (format: "summary")
   → Cargar nombres de variables semánticas disponibles
2. figma_search_components (query: "", limit: 25)
   → Inventario de componentes existentes

Resultado del preflight:
```
Preflight completado
--------------------
Archivo:      [nombre] (fileKey: [key])
Variables:    [N total] — [colecciones]
Componentes:  [lista con variantCount]
```
```

**Lección:** el preflight reporta siempre en formato fijo. Permite verificar que el
contexto está correcto antes de actuar.

---

## Patrón 9: Fase de planificación con confirmación (react-dev)

```markdown
### 1.3 — Diseñar el árbol de componentes

Presentale al usuario el árbol ANTES de codear:

```
features/nombre/
├── components/
│   ├── NombreCard.tsx        ← (nueva)
│   └── NombreGrid.tsx        ← (nueva)
├── hooks/
│   └── useNombre.ts          ← fetch + estado
└── index.ts                  ← barrel export
```

Esperá aprobación antes de continuar.
```

**Lección:** el árbol de archivos es una forma excelente de visualizar el plan.
"Esperá aprobación antes de continuar" es la pausa explícita.

---

## Patrón 10: Blocking behaviors — estilo react-dev

```markdown
## Reglas de oro

- **Preguntá antes de asumir** — si algo no está claro, preguntá
- **Reusá antes de crear** — buscá siempre si el componente ya existe
- **250 líneas máximo** — si un archivo crece, dividilo en ese momento
- **Tokens siempre** — ningún color, sombra o radius hardcodeado
```

**Lección:** cuando los bloqueantes son simples y pocos, "Reglas de oro" es suficiente.
Para skills más complejos, numerarlos (B1, B2...) permite referenciarlos.

---

## Patrón 11: Blocking behaviors — estilo figma-component-builder (numerados)

```markdown
## Comportamientos Bloqueantes

- **B1 — Sin conexión**: si `figma_get_status (probe: true)` falla, no proceder.
- **B2 — Sin preflight**: no crear ningún componente sin haber ejecutado el Paso 0.
- **B3 — Colores hardcodeados**: nunca setear fills con hex fijos si existe variable semántica.
- **B11 — Avanzar sin pausa entre lotes**: no crear organismos hasta terminar moléculas Y recibir confirmación.
- **B13 — Ejecutar sin archivo pineado**: si hay más de un archivo conectado, nunca ejecutar sin haber pineado.
```

**Lección:** numerados cuando son muchos (>6). El nombre corto en negrita permite identificar
sin leer el texto completo. La consecuencia está implícita o explícita.

---

## Patrón 12: Cierre estructurado (lyse-ds)

```markdown
### Cierre obligatorio

```
Componente completado — [NombreComponente]
-------------------------------------------
Archivos creados:
  ✅ src/components/ui/nombre.tsx
  ✅ src/components/docs/NombrePageContent.tsx
  ✅ src/pages/components/nombre/index.astro

Archivos modificados:
  ✅ src/lib/nav.ts (entrada agregada)
  ✅ references/inventory.md (marcado ✅)

Props: [lista]
Estados documentados: [lista]
Auditorías: [corridas / pendientes]

Siguiente componente sugerido: [nombre]
```
```

**Lección:** el cierre lista archivos creados/modificados, resultado de auditorías, y
sugiere el próximo paso. Siempre en formato fijo para que el usuario pueda comparar sesiones.

---

## Patrón 13: Motor de razonamiento (design-director)

```markdown
## El Motor de Razonamiento — Siempre Antes de Responder

### Paso 1 — No asumir. Reformular como JTBD + hipótesis.
### Paso 2 — Investigar antes de opinar.
### Paso 3 — Evaluar desde múltiples lentes (mínimo 3).
### Paso 4 — Autocrítica (red-team de la propia recomendación).
### Paso 5 — Recomendar con la estructura completa.
```

**Lección:** skills de razonamiento/consultoría tienen un motor interno de pensamiento,
no fases de construcción. El motor es la "fase 0" que siempre corre.

---

## Patrón 14: Formato de respuesta con restricciones de idioma

```markdown
## Formato de Respuesta

- Declarar modo detectado en primera línea
- Sin emojis decorativos. Sin "¡Perfecto!" ni frases de relleno
- **Idioma: español neutro (Perú).** No usar voseo ni rioplatense ("vos", "tirale", "mirá").
  Usar "tú"/"usted" según corresponda o formas impersonales.
- Tono directo de director: opina, decide, fundamenta.
- Preguntas: máximo 3 por ronda, agrupadas.
```

**Lección:** cuando el skill tiene un usuario específico con preferencias de idioma,
documentarlo aquí. Evitar que el skill cambie de registro entre sesiones.

---

## Patrón 15: Auto-mejora (design-director)

```markdown
## Modo Aprendizaje — Auto-mejora de la Biblioteca

Cuando se evalúa una empresa/producto que no está en `references/learning-library.md`:
1. Declararlo: "Esto vale la pena guardar en la biblioteca."
2. Proponer la entrada y pedir confirmación.
3. Al confirmar, escribir en `references/learning-library.md`.
4. Si contradice algo ya guardado, actualizar la entrada vieja.
```

**Lección:** los skills de consultoría/razonamiento pueden mejorar con el uso escribiendo
en sus propias referencias. Esto los hace más valiosos con el tiempo.

---

## Decisiones de arquitectura por tipo de skill

| Tipo de skill | Modos típicos | References típicas | Effort |
|--------------|---------------|-------------------|--------|
| Auditor | 1-2 (AUDIT, FIX) | checklist.md | medium |
| Constructor | 3-5 (ADD, UPDATE, STATUS, AUDIT) | inventory.md, tokens.md, patterns.md | high |
| Consultor/Razonamiento | 4-6 (conversacionales) | mental-models.md, learning-library.md | medium-high |
| Orquestador complejo | 5+ (CREATE, MIGRATE, AUDIT, UPDATE) | anatomy.md, checklist.md, patterns.md | high |
| Reporter | 1 (REPORT) | templates.md | low |
| Configurador | 2-3 (SETUP, UPDATE, AUDIT) | schema.md | medium |

---

## Formatos de salida de skill-builder

Bloques que el SKILL.md invoca por nombre. Viven acá porque son plantillas fijas, no
lógica de orquestación.

### Reporte de validación (CREATE, Fase 4)

```
Validación — /nombre-del-skill
--------------------------------
✅ [criterio] — ok
❌ [criterio] — [qué falta o está mal]
⚠️  [criterio] — [pasa pero con observación]

Resultado: APROBADO / APROBADO CON OBSERVACIONES / RECHAZADO
Issues críticos: [lista si los hay]
```

### Análisis de migración (MIGRATE, Fase 1)

```
Análisis de migración — [nombre del archivo]
---------------------------------------------
El archivo tiene [N] líneas. Clasificación:

→ references/tokens.md:      [secciones X, Y]
→ references/decisions.md:   [secciones A, B]
→ references/patterns.md:    [secciones C]
→ SKILL.md (orquestación):   [secciones D, E, F]

Se perderá (obsoleto o muy específico para un skill global):
  - [sección] — razón

¿Continuamos con esta distribución?
```

### Reporte de auditoría (AUDIT, Fase 3)

Antes de las categorías, declarar la forma del skill y qué criterios no aplican por ella.

```
Auditoría — /nombre-del-skill
-------------------------------
FRONTMATTER
  ✅ name coincide con nombre del directorio
  ❌ description no incluye trigger phrases reales
  ✅ argument-hint presente y específico
  ...

ORQUESTACIÓN
  ✅ guard presente y verifica contexto real
  ⚠️  modo CREATE no tiene fase de confirmación antes de escribir
  ...

REFERENCIAS
  ✅ referencias citadas en SKILL.md existen en disco
  ❌ references/inventory.md citado pero no existe
  ...

BLOQUEANTES
  ✅ bloqueantes numerados y específicos
  ...

Resultado: RECHAZADO — 2 issues críticos
Issues críticos:
  ❌ description sin trigger phrases → los usuarios no van a activar este skill naturalmente
  ❌ references/inventory.md no existe → SKILL.md cita algo que no hay

Fixes recomendados:
  1. Reescribir description con frases reales de trigger
  2. Crear references/inventory.md con el contenido que SKILL.md espera

¿Aplico los fixes?
```

---
