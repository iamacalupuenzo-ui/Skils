# Estructura de informe, evidencia y clasificación de activos

Criterio fijo de cómo se escribe una investigación, cómo se etiqueta cada afirmación y
cómo se clasifica el objeto estudiado. No cambia con el contexto.

---

## Estructura del informe: dos capas

Un informe se escribe para que el lector lo lea, no solo para registrar. Por eso tiene dos
capas en la misma página: arriba lo que se lee en menos de 5 minutos, y abajo el registro
técnico completo.

### Capa 1 — Lectura (arriba, menos de 5 minutos)

En este orden:

1. **Pregunta previa.** Una cita (`>`) con una pregunta cuya respuesta está en el texto.
   Leer buscando una respuesta es leer de forma activa.
2. **Recursos.** Subpáginas de la investigación (guías, anexos) y los enlaces que el
   lector va a necesitar. Las guías viven dentro de la investigación, nunca como un
   registro suelto en otra base.
3. **En 30 segundos.** Tres líneas numeradas, con la conclusión primero. La tercera
   siempre dice el **estado real**: qué está verificado y qué falta.
4. **La historia.** Cuatro párrafos cortos, cada uno con su etiqueta en negrita:
   **El problema.** · **Qué probamos** (o qué revisamos) · **Qué pasó.** · **Qué decidimos.**
5. **Lo que todavía no sabemos.** Viñetas con lo no verificado, incluidos los puntajes
   propios (ver Métricas).
6. **Qué sigue.** Un paso verificable. Si existe una guía, enlazarla.
7. **Comprueba.** Una pregunta para verificar que se entendió.

Esta capa **se reescribe** en cada actualización para reflejar el estado actual. Una
conclusión vieja arriba y la novedad enterrada abajo es el error que esta capa evita.

### Capa 2 — Detalle técnico y registro completo (abajo)

Después de un divisor (`---`) y el encabezado `## Detalle técnico y registro completo`,
van las nueve secciones del método, en este orden:

1. **Decisión y lector.** Qué se decide con esto y quién lo lee.
2. **Contexto y problema.** Qué duele hoy, sin hablar todavía del producto.
3. **Hipótesis y alcance.** Qué se espera que resuelva y qué queda fuera.
4. **Qué es el activo**, con su clasificación técnica correcta.
5. **Cómo funciona.** Primero en lenguaje llano, después la operación técnica:
   instalación, requisitos, entorno de ejecución, entradas, procesamiento, comandos o
   API, salidas, persistencia, integraciones, permisos y límites o vuelta atrás.
6. **Qué mejoras o acciones ofrece.** Por cada comando o acción: qué hace técnicamente,
   qué resultado le da al equipo, si escribe archivos y si requiere un modelo.
7. **Evidencia, comparaciones, límites e implicancias de seguridad y privacidad.**
8. **Experimento de validación y métricas.**
9. **Recomendación, incertidumbre restante y próximo paso verificable.**

Regla de escritura: la fuente va al lado de la afirmación que sostiene, no en una lista
al final. La evidencia contradictoria se conserva; no se limpia para que el relato quede
más prolijo. Esta capa **se acumula**: lo nuevo se agrega con fecha y lo anterior no se
borra.

### Guía paso a paso (cuando la investigación termina en una acción)

Si el lector va a ejecutar algo por su cuenta (instalar, probar, configurar), se crea una
subpágina `Guía paso a paso: [acción]` y se enlaza en **Recursos**. La guía existe para
que la persona no dependa de una IA para ejecutar.

- Arriba: pregunta previa y "En 30 segundos", igual que la capa 1.
- **Paso 0** explica qué se va a construir o usar, en lenguaje llano y con un diagrama si
  ayuda. Dice si ya está instalado o no, verificado en el equipo.
- Cada paso lleva: **Dónde** (qué programa o carpeta), **Haz esto** (comando o acción
  exacta, lista para copiar), **Debes ver** (salida real observada) y **Listo cuando**.
- Las explicaciones y lo opcional van en bloques desplegables, no en el camino principal.
- Sección **Si algo falla**: un bloque desplegable por error, con qué se ve, por qué pasa
  y qué hacer. Cada error se etiqueta **reproducido** (provocado a propósito) o
  **probable** (no reproducido en el entorno).
- Cierre con una pregunta de comprobación y una nota: fecha, versiones y entorno donde se
  probó, y dónde no se probó.
- Todo comando y código se ejecuta antes de publicarse. Una guía sin probar no se publica
  como guía.

### Formato en Notion

- Encabezado 2 para secciones y encabezado 3 para subsecciones. **Nunca encabezado 1**:
  es demasiado grande.
- Íconos nativos de Notion (`icons/<nombre>_blue`), **nunca emojis**, tanto en la página
  como en los bloques destacados. En lugar de un callout con emoji, usar una cita (`>`).
- Tablas de tres columnas como máximo en la capa 1, para que se lean en el celular.
- En los bloques de código, Notion quita los espacios iniciales comunes a todas las
  líneas. Si un fragmento de Python debe pegarse con sangría, la primera línea va pegada
  al borde (por ejemplo, un comentario `#`) y verificar el resultado con un fetch.

---

## Etiquetas de evidencia

Cada conclusión lleva una:

| Etiqueta | Qué significa | Cómo se obtiene |
|---|---|---|
| Hecho verificado | Observado por nosotros y repetible | Ejecutando, leyendo la fuente, midiendo |
| Afirmación del producto | Lo dice su sitio o su documentación | Citar y marcar como no verificado |
| Inferencia | Conclusión razonada desde hechos | Explicitar de qué hechos sale |
| Hipótesis a validar | Todavía no se probó | Indicar cómo se probaría |

Una investigación sin hechos verificados es una reseña.

No afirmar que algo es local, privado, seguro, de código abierto o que funciona sin
modelo sin evidencia **de la versión concreta** que se evaluó.

---

## Clasificación de activos

Clasificar mal el objeto lleva a decisiones equivocadas: se le pide criterio a un
programa determinista, o se automatiza algo que necesitaba juicio.

| Tipo | Qué hace | ¿Necesita un modelo? |
|---|---|---|
| Programa o CLI | Ejecuta pasos deterministas sobre entradas conocidas | No |
| Generador de plantillas | Escribe archivos desde plantillas fijas | No |
| Servidor MCP | Expone datos o acciones para que un agente las consuma | No, pero su consumidor sí |
| Skill | Guía las decisiones de un agente con criterio escrito | Sí |
| Servicio | Corre fuera de nuestra máquina y recibe nuestros datos | Depende, y hay que decirlo |
| Método | Procedimiento humano, con o sin herramienta | No |

Casi todo producto interesante es híbrido. Cuando lo sea, decir **qué parte es cuál** y
qué partes corren sin modelo. Una rúbrica incluida en un producto es criterio editorial
de su autor, no un estándar, y se nombra como tal.

---

## Métricas

- Preferir métricas de resultado sobre métricas de actividad: no "cuántas guías se
  escribieron" sino "cuántos errores evita ahora el sistema".
- El puntaje que da el propio producto nunca es la medida de éxito. Puede ser una señal,
  siempre acompañada de al menos una métrica propia definida antes de empezar.
- Todo experimento de validación declara: línea base, métrica de resultado y criterio de
  éxito. El más chico que responda la pregunta gana.
- Un puntaje propio con pesos elegidos por nosotros (por ejemplo, "86/100" en una
  comparación) es una **inferencia**, no una medición. Se etiqueta como estimación y se
  nombra en "Lo que todavía no sabemos". Desconfiar del puntaje del proveedor y aceptar
  el propio sin etiqueta es el mismo error.
