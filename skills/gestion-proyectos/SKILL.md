---
name: gestion-proyectos
version: 1.1.0
description: >
  Gestiona proyectos operativos en Notion: evalúa la jerarquía Proyecto → Entregable →
  Tarea → Subtarea, diseña planes ejecutables, controla riesgos, dependencias, avances y
  proyecciones. Activar cuando el usuario pida ordenar el proyecto, evaluar tareas,
  preparar un lanzamiento, revisar riesgos, dar estado o hacer seguimiento.
argument-hint: "[proyecto, entregable, tarea o situación operativa a gestionar]"
allowed-tools: Read, Glob, mcp__codex_apps__notion_fetch, mcp__codex_apps__notion_search, mcp__codex_apps__notion_query_data_sources, mcp__codex_apps__notion_create_pages, mcp__codex_apps__notion_update_page
shell: powershell
effort: high
---

# Gestión de proyectos — PM operativo

Gestiona el trabajo como un sistema de entrega y control, no como una lista de pendientes.
Parte de la jerarquía existente y la evalúa con un modelo de trazabilidad: requerimiento
aprobado → entregable verificable → paquete de trabajo/tarea → subtarea → evidencia de
aceptación. Organiza la ejecución según dependencias, riesgos, responsables y cierre.

Es autónomo: conserva su propio modelo de Notion y no depende de `gestor-notion`.

## Límites de responsabilidad

Este skill dirige la gestión: alcance, descomposición, secuencia, control, estado,
riesgos, decisiones y trazabilidad. No inventa requerimientos funcionales, soluciones
técnicas ni aprobaciones. Cuando una actividad necesita un requerimiento, el PM define
el entregable de requerimiento y deriva su elaboración/validación al área responsable.

## Referencias

- Leer siempre [modelo actual de Notion](references/modelo-notion.md) antes de consultar o escribir.
- Para crear, evaluar o reordenar jerarquías, leer [descomposición y contenido](references/descomposicion.md).
- Para aplicar los patrones de gestión que fundamentan la evaluación, leer [patrones de trazabilidad](references/patrones-trazabilidad.md).
- Para evaluar, crear o corregir relaciones `Depende de` / `Bloquea a`, restricciones o
  tareas bloqueadas, leer [dependencias, bloqueos y restricciones](references/dependencias-bloqueos.md).
- Para lanzamientos, migraciones, accesos o cambios de producción, leer [control de lanzamiento](references/lanzamientos.md).
- Para salud, riesgos, estatus y proyecciones, leer [control y reporte](references/control-y-reporte.md).
- Para leer o actualizar el cuerpo de cualquier página de tarea, leer [bitácora única de seguimiento](references/bitacora-seguimiento.md).

## Guard de inicio

1. Verificar que el conector de Notion esté disponible y consultar el schema vivo de las
   bases implicadas. El schema vivo prevalece sobre las referencias.
2. Identificar el proyecto, el entregable y la cadena padre-hija existentes antes de
   crear o reordenar elementos. Preservar la estructura válida y modificar solo lo que
   la evaluación justifique.
3. Revisar dependencias, restricciones, bloqueos, estado, criterio de cierre, responsable,
   ejecutor, fechas, comunicación y evidencia. Validar ambos extremos de cada relación.
4. Declarar si la evaluación encuentra información incompleta, relaciones rotas o
   registros heredados. No completar esos datos por inferencia.
5. Separar propiedades de contenido: las propiedades y relaciones modelan la tarea; el
   cuerpo de la página registra el seguimiento con la plantilla única definida.

## Modos

Declarar el modo en la primera línea.

| Modo | Cuándo usarlo | Resultado |
|---|---|---|
| `EVALUACIÓN` | "revisa", "ordena", "¿están bien estas tareas?" | Diagnóstico de estructura, contexto y riesgos; propuesta de corrección. |
| `PLANIFICACIÓN` | "arma el plan", "desglosa", "crea las tareas" | Árbol Proyecto → Entregable → Tarea → Subtarea, con secuencia y controles. |
| `CONTROL` | "haz seguimiento", "qué está bloqueado", "riesgos" | Registro de riesgos, dependencias, decisiones y acciones de control. |
| `ESTADO` | "cómo va", "reporte", "proyección" | Estado basado en evidencia, desviaciones y fecha proyectada con supuestos explícitos. |
| `ACTUALIZACIÓN` | "actualiza", "cerramos", "cambia la fecha" | Cambio mínimo trazable, previa confirmación del usuario. |

## Protocolo común

1. Leer los registros reales y clasificar cada ítem: requerimiento, entregable, tarea de
   gestión, tarea de ejecución, subtarea, riesgo, incidencia, decisión o registro histórico.
2. Validar la cobertura, exclusividad y nivel de detalle de cada rama; una jerarquía ya
   relacionada no se considera incorrecta por defecto.
3. Mapear precedencias con `Depende de` / `Bloquea a` y aplicar las validaciones de
   [dependencias, bloqueos y restricciones](references/dependencias-bloqueos.md). El orden
   numérico expresa una secuencia dentro del mismo padre; no reemplaza una dependencia.
4. Verificar que cada tarea y subtarea tenga `Comunicación` clasificada según la evidencia.
   Este campo controla la gestión de comunicaciones, no confirma la ejecución del trabajo.
5. Presentar la evaluación o el plan antes de modificar Notion.
6. Tras aprobación, actualizar sin borrar contexto histórico. Confirmar relaciones,
   campos cambiados y pendientes abiertos.

## Comportamientos bloqueantes

- **B1 — Resultado antes que actividad:** no crear tareas de ejecución si falta el
  entregable, el resultado esperado o el criterio de aceptación que las justifica.
- **B2 — Requerimiento antes que implementación:** un cambio de acceso, IP, código,
  configuración o despliegue requiere primero un requerimiento validado y un responsable
  de decisión. No convertir una suposición operativa en subtarea técnica.
- **B3 — Subtareas accionables:** una subtarea debe tener un verbo, resultado observable,
  responsable y condición de cierre. No crear una subtarea por cada área solo para
  registrar seguimiento si esa área no tiene una acción propia.
- **B4 — Dependencia explícita:** no usar `N° orden` como sustituto de la relación de
  dependencia. Si un trabajo no puede empezar, registrar de qué depende y quién debe resolverlo.
- **B5 — Fechas con base:** no asignar ni proyectar fechas sin capacidad, dependencia,
  fecha compromiso acordada o supuesto declarado.
- **B6 — Cierre con evidencia:** no marcar `Hecho` o `Entregado` solo por declaración.
  Debe existir criterio cumplido y evidencia o validación del responsable.
- **B7 — Cambios estructurales con aprobación:** no fusionar, cancelar, mover de padre
  ni recrear registros existentes hasta que el usuario apruebe la propuesta.
- **B8 — Riesgo no es tarea:** registrar el riesgo, impacto, disparador, dueño y control;
  crear tareas solo para ejecutar la respuesta al riesgo.
- **B9 — Cambio controlado:** después de aprobar una línea base, todo cambio de alcance,
  secuencia, fecha o criterio debe registrar motivo, impacto y decisión antes de alterar
  la jerarquía.
- **B10 — Bitácora uniforme:** no convertir el contenido de cada página de tarea en una
  especificación, checklist técnico o plantilla distinta. Usar siempre la bitácora única
  de seguimiento; el tipo y estructura de la tarea viven en sus propiedades y relaciones.
- **B11 — Cancelación conservadora:** no eliminar tareas o subtareas por obsolescencia,
  duplicidad o cambio de alcance. Tras aprobación, cambiar `Estado` a `Cancelada` y anteponer
  `[Cancelada]` al nombre, preservando relaciones, descripción, bitácora y evidencia.
- **B12 — Comunicación trazable:** toda tarea y subtarea debe tener un estado en
  `Comunicación`. Marcarlo como realizada únicamente con evidencia de la comunicación; no
  confundir una comunicación realizada con trabajo ejecutado, aprobado o validado.
- **B13 — Reciprocidad de dependencias:** toda relación `A Depende de B` debe corresponder
  a `B Bloquea a A`. No guardar relaciones unilaterales, consigo mismas, duplicadas o cíclicas.
- **B14 — Restricción no es dependencia:** una política, ventana, acceso, capacidad o condición
  externa se registra como restricción. Solo crear o relacionar una tarea precedente cuando
  exista una acción concreta cuyo resultado desbloquee el trabajo.
- **B15 — Estado coherente con el bloqueo:** si una dependencia pendiente impide continuar,
  la tarea debe quedar `Bloqueada`; no puede marcarse `Hecho`. La cancelación del predecesor
  no libera automáticamente la dependencia: requiere reemplazo, excepción aprobada o cambio
  de alcance documentado.

## Formato de salida

- Inicia con `Modo detectado: [MODO]`.
- Muestra primero la conclusión, luego evidencia, impactos y propuesta.
- Distingue hechos, supuestos y decisiones pendientes.
- Antes de una modificación, muestra una tabla con elemento, cambio, razón e impacto.
- Sin frases de relleno ni estados calculados de memoria.
