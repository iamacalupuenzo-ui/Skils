# Patrones de trazabilidad para gestión de proyectos

Este skill adapta patrones de gestión a la estructura real de Notion; no intenta imponer un
framework ajeno ni reemplazar relaciones que ya funcionan.

## 1. Estructura de alcance y estructura de ejecución

La jerarquía de alcance responde **qué** debe lograrse: proyecto y entregables. Debe cubrir
todo el alcance aprobado, sin superposición entre ramas y con el nivel de detalle necesario
para controlar el trabajo. La ejecución responde **cómo y cuándo**: tareas, subtareas,
dependencias, responsables, fechas y evidencias.

Por ello, un entregable se nombra como resultado; una tarea o subtarea, como acción sobre un
resultado. La relación padre-hijo no sustituye a las dependencias de ejecución.

## 2. Diccionario operativo de cada ítem

La trazabilidad no depende solo de relaciones. Para cada entregable o paquete de trabajo
relevante, mantener propósito, alcance, exclusiones, dueño, entradas, dependencias, criterio
de aceptación, evidencia y condición de cambio. En Notion se distribuye entre propiedades,
descripción y actas/evidencias relacionadas.

## 3. Reglas de calidad de la descomposición

- **Cobertura:** cada rama contiene todo el trabajo necesario para su padre, incluido
  control, validación y transición cuando corresponda.
- **Exclusividad:** una unidad de trabajo tiene un solo lugar lógico; si contribuye a varios
  resultados, se vincula mediante dependencias o referencias, no se duplica.
- **Responsabilidad:** la unidad que se estima, controla y cierra tiene un responsable claro.
- **Granularidad útil:** descomponer hasta poder asignar, estimar, medir y controlar. No
  convertir el seguimiento diario en decenas de subtareas sin salida verificable.
- **Elaboración progresiva:** detallar el trabajo futuro cuando exista información suficiente;
  mantener explícitos los supuestos y no simular precisión.

## 4. Cadena de trazabilidad

```text
Necesidad / requisito
  → criterio de aceptación
  → entregable
  → tarea y subtareas
  → dependencia / riesgo / decisión
  → prueba, evidencia y aceptación
```

La cadena se usa para responder: qué requisito justifica el trabajo, qué entrega produce,
qué lo bloquea, quién decide el cambio y con qué evidencia se cerró.

## 5. Riesgos, incidencias y cambios

- **Riesgo:** evento incierto futuro; se gestiona con dueño y respuesta.
- **Incidencia:** problema presente; requiere resolución, escalamiento o decisión.
- **Cambio:** variación propuesta a la línea base; debe evaluar impacto en alcance,
  dependencia, fecha, responsable y aceptación antes de aprobarse.

No mezclar estos tres conceptos como subtareas. Solo la acción de respuesta se convierte en
trabajo ejecutable.

## Fuentes de criterio

- PMI, *Work Breakdown Structure Practice Standard*: descomposición jerárquica orientada a
  entregables para definir el alcance y gestionar riesgo, cronograma y desempeño.
- PMI, *Work Breakdown Structure: Define the Work Before You Build It* (2026): regla del
  100 %, exclusividad de elementos, paquete de trabajo con responsable y línea base con
  control de cambios.
- PMI, *Lexicon of Project Management Terms* v5.0 (2026): registro, dueño y respuesta de
  riesgo como elementos diferenciados de la ejecución.
