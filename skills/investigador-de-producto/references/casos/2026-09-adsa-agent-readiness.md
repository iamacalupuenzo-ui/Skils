# Caso 2026-09: auditoría de "agent readiness" sobre el design system propio

Registro de la primera evaluación en uso completa del sistema. Sirve como material base
del método y como ejemplo de qué nivel de detalle se espera en un registro.

**Nota de honestidad:** esta investigación se ejecutó **antes de que existiera este
skill**. No la condujo el skill; la condujo la conversación, y el skill se escribió
después. Lo que sigue documenta cómo trabajó **la herramienta** y qué método funcionó,
no una corrida del skill.

- **Fechas:** 2026-09-11 (investigación y mejora) y 2026-09-12 (continuación y arreglos)
- **Objeto de estudio:** `adsa-cli`, versión fijada `0.1.5`
- **Sujeto de prueba:** el design system propio en Angular
- **Enfoque:** Herramienta

---

## 1. Decisión que informaba la investigación

Si adoptar una herramienta externa para medir y mejorar qué tan usable es nuestro design
system **para agentes de IA**, y qué parte de esa capacidad debía quedar dentro del
proyecto en vez de depender del producto.

Lector: quien mantiene el design system y quien decide en qué invertir el esfuerzo de
documentación.

---

## 2. Contexto y problema

El design system estaba documentado para personas: un sitio de documentación con
páginas por componente. Un agente que escribe código no lee ese sitio; lee el
repositorio. La pregunta era si eso se podía medir en vez de opinarlo.

---

## 3. Qué es el activo, con su clasificación técnica

Híbrido, y la distinción importa:

| Parte | Qué es | ¿Necesita modelo? |
|---|---|---|
| `adsa-cli audit` | CLI determinista en Node: escanea el repositorio y puntúa contra una rúbrica fija | No |
| `adsa-cli fix <id>` | Generador de plantillas: escribe archivos desde plantillas fijas | No |
| Servidor MCP incluido | Expone las guías del repositorio como herramientas para un agente | No, pero su consumidor sí |
| Skill conversacional incluido | Instrucciones en markdown para que un agente audite conversando | Sí |
| Rúbrica (9 dimensiones, 45 puntos) | Criterio editorial del autor, no un estándar de industria | No |

**Hecho verificado:** cero dependencias, sin llamadas de red, sin hooks de instalación,
sin ofuscación; escribe solo dentro del proyecto. Revisado en el código fuente de la
versión 0.1.5 antes de la primera ejecución.

**Afirmación del producto, no verificada por nosotros:** que su rúbrica refleja lo que
necesita un agente. Es el criterio de un autor, razonable pero no validado de forma
independiente.

---

## 4. Cómo funciona

Lee el repositorio y puntúa nueve dimensiones de 1, 3 o 5: instrucciones para agentes,
superficie consultable por máquina, cobertura de documentación, frescura de la
documentación, tokens, patrones, accesibilidad documentada, verificación y manejo de
huecos.

Detecta componentes leyendo exportaciones en React, Vue, Svelte, Swift y Kotlin.
**No soporta Angular** (hecho verificado leyendo su código): al no encontrar
exportaciones reconocibles, cae a un modo pensado para sistemas distribuidos como hoja
de estilos y cuenta bloques de clases CSS.

Escribe artefactos en `.adsa/`: el puntaje versionable y un reporte que se regenera en
cada corrida. Con `--gate` falla si el puntaje baja respecto del versionado.

---

## 5. Cronología: qué pasó en cada ronda

| Ronda | Puntaje | Qué la causó |
|---|---|---|
| Baseline, sin tocar nada | **11/45** | Estado real: documentación para personas, nada para agentes |
| Tras 4 fixes automáticos del producto | 25/45 | Instrucciones para agentes, lista de huecos, MCP y documento de tokens |
| Tras corregir el documento de tokens | **27/45** | **Bajó a propósito**: la plantilla del producto documentaba tokens que no existen. Corregirlo bajó el número y mejoró el sistema |
| Tras reapuntar la configuración | 29/45 | Estaba midiendo la app de documentación, no la librería |
| Tras la primera tanda de guías | 33/45 | Cobertura al 85% |
| Tras cubrir todo y automatizar | **45/45** | Guías generadas desde el código, validadores y CI |
| Continuación 2026-09-12 | 45/45 | Se mantuvo tras traer cambios nuevos del repositorio |

La bajada de 29 a 27 es el dato más instructivo del caso: **el indicador premiaba un
documento que mentía**. Sin métrica propia, la reacción natural habría sido dejar la
plantilla falsa para conservar el puntaje.

---

## 6. Qué ofrecía el producto y qué hizo falta hacer a mano

| Comando | Qué hace técnicamente | ¿Escribe archivos? | Decisión humana requerida |
|---|---|---|---|
| `fix agents-md` | Escribe instrucciones para agentes desde plantilla | Sí | Corregir el nombre de importación, que salió mal |
| `fix gaps-file` | Crea la lista de huecos con filas de ejemplo | Sí | Reemplazar los ejemplos por los huecos reales |
| `fix mcp-config` | Registra su servidor MCP | Sí, configuración | Aprobar, y fijar la versión en vez de `@latest` |
| `fix tokens-doc` | Escribe un documento de tokens de ejemplo | Sí | Reescribirlo entero: los tokens de la plantilla no existían |
| `fix ci-workflow` | Agrega un workflow de CI | Sí | Aprobación explícita; quedó bloqueado por permisos |

**Inferencia:** los generadores del producto sirven como andamio, no como resultado.
Todo lo que escribió fue reescrito o corregido.

---

## 7. Lo que hubo que construir como capacidad propia

Porque el producto no soporta Angular y porque su rúbrica premia la presencia de
artefactos, no su veracidad:

- Un parser de componentes de Angular que lee inputs, outputs, tipos y valores por
  defecto del código.
- Generadores que escriben la tabla de props y un contrato de accesibilidad **desde el
  código** en cada guía, con las descripciones escritas a mano preservadas.
- Cuatro validadores: cobertura de exportaciones, props al día, contratos al día y
  ejemplos válidos contra la API real.
- Sus propios tests, que **rompen cada validador a propósito** para demostrar que
  detecta lo que dice detectar.
- Workflow de CI que corre todo en cada cambio.

**Esto es lo que queda si el producto desaparece.** La dependencia real del producto
quedó reducida a la medición y a un gate opcional.

---

## 8. Hallazgos

### Sobre el producto

1. No soporta Angular; requiere configuración manual y cae a un modo aproximado.
2. Sus plantillas traen contenido de ejemplo que, si se acepta, publica documentación
   falsa.
3. Mide presencia, no veracidad: el puntaje subía igual con tablas inventadas.
4. Publicado por un solo mantenedor y muy reciente. El código resultó limpio, pero la
   revisión fue necesaria, no opcional.

### Sobre nuestro sistema (los que valen)

Aparecieron **al lado** de lo que la herramienta señaló, no dentro:

1. Contenido colapsado que seguía siendo enfocable por teclado.
2. Botones repetidos con el mismo nombre accesible.
3. Un grupo de navegación sin indicar si estaba abierto.
4. Nombres de ícono sin validación en compilación.
5. Dos componentes duplicados con la misma API.
6. Animaciones que ignoraban la preferencia de movimiento reducido.
7. Un documento de tokens completamente ficticio.
8. Un test que ya fallaba en la rama principal.

Todos corregidos y verificados el 2026-09-12, salvo los que el usuario decidió no tocar.

---

## 9. Qué no se pudo verificar

- El comportamiento de las animaciones: el navegador de la sesión no dibujaba y sus
  temporizadores no avanzaban. Se verificó lo sincrónico y se declaró lo demás como no
  observado.
- La construcción de Storybook tras el cambio de tipado de íconos.
- Que la rúbrica del producto correlacione con que un agente produzca mejor código. Es
  la hipótesis central del producto y sigue sin validar.

---

## 10. Métricas propias, más allá del puntaje

| Métrica | Resultado |
|---|---|
| Hallazgos reales en nuestro sistema | 8 |
| Documentación falsa detectada y corregida | 1 documento completo, 1 afirmación en una guía |
| Controles que demuestran detectar su error | 16 tests |
| Exportaciones públicas con guía verificada | 28 de 28 |
| Lo producido | 71 archivos, unas 4.600 líneas, en 3 commits |

**Criterio de éxito definido antes:** que el sistema quede en un estado donde un cambio
futuro no pueda desalinear la documentación en silencio. Cumplido: al traer un
componente nuevo el 2026-09-12, el gate lo detectó solo.

---

## 11. Veredicto

**Adaptar.** Se adopta como instrumento de medición, con versión fijada, y se rechaza
como fuente de la solución: lo que escribe es andamio.

- Dentro del proyecto y propio: guías, generadores, validadores, tests y CI.
- Externo y opcional: el CLI de medición, sus artefactos de puntaje y el gate.
- Costo de mantenimiento: los generadores viven con el código; si un componente cambia,
  el CI lo exige.
- Riesgo de dependencia: bajo. Si el producto desaparece, se pierde el número, no la
  capacidad.

---

## 12. Experimento pendiente

La pregunta que ninguna de las dos corridas respondió: **¿un agente produce mejor código
con estas guías que sin ellas?**

Diseño mínimo: tomar tres tareas de UI representativas, pedirlas a un agente con el
repositorio en el estado previo y en el actual, y comparar contra criterios objetivos
(componentes correctos, props válidas, tokens en vez de valores crudos, accesibilidad
mínima). Criterio de éxito: menos errores de API y menos valores crudos en el estado
actual. Hasta hacerlo, que la documentación mejore el trabajo de un agente sigue siendo
**hipótesis a validar**, no hecho verificado.
