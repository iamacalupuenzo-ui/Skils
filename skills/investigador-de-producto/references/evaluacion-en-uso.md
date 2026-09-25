# Evaluación en uso: probar un producto sobre algo nuestro

La investigación web dice qué promete un producto. Esta referencia cubre la otra mitad:
**correrlo sobre un sistema real nuestro y medir qué cambió**. Es el único modo de
separar lo que el producto declara de lo que produce.

Aplica cuando el objeto de estudio se puede ejecutar: un CLI, una integración, un
servicio, un método con pasos. No aplica a un producto que solo se puede leer.

---

## Fase 0 — Preparación

Antes de ejecutar nada:

1. **Decisión que informa.** Qué se va a decidir con el resultado: adoptar, adaptar,
   descartar, o convertirlo en capacidad propia. Sin decisión, no se abre la prueba.
2. **Sujeto de prueba real.** Se prueba sobre un sistema propio que importe, no sobre un
   ejemplo de juguete. Un producto se comporta distinto contra un caso real.
3. **Línea base medida antes de tocar nada.** El primer número se toma con el sistema
   como está. Sin baseline no hay antes y después, solo opinión.
4. **Versión congelada.** Se fija la versión exacta (`@x.y.z`), nunca `@latest`. Un
   resultado contra una versión móvil no es reproducible ni auditable.
5. **Revisión del código antes de ejecutarlo.** Ver la sección de seguridad abajo.
6. **Criterio de éxito propio**, distinto de la métrica del proveedor. Qué tiene que
   pasar en nuestro sistema para considerar que el producto sirvió.

---

## Fase 1 — Primera corrida, sin corregir nada

Correr el producto tal cual, sin ajustar configuración ni arreglar lo que reporte. Esa
foto es el diagnóstico inicial y es irrepetible: una vez que se toca el sistema, ya no
se puede volver a obtener.

Registrar la salida completa, no solo el número final.

---

## Fase 2 — Leer el diagnóstico con criterio

Antes de obedecer al producto, verificar tres cosas:

- **¿Está mirando el objeto correcto?** Muchas herramientas asumen un stack. Si detecta
  el proyecto equivocado, todo lo que reporte es ruido. Se corrige la configuración y se
  vuelve a medir, y ese ajuste se registra como hallazgo sobre el producto.
- **¿Qué mide y qué no?** Escribir explícitamente la frontera. Casi siempre mide
  presencia de artefactos, no calidad ni comportamiento.
- **¿Alguna recomendación es falsa para nuestro caso?** Una recomendación que no aplica
  no se aplica, y queda documentada como límite del producto.

---

## Fase 3 — Intervenir por rondas

Cada ronda: aplicar un grupo de cambios, volver a medir, registrar el salto y su causa.

Reglas:

- **Un cambio que sube el indicador sin mejorar el sistema no cuenta como mejora.** Se
  marca como tal en el registro.
- **El indicador puede bajar cuando se corrige una mentira.** Es una señal sana: quiere
  decir que el estado anterior estaba inflado. Se documenta el motivo.
- **Las plantillas que genera el producto se revisan línea por línea.** Suelen traer
  contenido de ejemplo que, si se deja, publica documentación falsa.
- **Nunca se ejecuta un comando del producto que escriba en CI, en configuración
  compartida o en el repositorio sin aprobación explícita del usuario.**

---

## Fase 4 — Verificación independiente

El puntaje del proveedor no valida nada por sí solo. Cada cambio se verifica con
evidencia propia:

- Comportamiento observado en ejecución real, no solo el archivo escrito.
- Una prueba que falle a propósito para demostrar que el control funciona.
- Contraste con la fuente de verdad del sistema (el código, no la documentación).

Si el entorno impide observar algo (por ejemplo, animaciones en un navegador que no
dibuja), se declara como no verificado en vez de asumirlo.

---

## Fase 5 — Veredicto

Cerrar con cuatro respuestas:

| Pregunta | Por qué importa |
|---|---|
| ¿Adoptar, adaptar o descartar? | La decisión que abrió la investigación |
| ¿Qué queda dentro del proyecto y qué sigue siendo externo? | Define la dependencia real |
| ¿Cuánto cuesta mantenerlo? | Un control que nadie mantiene se apaga solo |
| ¿Qué pasa si el producto desaparece mañana? | Mide cuánto del valor quedó como capacidad propia |

---

## Seguridad antes de ejecutar

Un producto que se ejecuta sobre nuestro sistema corre con nuestros permisos. Revisar
en el código fuente, antes de la primera corrida:

- Dependencias: cuántas y de quién. Cero dependencias es una superficie de ataque menor.
- Llamadas de red: si las hay, qué envía y a dónde.
- Hooks de instalación (`postinstall` y equivalentes): ejecutan sin que nadie lo pida.
- Escrituras: qué archivos toca y si sale del directorio del proyecto.
- Ofuscación o decodificación en tiempo de ejecución.
- Credenciales: si lee variables de entorno, archivos de configuración o claves.

Publicación reciente y un solo mantenedor no son motivo para descartar, pero sí para
revisar el código en vez de confiar en la reputación. El resultado de esta revisión se
registra como evidencia verificada, con la versión exacta a la que corresponde.

---

## Clasificación de la evidencia

Cada afirmación del registro lleva su etiqueta:

| Etiqueta | Qué significa |
|---|---|
| Hecho verificado | Se observó ejecutando o leyendo la fuente, y se puede repetir |
| Afirmación del producto | Lo dice su documentación o su sitio, sin verificación propia |
| Inferencia | Conclusión razonada a partir de hechos, no observada directamente |
| Hipótesis a validar | Todavía no se probó; se indica cómo probarla |

Una investigación sin hechos verificados es una reseña, no una investigación.

---

## Trampas conocidas

- **El indicador se vuelve el objetivo.** Cuando se trabaja para subir un puntaje, se
  optimiza el puntaje. El antídoto es tener métricas propias desde la Fase 0.
- **Confundir un hallazgo del producto con un hallazgo nuestro.** Si la herramienta no
  soporta nuestro stack, eso es un límite del producto; si encuentra un problema real,
  es un hallazgo nuestro. Van en secciones distintas del registro.
- **Verificar solo lo que la herramienta reporta.** Los hallazgos más valiosos suelen
  aparecer al lado de lo que la herramienta señaló, no dentro.
- **Dar por buena la corrida en un entorno que no observa.** Si algo no se pudo ver, se
  dice.

---

## Qué registrar siempre

El registro del caso se guarda en `D:\Investigacion - V4\02-investigaciones\investigador-de-producto-[objeto]-v[N]-[YYYY-MM-DD].md` e incluye,
como mínimo: decisión, baseline con fecha, versión exacta probada, cronología de rondas
con el número antes y después de cada una, hallazgos separados en "del producto" y "de
nuestro sistema", lo que no se pudo verificar, veredicto y qué quedó como capacidad
propia.
