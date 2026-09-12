# Bitácora única de seguimiento de tareas

## Principio

El cuerpo de todas las páginas de la base **Tareas** tiene una sola función: registrar el
seguimiento verificable. No documenta el requerimiento, el diseño técnico ni una lista de
pasos de implementación. Esos elementos se vinculan desde `Referencias` o `Actas y evidencias`;
el tipo, la jerarquía, el responsable, el estado, el criterio de cierre y las dependencias se
mantienen en las propiedades de Notion.

Usar la misma estructura en tareas y subtareas, sin importar si son de análisis,
configuración, ejecución, validación o comunicación.

## Plantilla obligatoria

```markdown
## Seguimiento
- **Estado actual:** [hecho confirmado; no repetir el select sin aportar contexto]
- **Último avance confirmado:** [fecha + hecho + fuente]
- **Pendiente o bloqueo:** [qué falta y de quién depende; "ninguno confirmado" si aplica]
- **Próxima acción:** [acción concreta + responsable + fecha, solo si está acordada]

## Evidencias y comunicaciones
| Fecha | Tipo | Hecho / decisión | Responsable o fuente | Evidencia / enlace |
|---|---|---|---|---|
| AAAA-MM-DD | Correo / reunión / prueba / aprobación / documento | [hecho verificable] | [nombre] | [URL o identificador] |
```

## Reglas de actualización

1. Añadir una fila de evidencia por cada comunicación, acuerdo, prueba, decisión o resultado
   que cambie el seguimiento. No reescribir ni borrar el historial.
2. Actualizar `Estado actual`, `Pendiente o bloqueo` y `Próxima acción` para reflejar la
   información más reciente confirmada. Cuando exista bloqueo, indicar causa, tipo, dueño,
   impacto y condición objetiva de desbloqueo.
3. Si no existe información, declarar el vacío de forma factual: no usar `Por definir` como
   contenido de seguimiento y no inventar una próxima acción, responsable o fecha.
4. Si el seguimiento revela que falta un requerimiento o aprobación, registrarlo como bloqueo
   y enlazar la evidencia; no redactar el requerimiento dentro de la tarea.
5. Los correos enviados son evidencia de gestión, no confirmación de ejecución. Diferenciar
   claramente enviado, respondido, aprobado, implementado y validado.
6. Mantener `Comunicación` coherente con la evidencia: toda tarea y subtarea debe tener un
   valor. Usar `Comunicación realizada` solo cuando exista una comunicación fechada y
   registrada; esta marca no equivale a que la tarea esté ejecutada ni cerrada.
7. No insertar enlaces a tareas, subtareas o páginas relacionadas dentro del cuerpo para
   representar jerarquía, dependencias o navegación. Esas relaciones se mantienen en las
   propiedades de Notion. Incluir enlaces en la bitácora solo como evidencia concreta.
8. Si una tarea queda cancelada, conservar la bitácora y añadir una fila con el motivo,
   la decisión y la fuente; no borrar el historial.

## Ejemplo aplicado a una restricción por IP

```markdown
## Seguimiento
- **Estado actual:** Pendiente de definición funcional; la implementación no ha iniciado.
- **Último avance confirmado:** 2026-08-28 — se solicitó a Gabriel remitir el requerimiento al área funcional.
- **Pendiente o bloqueo:** Falta requerimiento funcional aprobado para que Desarrollo implemente.
- **Próxima acción:** Esperar la respuesta de Gabriel; no hay fecha de compromiso confirmada.

## Evidencias y comunicaciones
| Fecha | Tipo | Hecho / decisión | Responsable o fuente | Evidencia / enlace |
|---|---|---|---|---|
| 2026-08-28 | Correo | Se solicitó remitir el requerimiento funcional y confirmar coordinación. | Gabriel Bustamante | Gmail: 1a048c948d5d8ee0 |
```
