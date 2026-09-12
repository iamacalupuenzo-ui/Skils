# Formas de skill y qué estructura le corresponde a cada una

No todos los skills tienen la misma forma, y medirlos a todos con la vara del orquestador
produce ruido. Esta referencia define las cuatro formas observadas en la colección, qué
secciones son obligatorias en cada una y cuáles no aplican.

Base empírica: barrido de solo lectura sobre los 59 skills de la colección, 2026-09-12.
**30 de 59 no tienen tabla de modos.** No es un defecto de esos 30: es que son de otra
forma. La primera decisión al crear un skill es cuál de estas cuatro es.

---

## 1. Orquestador con modos

Guía decisiones, detecta en qué situación está el usuario y rutea. El comportamiento
cambia según el modo.

Ejemplos de la colección: `product-discovery`, `centro-operativo-uxui`, `notion-workspace`,
`investigador-de-producto`.

| Sección | ¿Obligatoria? |
|---|---|
| Tabla de modos con señales y criterio de desempate | Sí |
| Un protocolo por modo, con fases numeradas | Sí, sin excepción |
| Bloque de cierre por modo | Sí |
| GUARD | Sí |
| Bloqueantes numerados | Sí, mínimo según `effort` |
| Formato de respuesta con declaración de modo | Sí |
| Referencias al final | Sí |

Riesgo propio de esta forma: declarar un modo en la tabla y no escribir su protocolo.
En el barrido apareció en 5 skills, y es comportamiento indefinido: el skill entra a un
estado que nadie describió.

---

## 2. Ejecutor lineal

Un solo procedimiento, siempre el mismo, en pasos ordenados. No tiene modos porque no
hay nada que decidir: se corre de principio a fin.

Ejemplos: `audit-a11y`, `audit-copy`, `audit-security`, `audit-spacing`,
`nielsen-heuristic-evaluator`, `ux-writer-evaluator`.

| Sección | ¿Obligatoria? |
|---|---|
| Alcance explícito: qué entra y qué no | Sí |
| Pasos numerados desde 0 | Sí |
| Formato fijo del reporte de salida | Sí, es su único entregable |
| Reglas no negociables | Sí, aunque sean pocas |
| Tabla de modos | **No aplica** |
| Carpeta `references/` | **No aplica** si el conocimiento cabe en el procedimiento |
| GUARD | Solo si toca archivos o un proyecto concreto |

Un ejecutor lineal de 130 líneas sin referencias no está incompleto: está bien
dimensionado. Lo que sí necesita es que su reporte tenga forma fija, porque es lo único
que el usuario recibe.

---

## 3. Constructor con conocimiento estático

El peso está en `references/`: tokens, inventarios, decisiones tomadas, patrones. El
SKILL.md es delgado y orquesta la consulta de ese conocimiento.

Ejemplos: la familia `ds-*`, `lyse-ds`, `comsatel-design-system`, `figma-component-builder`.

| Sección | ¿Obligatoria? |
|---|---|
| GUARD que verifica ≥2 archivos del proyecto | Sí, para no operar sobre el proyecto equivocado |
| Inventario o mapa en `references/`, nunca en el SKILL.md | Sí |
| Puertas de verificación antes de dar algo por terminado | Sí |
| Registro de decisiones ya tomadas, para no reabrirlas | Sí |
| Tabla de modos | Solo si construye y audita con comportamientos distintos |

Riesgo propio: el SKILL.md engorda hasta volverse el inventario. Por encima de 400
líneas, revisar qué se puede mover a `references/`.

---

## 4. Operador de un sistema externo

Habla con una API, una base de datos o un servicio: Notion, ClickUp, un tablero.

Ejemplos: `notion-workspace`, `clickup-reporter`, `finanzas`, `gestion-proyectos`.

| Sección | ¿Obligatoria? |
|---|---|
| IDs, esquemas y valores permitidos en `references/`, nunca de memoria | Sí |
| Anti duplicado antes de crear cualquier registro | Sí |
| Regla de no inventar campos ni valores fuera del esquema | Sí |
| Qué hacer si el sistema externo no responde | Sí, y nunca reportar como guardado algo que no se guardó |
| GUARD que verifica acceso al sistema | Sí |

---

## Reglas transversales, válidas para las cuatro formas

Estas salieron de lo que el barrido encontró incumplido de forma sistemática:

1. **`effort` coherente con los bloqueantes.** `high` exige 7 o más, `medium` 5, `low` 3.
   Declarar `high` sin bloqueantes es una expectativa que el skill no sostiene.
2. **Conocimiento estático fuera del SKILL.md.** Por encima de 400 líneas, casi siempre
   hay inventario mezclado con orquestación.
3. **Formato de respuesta siempre.** Sin él, el mismo skill responde distinto cada vez.
4. **Referencias listadas al final**, con una línea de cuándo consultar cada una.
5. **Frases de trigger reales, mínimo 5**, entre comillas y en las palabras del usuario.
6. **Toda referencia citada existe**, y las de otros skills también.

---

## Dependencias entre skills

Un skill puede citar una referencia de otro. Es legítimo y evita duplicar conocimiento,
pero **nada lo registra hoy**, y en el barrido ya había una rota: un skill citaba un
archivo de otro que no existe.

Reglas:

- La cita cruzada se escribe con la ruta completa desde la raíz de skills, para que se
  vea que es de otro: `otro-skill/references/archivo.md`.
- El SKILL.md declara de quién depende en su sección de referencias, no solo en medio de
  una fase.
- Al crear o auditar, se verifica que el archivo citado exista en el skill dueño.
- Antes de renombrar o borrar una referencia, se busca quién la cita: el dueño no es el
  único afectado.
