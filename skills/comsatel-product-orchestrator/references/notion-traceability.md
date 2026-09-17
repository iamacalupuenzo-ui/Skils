# Trazabilidad de producto en Notion

Usar esta referencia únicamente cuando el usuario haya autorizado gestionar
planificación, ejecución o seguimiento en Notion. Notion es la fuente de
verdad para el trabajo planificado y su estado; GitLab/GitHub conserva la
fuente técnica, commits, ramas, merge requests e incidencias externas.

## Modelo mínimo

```text
Proyecto
└── Épica
    └── Historia de usuario
        └── Caso de uso
```

| Entidad | Propósito | Mínimo verificable |
| --- | --- | --- |
| Proyecto | Resultado de negocio o producto | Objetivo, criterio de cierre, responsable, estado, salud y fechas si están acordadas |
| Épica | Alcance que debe segmentarse | Proyecto, fuente, versión del plan, estado, responsable, criterio de cierre e historias relacionadas |
| Historia de usuario | Alcance funcional y fuente oficial | Épica, actor/resultado en el contenido, criterios de aceptación, prioridad, estado, responsable y casos relacionados |
| Caso de uso | Flujo, regla o interacción verificable dentro de una historia | Una historia padre, flujo end-to-end, casuísticas, criterios Given/When/Then, recomendación de interfaz, pruebas y dependencias |

Cuando el workspace ya tiene una base canónica de Casos de uso, se usa para
preservar los flujos normales, alternos, errores, permisos, notificaciones y
decisiones dentro de la historia correspondiente. No crear una tabla paralela
por proyecto ni usar una historia hija para representar un caso de uso.

## Protocolo de escritura

1. Obtén la URL de la página o las bases compartidas. Comprueba la conexión y
   haz fetch del schema vivo; los nombres de bases y propiedades pueden diferir
   entre workspaces.
2. Busca los registros existentes antes de crear. Preserva relaciones, estados,
   páginas hijas y datos no relacionados.
3. Si el usuario autorizó una modificación del modelo, crea primero las bases y
   relaciones. No migres ni borres registros sin releer la rama afectada.
4. Crea o vincula el proyecto. Después crea la épica, las historias y los
   casos de uso; establece ambas direcciones de cada relación y verifica que
   no haya vínculos duplicados, cíclicos o con padres equivocados. Cada caso
   se vincula a exactamente una historia padre.
5. Para una épica segmentada, añade al cuerpo de la página el plan Markdown con
   este orden:

   ```markdown
   # Fuente
   [texto, enlace o export de la épica]

   # Plan de desarrollo vN
   ## Objetivo y alcance
   ## Módulos y flujos end-to-end
   ## Historias de usuario
   ## Criterios de aceptación
   ## Dependencias, riesgos y supuestos
   ## Plan de pruebas y orden de implementación
   ```

   Si se replantea el alcance, agrega `Plan de desarrollo vN+1`; no sobrescribas
   la versión anterior.
6. Antes de crear un caso, relee el contenido de la historia y todos sus casos
   asociados. Mejora primero el caso existente cuando cubra el mismo flujo;
   crea uno nuevo solo si hay un flujo independiente. Documenta flujo normal,
   alternos, errores, permisos, estados, criterios Given/When/Then,
   recomendación UI/UX, pruebas y dependencias que la fuente sustente.
7. Antes de cerrar, relee el proyecto, la épica, la historia y los casos
   afectados. Una historia o épica no se declara terminada por esta
   trazabilidad: el mapeo solo confirma cobertura analizada y conserva los
   pendientes o decisiones abiertas como tales.

## Reentrada en un modelo ya configurado

Una configuración verificada de bases, relaciones y vistas es una línea base,
no un paso que se repite ante cada épica.

1. Reconoce si el contexto ya declara el modelo como creado y validado. En ese
   caso, localiza el Proyecto, la Épica, la Historia o el Caso de uso objetivo y
   modifica solo esos registros.
2. La página principal sirve como navegación o tablero. No agregues instrucciones
   de proceso, planes extensos ni vistas nuevas allí salvo que el usuario pida
   expresamente editar la página principal. El plan versionado se guarda en el
   cuerpo de la Épica.
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

- **CA-01** DADO [contexto], CUANDO [acción], ENTONCES [resultado observable].

## Recomendaciones de interfaz

- [jerarquía, feedback, accesibilidad y componentes del sistema de diseño]

## Pruebas y evidencia

- [funcionales, borde y no funcionales pertinentes]

## Dependencias y límites

- [contrato, decisión o restricción verificable]
```

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
