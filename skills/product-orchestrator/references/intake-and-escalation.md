# Intake y escalamiento

## Datos mínimos de entrada

El orquestador extrae primero estos datos de la petición, los archivos y el
repositorio. Pregunta únicamente por el vacío que cambie el destino, la
seguridad, el negocio o el resultado.

| Dato | Por qué importa | Señal de que falta |
| --- | --- | --- |
| Resultado y actor | Distingue una pantalla decorativa de una tarea operativa | No se sabe quién completa qué acción |
| Destino | Decide si es consumidor, sistema de diseño o runtime de un framework | Hay más de un repositorio o la ruta no fue indicada |
| Stack y sistema de diseño | Decide qué builder se usa y qué contrato público rige | El repositorio no los declara; el builder los confirma con el usuario |
| Estado de la aplicación | Evita sobrescribir una app o crear una estructura duplicada | No se conoce si existe feature, ruta o datos reales |
| Restricción de negocio | Define permisos, errores, notificaciones y persistencia | Se pide una interfaz sin regla sobre qué ocurre al fallar |
| Éxito observable | Permite validar más que compilación | No se puede describir el flujo crítico que debe funcionar |

No es necesario interrogar al usuario sobre tipografía, componentes o variantes
antes de haber identificado la tarea: esos datos se resuelven desde el contrato
del sistema de diseño elegido y la dirección visual correspondiente.

## Formato de derivación

Cuando el orquestador deriva, comunica una instrucción corta y verificable:

```text
Derivación
Skill destino: [nombre]
Motivo: [hecho que determina el alcance]
Entrada preservada: [objetivo, ruta, restricciones y evidencia]
Salida esperada: [artefacto o verificación]
No autorizado: [acción fuera del alcance]
```

## Formato de handoff al mantenedor del sistema de diseño

Se usa solo cuando un consumidor encontró una falta real de contrato público.
Para Comsatel DS, el mantenedor es `comsatel-design-system`; para otro sistema,
el dueño que indique el usuario.

```text
Handoff a [sistema de diseño]
Necesidad de producto: [tarea del usuario]
Contrato faltante: [componente, input, token, asset o comportamiento]
Evidencia: [API pública inspeccionada, versión y resultado]
Impacto: [estado o flujo bloqueado]
Alternativa temporal segura: [composición pública existente o “ninguna”]
No hacer: copiar internals, CSS o assets de node_modules
```

El handoff no autoriza un cambio al sistema. Su mantenedor evalúa, implementa,
prueba, documenta y publica en un ciclo separado.

## Casos que se deben detener

- El usuario pide una app, pero el destino identificado es un sistema de diseño.
- Se da por hecho un sistema de diseño o un cliente que el proyecto no declara.
- Un repositorio consumidor solicita una propiedad no exportada y alguien
  propone leer o copiar un archivo interno.
- El cambio se describe como Angular general, pero toca `packages/core` de
  Angular sin que `reference-core` esté disponible.
- Se pide “hacerlo más bonito” sin actor o tarea; se puede orientar, pero no
  implementar una solución completa hasta que exista un objetivo operativo.
