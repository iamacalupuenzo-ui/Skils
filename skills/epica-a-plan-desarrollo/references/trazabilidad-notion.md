# Trazabilidad en Notion — Épica, historias de usuario y casos de uso

Leer este recurso cuando el usuario haya pedido registrar, mapear, revisar o mejorar
el plan en Notion y el conector esté disponible. En equipos sin VPN o acceso a GitLab,
Notion es una fuente suficiente para planificar y auditar la cadena autorizada.

## Modelo objetivo

```text
Épica
└── Historia de usuario (alcance y fuente oficial)
    └── Caso de uso (flujo de valor verificable)
        └── Tareas de ejecución y validación, cuando se autoricen
```

Épicas, Historias de usuario y Casos de uso viven en **Gestión de producto**. Los
proyectos y las tareas viven en **Minimalist Project Manager**: la épica se relaciona con
su proyecto por `Proyecto` (base Project) y las historias y casos con sus tareas por
`Tareas` (base Tasks Manager). No crear proyectos ni tareas dentro de Gestión de producto.

La historia de usuario conserva el alcance funcional y su fuente. Un caso de uso
expresa un flujo, una regla o una interacción verificable dentro de esa historia.
No sustituir la historia por sus casos, no presentar un caso como una nueva historia
de usuario y no crear tareas de ejecución durante este flujo sin una solicitud
separada.

## Protocolo

1. Consultar el schema vivo de las bases de Épicas, Historias de usuario y Casos de
   uso. Identificar las relaciones existentes y las bases canónicas antes de crear,
   renombrar o mover registros.
2. Leer la épica y cada historia de usuario dentro del alcance autorizado. Para cada
   historia, recuperar todos sus casos asociados mediante la relación; si no existe
   relación, no asumir la pertenencia por similitud de título.
3. Leer el contenido completo de la historia y de cada caso asociado. Construir una
   matriz de cobertura: flujo/regla/criterio de la historia → caso que lo cubre →
   evidencia, hueco, solapamiento o contradicción.
4. Evaluar las casuísticas relevantes para cada flujo, sin convertirlo en un checklist
   artificial: camino principal, alterno, validación, datos vacíos, permisos, cambios
   de estado, fallos o espera de integración, duplicados/concurrencia, auditoría y
   accesibilidad/responsive solo cuando la fuente o el flujo lo justifiquen.
5. Clasificar cada hallazgo como `caso faltante`, `casuística faltante`,
   `criterio incompleto`, `solapamiento`, `contradicción` o `decisión pendiente`.
   Todo hallazgo conserva la cita o el fragmento de la historia que lo sustenta.
6. Con autorización para actualizar Notion, mejorar primero el caso existente: añadir
   flujo, casuísticas, criterio Given/When/Then, recomendación de interfaz, prueba o
   dependencia que falte. Crear un caso nuevo solo si hay un flujo independiente;
   asignarle identificador `CU-<historia>-<correlativo>` y relacionarlo con una sola
   historia padre. No modificar la historia fuente ni GitLab para resolver una
   ambigüedad.
7. Conservar la URL de fuente y la relación a la épica. No asignar responsables,
   fechas, estimaciones ni estados de ejecución sin evidencia. Registrar una regla
   contradictoria como decisión pendiente, no como comportamiento implementable.
8. Releer historia, casos y épica después de actualizar. Validar que cada caso tiene
   exactamente una historia padre, que toda relación inversa aparece una vez, que no
   hay duplicados y que cada flujo de la historia tiene cobertura o un pendiente
   explícito.

## Contenido mínimo de un caso de uso

```markdown
## Caso de uso

Como [rol], quiero [acción], para [beneficio].

## Flujo end-to-end

1. [disparador]
2. [pasos y decisiones]
3. [resultado observable]

## Casuísticas

- [normal, alterna, borde, permiso, dato ausente o fallo relevante]

## Criterios de aceptación

- **CA-01**
  DADO [contexto], CUANDO [acción], ENTONCES [resultado observable].

## Recomendaciones de interfaz

- [jerarquía, feedback, accesibilidad y componentes del sistema de diseño]

## Pruebas y evidencia

- [funcionales, borde y no funcionales pertinentes]

## Dependencias y límites

- [contrato, decisión o restricción verificable]
```

## Informe de cobertura

Al cerrar, resumir por historia: cantidad de casos asociados, flujos cubiertos,
huecos, contradicciones, cambios aplicados y decisiones pendientes. La cobertura no
significa que el desarrollo esté terminado: solo confirma que el alcance fue
analizado de forma trazable.

## Límites de integración

- Notion se modifica solo dentro del alcance autorizado.
- GitLab es evidencia adicional de lectura cuando la API corporativa ya está disponible;
  nunca se modifica desde este flujo, aunque el token tenga permisos. Su ausencia no
  bloquea el trabajo basado en Notion.
- Si Notion no fue solicitado, el resultado sigue siendo el plan local versionado.
