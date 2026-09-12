# Control, riesgo, estatus y proyección

## Riesgo

Un riesgo se registra con: evento incierto, causa, impacto, probabilidad, disparador,
dueño, respuesta preventiva, contingencia y fecha de revisión. La mitigación se traduce en
tareas solo cuando requiere trabajo concreto.

## Estado basado en evidencia

Para reportar una tarea, entregable o proyecto, separar:

| Categoría | Contenido |
|---|---|
| Hechos | Estado, evidencia, fechas reales, dependencias resueltas y resultados comprobados. |
| Desviaciones | Compromisos vencidos, bloqueos, incoherencias y ausencia de evidencia. |
| Riesgos | Hechos futuros inciertos, con impacto y dueño. |
| Próxima acción | Acción concreta, responsable y fecha acordada o supuesto explícito. |
| Proyección | Fecha o escenario condicionado por capacidad y dependencias; nunca una certeza sin base. |

## Indicadores mínimos

- Entregables por estado y bloqueados.
- Tareas sin criterio de cierre, responsable, fecha, padre o entregable cuando corresponda.
- Tareas vencidas y bloqueadas, con antigüedad del bloqueo.
- Dependencias incumplidas o sin dueño, relaciones no recíprocas y ciclos.
- Restricciones activas por tipo, condición de desbloqueo e impacto aguas abajo.
- Cantidad de elementos bloqueados directa e indirectamente por cada causa.
- Diferencia entre `Estado` y `Completada`.
- Avance real sustentado en resultados, no en conteo de tareas creadas.

## Reglas de escalamiento

Escalar cuando una decisión excede al ejecutor, una dependencia compromete un hito, un
riesgo cruza el umbral acordado o falta información indispensable para continuar. El reporte
de escalamiento debe pedir una decisión concreta y explicar el impacto de decidir/no decidir.

## Contrato del avance

Antes de calcular, leer fórmula/rollup, unidad de medida, población, pesos y tratamiento de
canceladas del proyecto. Reportar el cálculo existente como tal; no cambiar fórmulas de
Notion por iniciativa propia. No mezclar tareas padre e hijas en el mismo denominador.

Si no hay un modelo acordado, entregar conteos por estado y declarar que el porcentaje
global no está definido. Para comparar escenarios se puede proponer, sin guardarlo como
avance oficial, el siguiente modelo de unidades de trabajo hoja:

- Población U: hojas activas del alcance acordado, sin canceladas ni doble conteo de padres.
- Pesos w: esfuerzo o ponderación aprobados; pesos iguales solo como supuesto explícito.
- Avance operativo: 100 × suma de pesos de hojas Hecho / suma de pesos de U.
- Aceptación: 100 × peso de entregables aceptados / peso de entregables activos.
  No mezclar este denominador con el anterior.
- Población vacía, peso ausente o denominador cero: No calculable, nunca 0% ni 100%.
- Cambiar alcance o cancelar elementos cambia el denominador: registrar la variación
  y no presentarla como productividad. Mantener comparación contra la línea base.

Ejemplo ilustrativo: tres hojas activas con peso igual y dos Hecho dan 66,7% operativo.
Una cuarta hoja cancelada se excluye del escenario actual, pero se informa el cambio de
alcance. Aunque las tres hojas estén Hecho, el padre puede seguir En revisión por aceptación.

## Proyección reproducible

1. Identificar trabajo restante, esfuerzo, capacidad disponible y calendario laboral.
2. Leer dependencias y compromisos; detectar ciclos y supuestos sin confirmar.
3. Para cada actividad, inicio posible = máximo entre disponibilidad del recurso y
   final de sus predecesoras necesarias. Duración estimada = esfuerzo restante / capacidad,
   usando unidades compatibles y calendario. No dividir entre capacidad cero o desconocida.
4. Propagar las fechas por la cadena; si recursos se comparten, nivelar su capacidad:
   dos tareas no pueden consumir a la vez la misma disponibilidad completa.
5. Reportar escenario, fecha de corte, datos, supuestos y desviación frente al compromiso.
   No confundir fecha prometida con fecha proyectada ni sobrescribir compromisos.
6. Si falta un dato crítico, declarar Sin base suficiente para proyectar y listar el dato.
   Un rango solo se informa si existen supuestos de escenarios que lo sustenten.

## Reglas de medición complementarias

Vencida: fecha compromiso anterior al corte y estado activo no terminado, según calendario
y zona horaria del proyecto. Edad de bloqueo: desde primera evidencia de impedimento, no
desde creación. Estado En revisión con validación vencida cuenta como pendiente de aceptación.
Toda cifra declara población, corte y fuente; las comunicaciones no aumentan avance operativo.
