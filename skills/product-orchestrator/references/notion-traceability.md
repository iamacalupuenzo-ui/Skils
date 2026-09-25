# Trazabilidad de producto en Notion

Usar esta referencia únicamente cuando el usuario haya autorizado gestionar
planificación, ejecución o seguimiento en Notion. Notion es la fuente de
verdad para el trabajo planificado y su estado; GitLab/GitHub conserva la
fuente técnica, commits, ramas, merge requests e incidencias externas.

## Modelo y responsables

```text
Gestión de proyectos (gestion-proyectos)   Gestión de producto (epica-a-plan-desarrollo)
Proyecto ─────────────────────────────────── Épica
Tareas ◄──────────────────────────────────── Historia de usuario
Tareas ◄──────────────────────────────────── └── Caso de uso
```

- **Gestión de producto** guarda solo el qué: Épicas → Historias de usuario → Casos de
  uso. Su dueño es `epica-a-plan-desarrollo`, y la estructura de cada registro (propiedades,
  íconos, relato, ficha técnica, mapa de cobertura y caso detallado con diagrama) está en
  `epica-a-plan-desarrollo/references/trazabilidad-notion.md`. **No repetir aquí esa
  estructura: leerla allí.**
- **Gestión de proyectos** guarda el cómo y el cuándo: proyectos y tareas. Su dueño es
  `gestion-proyectos`.
- Relaciones: la épica se relaciona con su `Proyecto`; historias y casos con sus
  `Tareas`. Cada caso tiene exactamente una `Historia padre`. No existen historias
  derivadas: un flujo independiente es un caso de uso de la misma historia.

## Protocolo de escritura

1. Obtén la URL de la página o las bases compartidas. Comprueba la conexión y
   haz fetch del schema vivo; los nombres de bases y propiedades pueden diferir
   entre workspaces.
2. Busca los registros existentes antes de crear. Preserva relaciones, estados,
   páginas hijas y datos no relacionados.
3. Si el usuario autorizó una modificación del modelo, deriva a `gestor-notion` en
   modo MODELO. No migres ni borres registros sin releer la rama afectada.
4. Deriva a `gestion-proyectos` la creación o validación del proyecto y sus tareas.
5. Deriva a `epica-a-plan-desarrollo` la épica, las historias y los casos de uso. Ese
   skill los crea con las plantillas `Nueva épica`, `Nueva historia de usuario` y `Nuevo
   caso de uso` o, sin plantilla, con la misma estructura.
6. El plan de desarrollo versionado vive en el archivo local del proyecto; en Notion
   solo se actualiza la propiedad `Versión del plan` de la épica. No se pega el plan en
   el cuerpo de la épica.
7. Antes de cerrar, relee el proyecto, la épica, la historia y los casos
   afectados, y ambos extremos de cada relación. Una historia o épica no se declara
   terminada por esta trazabilidad: el mapeo solo confirma cobertura analizada y
   conserva los pendientes o decisiones abiertas como tales.

## Reentrada en un modelo ya configurado

Una configuración verificada de bases, relaciones y vistas es una línea base,
no un paso que se repite ante cada épica.

1. Reconoce si el contexto ya declara el modelo como creado y validado. En ese
   caso, localiza el Proyecto, la Épica, la Historia o el Caso de uso objetivo y
   modifica solo esos registros.
2. La página principal sirve como navegación o tablero. No agregues instrucciones
   de proceso, planes extensos ni vistas nuevas allí salvo que el usuario pida
   expresamente editar la página principal.
3. No ejecutes `gestor-notion` en modo MODELO, no recrees bases y no cambies
   propiedades/vistas cuando la solicitud consiste en registrar o actualizar
   trabajo dentro del modelo existente.
4. Si el conector de Notion no existe en la sesión, no uses un navegador como
   reemplazo ni solicites un nuevo inicio de sesión. Declara la escritura como
   pendiente por capacidad de integración, conserva el plan local versionado y
   reanuda desde los mismos registros cuando el conector vuelva a estar
   disponible.
5. No confundas “no hay conector en esta sesión” con “el usuario no tiene acceso
   a Notion” ni con una autorización para volver a modelar el workspace.

## Trabajo desde dos computadoras

- El agente que tiene VPN o acceso local a Git puede contrastar el repositorio
  y registrar enlaces de evidencia. No debe asumir que otro agente tiene ese
  acceso.
- El agente que solo tiene Notion puede leer el plan, actualizar su tarea,
  registrar evidencia disponible y marcar estados sustentados. No puede afirmar
  que ejecutó un cambio de Git que no observó.
- Nunca guardar tokens, secretos o contenido de variables de entorno en la
  página, propiedades o evidencia de Notion.

## Cierre de trazabilidad

```text
Coordinación cerrada
Destino: [página/base de Notion y proyecto]
Ruta aplicada: [skills y orden]
Resultado: [registros y relaciones creadas/actualizadas]
Evidencia: [URLs, validaciones y estado observado]
No realizado: [límite o pendiente real]
Siguiente responsable: [quién continúa]
```
