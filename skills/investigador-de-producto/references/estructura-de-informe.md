# Estructura de informe, evidencia y clasificación de activos

Criterio fijo de cómo se escribe una investigación, cómo se etiqueta cada afirmación y
cómo se clasifica el objeto estudiado. No cambia con el contexto.

---

## Estructura del informe

Relato, no inventario de funciones. Nueve secciones, en este orden:

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
más prolijo.

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
