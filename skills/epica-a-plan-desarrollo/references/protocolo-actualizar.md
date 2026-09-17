# Protocolo ACTUALIZAR — nueva versión sobre un plan existente

Se activa cuando el GUARD encontró un archivo
`epica-a-plan-desarrollo-<proyecto>-v*` previo para este proyecto/épica.

## Fase 0 — Localizar y leer el plan anterior

Buscar en `Documents\Proyectos\<proyecto>\` el archivo con el número de versión
más alto que coincida con el patrón `epica-a-plan-desarrollo-<proyecto>-v*.md`.
Leerlo completo — la actualización parte de ahí, no desde cero.

## Fase 1 — Identificar qué cambió

Dos disparadores posibles, no excluyentes:
- La épica original cambió (el usuario trae una versión nueva o un agregado).
- El usuario pide ajustar el desglose ya hecho (ej: "el módulo X en realidad
  debería dividirse en dos", "faltó un flujo").

Comparar contra el documento anterior sección por sección. No reescribir lo que
no cambió — conservar la numeración de HU-* existentes que siguen vigentes para
no romper trazabilidad con trabajo que ya pudo haber empezado sobre esa historia.

## Fase 2 — Recalcular solo lo afectado

Aplicar `references/criterios-segmentacion.md` únicamente a los módulos, flujos o
historias que cambiaron o son nuevos. Los módulos no tocados se copian tal cual
del documento anterior.

## Fase 3 — Armar la nueva versión

Usar la misma estructura de `references/plantilla-plan-desarrollo.md`, con una
sección adicional al inicio:

```markdown
## Cambios respecto a v[N-1]

- [qué cambió, en qué sección, y por qué]
```

Guardar como archivo nuevo, nunca sobreescribir el anterior:

```
C:\Users\Enzo Macalupu\Documents\Proyectos\<proyecto>\epica-a-plan-desarrollo-<proyecto>-v[N+1]-<YYYY-MM-DD>.md
```

## Fase 4 — Cierre

```
Resultado: plan de desarrollo v[N+1] — actualización de v[N]
Fuente:    Documents\Proyectos\<proyecto>\epica-a-plan-desarrollo-<proyecto>-v[N+1]-<fecha>.md
Cambios:   [resumen de qué se tocó respecto a la versión anterior]
Validación: cada historia nueva o modificada tiene criterio de aceptación
Pendiente: [si quedó algo abierto]
```
