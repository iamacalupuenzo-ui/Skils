# Contenido contractual de tareas

## Principio

El contenido de cada página de la base **Tareas** define el contrato de ejecución y aceptación.
Las propiedades y relaciones son la fuente de verdad para estado, fechas, esfuerzo, proyecto y
dependencias. No agregar una bitácora, seguimiento, evidencias o comunicaciones al cuerpo de
la tarea.

Usar la misma estructura en tareas y subtareas, sin importar si son de análisis,
configuración, ejecución, validación o comunicación.

## Estructura obligatoria

```markdown
## Qué hay que hacer

[Instrucciones concretas, con verbos, decisiones y límites. No resumirlas como un tema.]

## Outputs

- [ ] [Artefacto o resultado verificable]

## Criterios de aceptación

- **CA-01 — [resultado]**
  DADO [contexto verificable]
  CUANDO [acción o condición]
  ENTONCES [resultado observable].

## Notas

[Decisión, restricción o propósito que da contexto. Omitir si no existe una nota útil.]
```

Los outputs describen lo que queda disponible; los criterios de aceptación prueban cuándo se
puede cerrar. No usar como criterio "terminado", "revisado" o "documentado" sin una condición
observable. Mantener exactamente ese orden. Los hechos de avance viven en las propiedades,
comentarios, actas o evidencias relacionadas, no en el contenido contractual de la tarea.
