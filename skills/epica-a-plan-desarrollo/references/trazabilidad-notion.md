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
`Tareas` (base Tareas). No crear proyectos ni tareas dentro de Gestión de producto.

Una sola fuente por dato: la épica se relaciona solo con sus historias y la historia con sus
casos. No relacionar la épica directamente con los casos, porque la cadena ya lo resuelve y
una segunda relación se desincroniza.

## Íconos por tipo

Cada registro lleva un ícono nativo de Notion en azul, nunca un emoji. El ícono identifica
el tipo, no el contenido:

| Tipo | Ícono |
|---|---|
| Épica | `icons/flag_blue` |
| Historia de usuario | `icons/bookmark_blue` |
| Caso de uso | `icons/list_blue` |

## Estructura de la épica

La épica describe **qué se quiere construir**. Solo lleva lo necesario y se entiende sin
abrir las historias.

**Propiedades:** `Épica` (título `EP-<n> — <resultado>`, sin mezclar el nombre de una
historia), `Estado`, `Prioridad`, `Objetivo`, `Criterio de cierre`, `Proyecto`,
`Historias de usuario`, `Fuente`, `Versión del plan`, `Inicio` y `Fin objetivo`. No agregar propiedades que repitan el cuerpo (por ejemplo, riesgos).

**Cuerpo, en este orden y con encabezado 2:**
1. `Qué se construye`: un párrafo con el actor, el resultado y para qué, y una lista numerada
   de las partes, una por historia, con lo que entrega cada una.
2. `Alcance`: incluye (filtro o etiquetas de la fuente), no incluye y límites conocidos.
3. `Historias`: vista enlazada de la base Historias filtrada por esta épica. Nunca menciones
   escritas a mano: se rompen cuando una página cambia.
4. `Riesgos y decisiones pendientes`: contradicciones de la fuente y dependencias, cada una
   con un rótulo corto en negrita.

## Estructura de la historia de usuario

La historia tiene dos capas: una página de lectura que cuenta qué se construye y una
**Ficha técnica** con todo el detalle. Los criterios de aceptación viven **solo** en los
casos de uso; la historia no los repite.

**Propiedades:** `Historia de usuario` (título `US<n> — <nombre de la fuente>`), `Orden`,
`Estado`, `Prioridad`, `Épica`, `Casos de uso`, `Fuente` y `Tareas`. Nada más: fechas,
esfuerzo y responsables son de ejecución y viven en las tareas de Gestión de proyectos.

**Orden:** número de secuencia dentro de la épica según dependencias (qué historia necesita
a cuál). No depende del número de GitLab ni se escribe en el título, porque una historia
creada antes puede ir después. Las vistas de historias se ordenan por `Orden`.

**Página de lectura, en este orden:**
1. Cita con la pregunta previa (`> **Antes de leer:** …`), respondida en el relato.
2. `Recursos`: la subpágina `Ficha técnica — US<n>` (ícono `icons/document_blue`).
3. `En 30 segundos`: Como/quiero/para y una línea con su papel en la épica.
4. `El relato`: de 4 a 7 bloques cortos con rótulo en negrita, contados desde lo que hace
   el actor. Cierra con `Lo que todavía no está decidido`. Sin tablas ni criterios.
5. `Casos de uso`: vista enlazada de Casos de uso filtrada por `Historia padre` = esta página.
6. `Comprueba`: una pregunta que se responde con el relato o la ficha.

**Ficha técnica, en este orden:**
1. `Fuente`: issue, etiquetas, actor y límites de verificación.
2. `Reglas de negocio`: tabla de dos columnas, una fila por regla numerada `R-01…`, con los
   datos exactos de la fuente (formatos, límites, textos de mensajes).
3. `Estados`: los que menciona la fuente y si la matriz está definida.
4. `Dependencias` y `Decisiones pendientes`.
5. `Mapa de cobertura`: tabla regla → caso que la cubre → cobertura (`Cubierta`, `Parcial`,
   `Bloqueada`, `Hueco` o `Solapamiento`, con el motivo). Toda regla debe llegar a un caso.
6. `Pruebas transversales`: permisos, auditoría, errores, responsive y accesibilidad.

Las plantillas `Nueva épica`, `Nueva historia de usuario` y `Nuevo caso de uso` de Notion
ya traen estas estructuras. Si se crea una historia sin plantilla, construirla igual siguiendo esta sección.

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
7. Conservar la URL de fuente y la relación con la historia padre. No asignar responsables,
   fechas, estimaciones ni estados de ejecución sin evidencia. Registrar una regla
   contradictoria como decisión pendiente, no como comportamiento implementable.
8. Releer historia, casos y épica después de actualizar. Validar que cada caso tiene
   exactamente una historia padre, que toda relación inversa aparece una vez, que no
   hay duplicados y que cada flujo de la historia tiene cobertura o un pendiente
   explícito.

## Estructura del caso de uso

El caso de uso es una especificación funcional y de UX, no un relato: el relato vive en la
historia. Se basa en el formato "completo" de Cockburn (flujo principal y extensiones
numeradas por paso), en la separación de flujos alternos y de excepción de la especificación
RUP y en los cinco estados de pantalla del UI Stack. No incluye decisiones técnicas: esas
son del analista funcional y de desarrollo.

**Propiedades:** `Caso de uso` (título `CU-<historia>-<nn> — <verbo + objeto>`), `Estado`,
`Prioridad`, `Historia padre` y `Tareas`. Nada más: la fuente vive en la historia, y las
fechas, el esfuerzo y los responsables, en las tareas.

**Convención:** lo que la fuente no dice se marca **Pendiente**, y lo que es recomendación
de UX, **Propuesta**. Nunca se inventan textos, formatos ni reglas.

**Cuerpo, en este orden y con encabezado 2:**
1. `Resumen`: 2 o 3 líneas con actor, objetivo y disparador; enlace a la historia y a su
   ficha técnica.
2. `Precondiciones y garantías`: precondición, garantía de éxito y garantía mínima (lo que
   queda cierto aunque falle o se cancele).
3. `Diagrama`: una línea de leyenda y un bloque ```` ```mermaid ```` construido desde el
   texto (ver reglas abajo).
4. `Flujo principal`: pasos numerados `**Actor:** …` / `**Sistema:** …`, nombrando
   pantallas, botones y campos.
5. `Flujos alternos`: `A1 — nombre (paso n)`: qué cambia y a qué paso vuelve. Son caminos
   válidos, incluida la cancelación.
6. `Errores y excepciones`: `E1 — nombre (paso n)`: validación, permisos, servicio caído o
   tiempo agotado; qué ve el usuario y cómo se recupera.
7. `Estados de pantalla`: tabla momento / estado / qué ve el usuario, con inicial, carga,
   vacío o sin resultado, parcial, error y éxito donde apliquen.
8. `Campos y validaciones`: tabla campo / obligatorio / validación. Si el caso no tiene
   campos, se omite.
9. `Mensajes`: cada momento que necesita un texto, con el texto exacto o Pendiente.
10. `Reglas aplicadas`: referencias `R-xx` a la ficha técnica, sin copiar su texto.
11. `Criterios de aceptación`: `CA-nn — nombre (A1/E1)` en DADO/CUANDO/ENTONCES; uno para
    el camino principal, uno por alterno y uno por error. Reemplazan la sección de pruebas.
    Un criterio que depende de una decisión se deja escrito como Pendiente.
12. `Interfaz`: componentes de Comsatel DS y decisiones de UX.
13. `Dependencias y pendientes`.

Ejemplo de referencia: CU-3764-01 en Gestión de producto.

### Reglas del diagrama

El diagrama muestra **dónde se ramifica** el flujo, no repite el detalle. Se construye
desde el texto y, si no coinciden, se corrige el diagrama.

- `flowchart TD` (vertical, legible en el celular). Empieza en un nodo de inicio con forma
  `([…])` (la pantalla de partida) y termina en uno de fin `([…])` (el resultado).
- Flujo principal con flechas sólidas: un nodo por paso, `"n. verbo + objeto"`, máximo seis
  palabras.
- Cada alterno y cada error es **un solo nodo** `"A1 nombre corto"` / `"E1 nombre corto"`,
  unido con flecha punteada `-.->` al paso donde aparece y, si vuelve, al paso de retorno.
  Los reintentos llevan la etiqueta en la flecha: `E3 -. Reintentar .-> P5`.
- Nunca desarrollar un alterno paso a paso: si lo necesita, es otro caso de uso.
- Clases fijas, al final del bloque:

```text
classDef actor fill:#DBEAFE,stroke:#2563EB,color:#1E3A8A
classDef sistema fill:#EFF6FF,stroke:#93C5FD,color:#1E3A8A
classDef alterno fill:#F3F4F6,stroke:#6B7280,color:#374151
classDef error fill:#FEE2E2,stroke:#DC2626,color:#7F1D1D
classDef pendiente stroke-dasharray:5 5
```

  Pasos del actor → `actor`; del sistema → `sistema`; alternos → `alterno`; errores →
  `error`. Todo lo que depende de una decisión pendiente suma `pendiente`.
- Leyenda de una línea antes del bloque: "Azul: flujo principal (operador en azul fuerte,
  sistema en azul claro). Gris: flujos alternos. Rojo: errores. Borde punteado: pendiente de
  decisión. El texto de abajo manda: si no coinciden, se corrige el diagrama."

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
