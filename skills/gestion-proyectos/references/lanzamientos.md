# Control de lanzamientos y cambios operativos

## Principio

Un lanzamiento no justifica una acción técnica por sí mismo. Cada cambio de producción debe
partir de una necesidad aprobada, con impacto, responsables, ventana, reversión y validación.

## Ejemplo: migración masiva, accesos e IP

Una planificación correcta no empieza por "definir horarios por compañía". Empieza por
aclarar la necesidad y producir un requerimiento. La cadena típica es:

1. **Entregable: requerimiento de habilitación y seguridad aprobado.** Define quién accede,
   desde dónde, a qué recursos, condiciones de activación, restricciones por IP, vigencia,
   auditoría y responsables de decisión.
2. **Tarea: validar el requerimiento funcional, seguridad e infraestructura.** La salida es
   una decisión aprobada, no una conversación.
3. **Entregable: plan técnico de habilitación listo.** Incluye roles, scripts, códigos de
   activación, lista de IPs, ventana de cambio, pruebas y reversión.
4. **Tareas de ejecución separadas:** elaborar y revisar scripts; generar códigos; configurar
   restricciones; probar en ambiente aplicable; ejecutar en la ventana aprobada.
5. **Entregable: acceso habilitado y validado.** La evidencia confirma usuarios, permisos,
   IPs, códigos y monitoreo; incluye reversión si el resultado no es correcto.

## Checklist de entrada a ejecución en lanzamiento

- Requerimiento y criterio de aceptación aprobados.
- Dueño de negocio, responsable técnico y aprobador identificados.
- Dependencias completadas o aceptadas formalmente como riesgo.
- Ventana, comunicaciones y plan de reversión aprobados.
- Evidencia de pruebas y criterio de go/no-go definidos.
- Monitoreo y responsable de respuesta posterior asignados.

Si cualquiera falta, la ejecución queda bloqueada y se crea la acción que resuelve el hueco;
no se simula avance con tareas de coordinación.
