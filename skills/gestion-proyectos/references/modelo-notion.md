# Modelo operativo actual de Notion

## Fuente de verdad

Antes de usar IDs, opciones o propiedades, consultar el schema vivo mediante Notion. Este
documento recoge el modelo observado el 2026-08-30 y sirve para orientar la evaluación.

## Jerarquía objetivo

```text
Proyecto
└─ Entregable
   └─ Tarea
      └─ Subtarea
```

- **Proyecto:** objetivo, alcance, owner, stakeholders, fase y fecha de lanzamiento.
- **Entregable:** resultado verificable que aporta valor al proyecto. Tiene criterio de
  aceptación, estado, responsable, fase, fechas, prioridad y tareas relacionadas.
- **Tarea:** unidad de trabajo que contribuye directamente a un entregable. Define qué
  se hará, por qué, responsable, fecha, criterio de cierre, dependencia y evidencia.
- **Subtarea:** acción concreta y verificable necesaria para completar una tarea. Se
  relaciona por `Tarea padre` / `Subtareas`.

## Bases observadas

| Entidad | Fuente de datos | Relaciones relevantes |
|---|---|---|
| Projects | `collection://36aa01dc-169a-8248-82a1-07b97c2d2dd7` | Tareas, Entregables, Épicas, referencias y stakeholders. |
| Tareas | `collection://3bda01dc-169a-8345-a9a0-8727a8f95122` | Proyecto, Entregable, Tarea padre/Subtareas, Depende de/Bloquea a y evidencias. |
| Entregables operativo | `collection://c26a01dc-169a-82c0-9ddf-873f7e06f4ce` | Proyecto y Tareas; incluye criterio de aceptación, fase, orden y fechas. |

### Campos de control en Tareas

`Estado`, `Prioridad`, `Fase de lanzamiento`, `Proceso operativo`, `Tipo de trabajo`,
`N° orden`, `Depende de`, `Bloquea a`, `Criterio de cierre`, `Descripción`, `Ejecutor`,
`Responsable`, `Fecha compromiso`, `Fecha real`, `Completada`, `Comunicación`,
`Actas y evidencias`.

### Control de comunicación

Toda tarea y subtarea debe tener un valor en `Comunicación`; no dejar el campo vacío.

| Estado | Cuándo usarlo |
|---|---|
| `Pendiente de comunicación` | Falta una solicitud, convocatoria, coordinación, notificación o respuesta necesaria para avanzar o cerrar. |
| `Comunicación realizada` | Hay evidencia registrada de que la comunicación correspondiente se realizó, por ejemplo, un correo enviado, una convocatoria cursada o una reunión efectuada. |
| `No requiere comunicación` | El ítem no necesita comunicación adicional; registrar la razón cuando no sea evidente. |

El estado controla únicamente la gestión de la comunicación. No prueba que el resultado de la
tarea haya sido ejecutado, aceptado o validado. Cada cambio a `Comunicación realizada` debe
tener una evidencia fechada en la bitácora o en `Actas y evidencias`.

## Condición de modelo a validar

Hay otra base llamada `Entregables` (`collection://9faa2d40-9b47-46ee-8fba-de5ee2e4616d`)
relacionada desde Projects, mientras que Tareas se relaciona con la base operativa
`c26a...`. Esto puede responder a una separación intencional o a una evolución del modelo.
Nunca asumir una falla ni elegir una como canónica: evaluar propósito, contenido, cobertura y
uso de ambas antes de proponer cambios.

## Estados observados

- Proyecto: `Discovery`, `Definition`, `Design`, `Development`, `QA`, `Pre-lanzamiento`,
  `Lanzado`, `Post-lanzamiento`, `Cerrado`, `Archivado`.
- Entregable: `Pendiente`, `En progreso`, `Entregado`, `Bloqueado`.
- Tarea: `Pendiente`, `En progreso`, `En revisión`, `Listo para pruebas`, `Bloqueada`,
  `Hecho`, `Cancelada`.

Los campos `Completada` y `Estado` deben ser coherentes. Una discrepancia es una alerta
de calidad; no se corrige sin revisar evidencia y criterio de cierre.
