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
        └── Tarea / Validación
```

| Entidad | Propósito | Mínimo verificable |
| --- | --- | --- |
| Proyecto | Resultado de negocio o producto | Objetivo, criterio de cierre, responsable, estado, salud y fechas si están acordadas |
| Épica | Alcance que debe segmentarse | Proyecto, fuente, versión del plan, estado, responsable, criterio de cierre e historias relacionadas |
| Historia de usuario | Valor entregable y verificable | Épica, actor/resultado en el contenido, criterios de aceptación, prioridad, estado, responsable y tareas relacionadas |
| Tarea | Trabajo ejecutable | Historia, tipo, estado, ejecutor, criterio de cierre, dependencia, evidencia y fecha si está acordada |
| Validación | Tarea con `Tipo de trabajo = Validación` | Mismo contrato de tarea, con criterio de validación y evidencia de resultado |

No crear una base independiente de Casos de uso: los flujos normales, alternos,
errores, permisos, notificaciones y decisiones viven en el plan Markdown de la
épica. No crear una base de Validaciones mientras las validaciones pertenezcan a
una historia y tengan el mismo ciclo de vida que una tarea.

## Protocolo de escritura

1. Obtén la URL de la página o las bases compartidas. Comprueba la conexión y
   haz fetch del schema vivo; los nombres de bases y propiedades pueden diferir
   entre workspaces.
2. Busca los registros existentes antes de crear. Preserva relaciones, estados,
   páginas hijas y datos no relacionados.
3. Si el usuario autorizó una modificación del modelo, crea primero las bases y
   relaciones. No migres ni borres registros sin releer la rama afectada.
4. Crea o vincula el proyecto. Después crea la épica, las historias y las
   tareas; establece ambas direcciones de cada relación y verifica que no haya
   vínculos duplicados, cíclicos o con padres equivocados.
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
6. Crea tareas solo cuando haya resultado y criterio de cierre. Usa
   `Bloqueada por` / `Bloquea a` para precedencias; el orden numérico no es una
   dependencia. Define el `Tipo de trabajo` y usa `Validación` para pruebas,
   QA, revisión funcional o verificación de accesibilidad.
7. Antes de cerrar, relee el proyecto, la épica, la historia y las tareas
   afectadas. Una tarea hecha requiere evidencia; una historia o épica cerrada
   requiere que todas las validaciones relacionadas estén hechas o que exista
   una excepción aprobada y documentada.

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
