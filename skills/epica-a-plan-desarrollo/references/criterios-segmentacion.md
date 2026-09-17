# Criterios de segmentación — de épica a historias ejecutables

Metodología para decidir qué es un módulo, qué es un flujo y qué es una historia de
usuario dentro de una épica. No es mecánico: exige criterio de producto, pero cada
decisión debe poder trazarse a un fragmento concreto de la épica original.

## Jerarquía

```
Épica
 └── Módulo          (agrupación funcional coherente)
      └── Flujo       (secuencia end-to-end dentro del módulo)
           └── Historia de usuario   (unidad chica, INVEST)
                └── Criterio de aceptación   (Given/When/Then)
```

- **Módulo**: agrupación funcional que normalmente se mapea 1:1 con un dominio de
  backend o una sección coherente de la UI. Ejemplos: "Autenticación", "Checkout",
  "Notificaciones", "Gestión de pedidos".
- **Flujo**: secuencia de pasos end-to-end dentro de un módulo, con actor, disparador,
  pasos intermedios, sistemas involucrados y resultado esperado. Ejemplo: dentro del
  módulo "Autenticación", el flujo "Recuperar contraseña".
- **Historia de usuario**: la unidad más chica que todavía entrega valor por sí sola.
  Formato: "Como [rol], quiero [acción], para [beneficio]".

## Checklist INVEST por historia

Aplicar a cada historia antes de darla por cerrada:

| Letra | Pregunta | Si falla |
|---|---|---|
| Independiente | ¿Se puede desarrollar sin esperar otra historia del mismo flujo? | Fusionarla con la que depende, o declarar la dependencia explícitamente en el plan |
| Negociable | ¿Describe un resultado, no una implementación fija? | Reescribir en términos de comportamiento observable |
| Valiosa | ¿Alguien nota si esta historia no se hizo? | Si no, probablemente es una tarea técnica, no una historia — va como nota de implementación dentro de otra historia |
| Estimable | ¿El equipo podría dar un tamaño aproximado con lo que dice la historia? | Falta información — marcar como [SUPUESTO] o [PENDIENTE DE DEFINIR] |
| Pequeña | ¿Cabe en una iteración de desarrollo corta? | Aplicar un patrón de split (ver abajo) |
| Testeable | ¿Tiene al menos un criterio de aceptación verificable? | No cerrar la historia sin al menos un Given/When/Then |

## Patrones de split (cuando una historia todavía es grande)

Adaptado de la práctica de descomposición de épicas de Humanizing Work. Usar el que
mejor corte el trabajo sin romper "Valiosa":

1. **Pasos del flujo de trabajo** — dividir por etapas secuenciales del flujo (ej:
   "cargar producto" vs "confirmar pago" vs "enviar confirmación").
2. **Reglas de negocio / variaciones** — una historia por regla o excepción relevante
   (ej: descuento estándar vs descuento por volumen).
3. **Variaciones de datos** — por tipo de entidad o formato (ej: pago con tarjeta vs
   pago con billetera digital).
4. **Operaciones CRUD** — crear, leer, actualizar, eliminar como historias separadas
   cuando cada una tiene reglas propias.
5. **Roles / personas** — la misma acción vista desde distintos roles con permisos o
   resultados distintos (ej: el flujo de aprobación visto por el solicitante vs el
   aprobador).
6. **Variaciones de interfaz** — web vs mobile vs API, solo si de verdad tienen
   reglas de negocio distintas, no solo layout.
7. **Camino simple vs casos borde** — primero la historia del happy path, después
   una historia por cada caso borde relevante que la épica menciona o implica.

## Anti-patrones

- **Dividir por capa técnica** ("historia de frontend" + "historia de backend" para
  la misma funcionalidad): casi siempre rompe "Valiosa", porque ninguna mitad sirve
  sola. Evitarlo salvo que el usuario lo pida explícitamente para paralelizar equipos.
- **Historias que son en realidad tareas técnicas** ("configurar la base de datos"):
  van como nota de implementación dentro de la historia que las necesita, no como
  historia propia.
- **Módulos inventados por prolijidad**: si la épica no sugiere un límite de dominio
  ahí, no crear un módulo solo para que la tabla se vea more granular.

## Manejo de ambigüedad

Si la épica no especifica algo necesario para completar una historia o un criterio
de aceptación (roles exactos, límites numéricos, validaciones, mensajes de error),
no se decide por el usuario: se marca explícitamente como `[SUPUESTO]` en el
documento de salida, con la opción más razonable propuesta y la razón. Nunca se
presenta un supuesto como si fuera un hecho de la épica original.
