# Descomposición y contenido de trabajo

## Prueba de necesidad

Antes de crear un ítem, responder:

1. ¿Qué resultado verificable cambia al completarlo?
2. ¿Qué decisión, requisito, dependencia o riesgo lo justifica?
3. ¿Quién lo ejecuta y quién acepta el resultado?
4. ¿Qué evidencia permite cerrarlo?

Si no hay respuesta, no crear una tarea: registrar una pregunta abierta, un riesgo o una
decisión pendiente según corresponda.

## Criterio para cada nivel

| Nivel | Debe expresar | No debe ser |
|---|---|---|
| Entregable | Resultado o capacidad usable y aceptable | Una reunión, una fase o una lista de acciones. |
| Tarea | Bloque de trabajo con un resultado y dueño | Un contenedor por equipo sin resultado. |
| Subtarea | Acción indivisible, ejecutable y comprobable | Un seguimiento genérico, una persona o un recordatorio. |

## Estructura obligatoria de una tarea o subtarea relevante

- **Propósito y resultado:** qué cambia y para qué.
- **Alcance:** qué incluye y, si es necesario, qué excluye.
- **Entrada o dependencia:** requerimiento, decisión, evidencia o tarea previa.
- **Responsable y ejecutor:** quién responde por el cierre y quién realiza el trabajo.
- **Criterio de cierre:** condición observable, no una frase como "terminar" o "coordinar".
- **Evidencia:** acta, aprobación, enlace, prueba, archivo, captura o registro.
- **Riesgo/control:** solo cuando el trabajo expone una condición relevante.

La información estable del ítem vive en propiedades; las decisiones, acuerdos, supuestos y
actualizaciones con fecha viven en el contenido de la página o en evidencias relacionadas.

## Redacción obligatoria de la descripción

La propiedad **Descripción** debe permitir que el ejecutor entienda qué tiene que hacer sin
interpretar jerga técnica, revisar una conversación previa ni deducir el resultado esperado.
Redactarla como una instrucción completa y orientada a la acción:

> **[Ejecutor] debe [verbo + resultado concreto] [usando o a partir de la entrada/dependencia], para [objetivo], dejando [resultado] listo para [quien valida o siguiente responsable].**

Adaptar la frase cuando no aplique alguno de sus componentes, pero nunca omitir el ejecutor,
la acción concreta o el resultado. Usar lenguaje de negocio u operativo; mencionar términos
técnicos solo si son necesarios para ejecutar el trabajo y explicar su propósito en la misma
oración.

Ejemplos:

- **Tarea:** "Bryan y Marketing deben elaborar el video tutorial corto de acceso a C-Go usando la capacitación recibida y el usuario demo habilitado, para entregar una versión lista para revisión funcional de Lorena."
- **Subtarea:** "Ilver debe entregar a Bryan y Marketing las grabaciones de los flujos acordados de C-Go, para que Diseño pueda producir el video y el manual de ingreso."

No usar descripciones como "coordinar video", "revisar material", "gestionar con Desarrollo"
o frases que solo nombren un área, una herramienta o un tema. Si aún no se conoce la acción o
el resultado, registrar la incertidumbre como decisión o pregunta abierta; no ocultarla con una
descripción genérica.

## Secuencia de trabajo correcta

Para cambios con impacto funcional u operativo:

```text
Necesidad / problema
→ Requerimiento y criterio de aceptación
→ Validación funcional y decisión de alcance
→ Diseño técnico o plan operativo
→ Preparación / configuración
→ Ejecución
→ Prueba y evidencia
→ Aceptación y cierre
```

No todos los pasos son subtareas del mismo padre: el PM agrupa por resultado. Por ejemplo,
el requerimiento puede ser un entregable previo que desbloquea el entregable de implementación.

## Antipatrones

- Separar por áreas sin definir una salida concreta por área.
- Crear subtareas con `Por definir` como descripción o criterio de cierre.
- Programar una ejecución de producción antes de definir y validar el cambio.
- Convertir cada conversación en una tarea.
- Mezclar descubrimiento, aprobación, implementación y validación en una sola subtarea.
- Usar una fecha de lanzamiento como única razón para crear trabajo sin dependencias ni criterio.
