# Skill Builder — Anatomía de un SKILL.md

Cada sección en orden. Criterio de inclusión, reglas y anti-patrones.

---

## 1. Frontmatter (YAML)

```yaml
---
name: nombre-en-kebab-case
description: >
  [Rol en una línea]. Activar cuando el usuario quiere: "[frase 1]", "[frase 2]",
  "[frase 3]", "[frase 4]", "[frase 5]", "[frase 6]".
argument-hint: "[descripción del argumento esperado]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
shell: powershell
effort: low | medium | high
version: 1.0.0   ← opcional, útil si el skill tiene historial
---
```

### Reglas de `description`
- Las frases entre comillas son **literales que el usuario diría** — no descripciones del skill
- Mínimo 5-6 frases de trigger. Sin estas, el sistema no va a sugerir el skill en el momento correcto
- Incluir variantes: "creá X", "necesitamos X", "construí X", "diseñá X"
- Anti-patrón: `"Activar cuando se necesita gestionar el proceso de..."` → nadie dice eso

### Reglas de `allowed-tools`
- Solo incluir las herramientas que el skill efectivamente usa
- Skills de solo lectura: `Read, Glob, Grep` (sin Write, Edit, Bash)
- Skills que crean archivos: agregar `Write, Edit`
- Skills con terminal: agregar `Bash`
- Skills con MCP: agregar `mcp__nombre-servidor__*`
- Anti-patrón: poner `Agent, WebSearch` sin necesitarlos

### Reglas de `effort`
- `low`: skill de 1 modo, sin referencias, respuesta corta (auditores simples, reporters)
- `medium`: 2-3 modos, con alguna referencia, fases moderadas
- `high`: múltiples modos, preflight, referencias, fases con confirmación, cierre estructurado

---

## 2. Título + Rol

```markdown
# Nombre del Skill — Subtítulo descriptivo

Sos [rol en primera persona]. [Qué hacés en 2-3 líneas].
[Qué no hacés — límites con otros skills si aplica].
```

### Criterio de inclusión
- El rol define el **punto de vista** y el **nivel de expertise** del skill
- "Sos un Senior Full Stack Engineer" → genera respuestas con criterio de ese nivel
- Sin definición de rol, el skill opera sin identidad → respuestas genéricas
- Anti-patrón: "Este skill te ayuda a..." → tercera persona, sin identidad

---

## 3. Lo que ES y NO ES

Solo incluir si el skill tiene límites claros que se confunden frecuentemente.

```markdown
## Lo que este skill PUEDE hacer
- [capacidad 1]
- [capacidad 2]

## Lo que este skill NO PUEDE hacer
- [límite 1] — derivar a [otro skill]
- [límite 2]
```

**Cuándo incluir:** skills que comparten dominio con otros (design-director vs lofi-designer vs usability-test)
**Cuándo omitir:** skills de propósito único donde no hay confusión posible

---

## 4. Referencias disponibles

Lista de los archivos en `references/` que el skill usa, con una línea de descripción.

```markdown
## Referencias disponibles

- `references/nombre.md` — qué contiene y cuándo consultarlo
- `references/otro.md` — ídem
```

### Criterio
- Solo listar referencias que el SKILL.md **efectivamente cita** en sus fases
- La descripción es una guía de cuándo leer ese archivo, no solo qué contiene
- Anti-patrón: listar referencias que el skill nunca consulta

---

## 5. GUARD

Verificación de contexto que debe pasar antes de cualquier acción.

**Skills project-specific (como lyse-ds):**
```markdown
## GUARD — verificar proyecto antes de continuar

Antes de cualquier acción, confirmar que estamos en el proyecto correcto:
```powershell
Test-Path "archivo-que-identifica-el-proyecto.ext"
```
Si falla → este proyecto NO es [nombre]. Avisá al usuario y detené.
```

**Skills globales sin guard de proyecto:**
```markdown
## GUARD — verificar contexto
```powershell
Test-Path "$env:USERPROFILE\.claude\skills"
```
```

**Cuándo incluir guard:**
- Siempre. Todo skill debe verificar al menos que puede operar.
- Skills project-specific: verificar ≥2 archivos del proyecto (para evitar falsos positivos)
- Skills globales: verificar que las herramientas/directorios necesarios existen

**Anti-patrones:**
- Guard sin acción si falla → inútil
- Guard que verifica algo trivial que siempre pasa → falsa seguridad

---

## 6. Detección de modo

Tabla que mapea señales del usuario a modos de operación.

```markdown
## Detección de modo

Declarar el modo en la primera línea antes de cualquier acción.

| Modo | Señales | Acción |
|------|---------|--------|
| `MODO_A` | "frase 1", "frase 2", condición implícita | descripción corta de qué hace |
| `MODO_B` | "frase 3", "frase 4" | ídem |
```

### Reglas
- Declarar siempre el modo en la primera línea de respuesta
- Las señales son frases reales o condiciones observables (no conceptos abstractos)
- Cada modo tiene un protocolo propio más abajo en el SKILL.md
- Skills de un solo modo: la tabla puede omitirse, pero igual declarar el modo al inicio
- Anti-patrón: modos sin señales claras o con señales que se superponen sin criterio de desempate

---

## 7. Protocolos por modo

Un bloque por modo con fases numeradas.

```markdown
## [MODO] — Protocolo [completo | reducido]

### Fase 0 — [Nombre]
[descripción + acciones + criterio de pausa]

### Fase 1 — [Nombre]
[ídem]

[...]

### Cierre obligatorio
```
[formato del reporte final]
```
```

### Reglas de las fases
- Numeradas desde 0
- Fase 0 suele ser el setup/preflight/entrevista
- Cada fase termina con un criterio de cuándo continuar a la siguiente
- Si requiere confirmación del usuario → decirlo explícitamente: "Esperar confirmación antes de continuar"
- El cierre es obligatorio y tiene formato fijo — define qué información el usuario recibe al terminar

### Criterios de granularidad
- Una fase = una responsabilidad clara
- Si una fase tiene más de ~5 pasos complejos → dividirla
- Si dos fases siempre van juntas sin decisión entre ellas → fusionarlas

---

## 8. Comportamientos bloqueantes

Lista numerada de reglas no negociables.

```markdown
## Comportamientos bloqueantes

- **B1 — Nombre corto**: descripción concreta de qué no puede pasar y consecuencia.
- **B2 — Nombre corto**: ídem.
[...]
```

### Reglas de bloqueantes
- **Numerados** (B1, B2...) para poder referenciarlos en contexto
- **Nombre corto en negrita** — identifica el bloqueante sin leer todo
- **Concretos**: "nunca usar overflow-hidden" > "evitar problemas de CSS"
- **Con consecuencia**: "porque corta el menú absolutamente posicionado"
- Mínimo 5-6 bloqueantes para skills complejos
- Los más importantes primero (guard, datos críticos, confirmaciones)
- Anti-patrón: "siempre ser cuidadoso" → sin acción concreta asociada

---

## 9. Formato de respuesta

```markdown
## Formato de respuesta

- Declarar modo en primera línea (`Modo detectado: X`)
- [reglas de tono, idioma, estructura]
- Sin emojis decorativos. Sin frases de relleno.
- Idioma: español, tono [técnico / conversacional / directo]
- [formato específico: preguntas, bloque de confirmación, cierre]
```

### Lo que siempre debe estar
- Cómo declarar el modo
- Idioma y tono
- Restricciones de formato (sin emojis si aplica, límites de longitud)
- Formato del cierre (qué información siempre se da al terminar)

---

## 10. Referencias (sección final)

Lista de archivos de references/ con descripción de una línea.

```markdown
## Referencias

- `references/nombre.md` — descripción de uso
- `references/otro.md` — ídem
```

---

## Anti-patrones globales

| Anti-patrón | Por qué es malo | Fix |
|-------------|----------------|-----|
| Knowledge dump en SKILL.md | El skill se vuelve ilegible y difícil de mantener | Mover conocimiento estático a references/ |
| Fases sin criterio de pausa | El skill ejecuta sin validar con el usuario | Agregar "Esperar confirmación antes de continuar" |
| Bloqueantes vagos | No generan comportamiento concreto | Hacer cada bloqueante accionable y con consecuencia |
| Trigger phrases en tercera persona | El sistema no las va a matchear | Reescribir como frases que el usuario diría |
| Modo único sin declarlo | No se puede saber en qué estado está el skill | Siempre declarar modo en primera línea, aunque sea uno solo |
| References citadas que no existen | El skill menciona algo que no hay | Crear el archivo o quitar la referencia |
| Effort siempre en `high` | No calibra expectativas | Elegir según complejidad real |
| Un solo archivo en skills/ sin references/ | El conocimiento queda en SKILL.md | Si hay ≥2 categorías de conocimiento, crear references/ |
