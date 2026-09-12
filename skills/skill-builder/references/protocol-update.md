# Skill Builder — Protocolo UPDATE

Protocolo completo para modificar un skill existente con un cambio puntual. Se
activa cuando el modo detectado es `UPDATE`. Leer este archivo entero antes de
actuar.

---

## Fase 0 — Leer el skill completo

No editar sin leer. Leer SKILL.md + references/ afectadas.

---

## Fase 1 — Identificar el cambio mínimo

```
Cambio solicitado: [descripción]
Archivos afectados:
  SKILL.md → sección [X]: [qué cambia exactamente]
  references/[archivo].md → [qué cambia]

Lo que NO cambia: [resto del skill]

Autorización: [diagnóstico aprobado; consultar solo ampliaciones]
```

---

## Fase 2 — Editar

Usar la herramienta de edición indicada por el entorno. Preservar el resto intacto.
Resolver enlaces y respaldar antes de cambios amplios. Corregir regla, ejemplos y llamadas.

---

## Fase 3 — Re-validar los criterios afectados

En cambios pequeños validar lo afectado; en refactorización amplia aplicar el checklist
completo y references/evaluaciones.md. Distinguir pruebas locales de integración real.

---

## Cierre de UPDATE

```
Actualización completada — /nombre-del-skill
---------------------------------------------
Cambios:
  SKILL.md:[línea] — [descripción del cambio]
  references/[archivo]:[línea] — [descripción]

Criterios re-validados: [lista] — ✅
```
