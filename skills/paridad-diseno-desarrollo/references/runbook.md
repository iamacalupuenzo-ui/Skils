# Runbook operativo — conexión, captura y documentación

Procedimiento reproducible para `INSPECT`, `SWEEP` y `DOCUMENTAR`.

## Flujo prioritario

Para una documentación nueva, seguir siempre este orden corto:

1. Conectar Playwright y Figma.
2. Leer solo el nodo aprobado y las observaciones anteriores.
3. Medir el estado actual del componente con una sonda dirigida.
4. Restar observaciones resueltas y conservar solo diferencias confirmadas.
5. Crear una QA nueva desde cero.
6. Insertar la captura actual y el clon aprobado.
7. Crear markers y comentarios desde los rects actuales.
8. Validar la colocación con el overlay en el navegador, antes de escribir en Figma.
9. Capturar **cada panel al terminarlo**, no todos al final: el export se agota.
10. Validar estructura sobre el total e informar la cobertura visual como fracción.

No convertir una revisión de componente en una exploración completa del archivo.

## Usar revisiones históricas como evidencia

Las páginas `QA — ...`, versiones `v1`, `v2`, `v3` y sus observaciones son fuentes válidas de
validación. No se descartan por ser antiguas.

Para cada observación histórica, crear una matriz compacta:

```text
ID histórico | Problema | Estado actual | Evidencia nueva | Acción
```

Estados permitidos:

- `RESUELTA`: la medición actual coincide con el diseño validado.
- `PERSISTE`: la diferencia continúa y debe documentarse de nuevo.
- `REGRESIÓN`: estuvo resuelta en una versión anterior y reapareció.
- `NO REPRODUCIBLE`: falta el estado, canal, viewport o dato necesario.
- `CONTRA DISEÑO`: desarrollo corrigió correctamente algo que sigue incorrecto en Figma.

Las observaciones históricas sirven para decidir qué medir, no para copiar valores, offsets,
markers, capturas ni severidades sin volver a verificar. Cada punto se cruza otra vez con:

1. El DOM actual y sus estilos computados.
2. El nodo o especificación visible aprobada.
3. El estado actual del componente.

Después del mapeo histórico, hacer una segunda pasada de novedades: elementos, estados o
desviaciones actuales que no aparecían en versiones anteriores. La QA nueva incluye ambos
conjuntos: observaciones persistentes/regresiones y hallazgos nuevos.

## Economía de tokens

- No usar `figma_get_file_data` con `depth` completo para descubrir un componente.
- No leer páginas completas si el usuario entregó IDs de componente y observaciones.
- Usar `figma_execute` con listas dirigidas de IDs y devolver solo nombre, tipo, rect, visibilidad,
  texto y propiedades necesarias.
- Ejecutar una sola sonda de DOM para todos los selectores del componente y sus hijos relevantes.
- Reutilizar el resultado de la sonda para la tabla, markers, leyendas y comentarios.
- No volver a medir una propiedad ya confirmada salvo que cambie el estado, viewport o captura.
- Leer referencias del skill una vez por corrida; no repetirlas en cada subpaso.
- Capturar la pantalla una vez después de construir y repetir solo si la validación encuentra un
  error visual.
- No incluir en la respuesta datos internos que no cambian una decisión: hashes, IDs auxiliares,
  árboles completos o reglas CSS no relacionadas.
- Batchear `figma_execute`: antes de empezar a leer nodos, listar de una vez las propiedades que
  probablemente van a hacer falta (fills, strokes, cornerRadius, texto, `textAlignHorizontal`,
  opacity, effects, `boundVariables`) para los elementos ya identificados como relevantes, y
  pedirlas en una sola llamada. Ir propiedad por propiedad según aparecen dudas multiplica las
  llamadas y el razonamiento entre medio.
- Si la sonda va a devolver muchas propiedades, filtrar antes del `return` en vez de volcar el
  crudo y reprocesarlo aparte → `references/probe.md`, "Acotar la salida en componentes grandes".

## Compatibilidad por entorno

La lógica del skill es la misma, pero los nombres de las herramientas pueden cambiar:

| Capacidad | Claude/GPT MCP | OpenCode actual |
|---|---|---|
| Navegar browser | `mcp__playwright__browser_navigate` | `playwright_browser_navigate` |
| Snapshot browser | `mcp__playwright__browser_snapshot` | `playwright_browser_snapshot` |
| Evaluar DOM | `mcp__playwright__browser_evaluate` | `playwright_browser_evaluate` |
| Capturar desarrollo | `mcp__playwright__browser_take_screenshot` | `playwright_browser_take_screenshot` |
| Estado Figma | `mcp__figma-console-local__figma_get_status` | `figma-console_figma_get_status` |
| Ejecutar Figma | `mcp__figma-console-local__figma_execute` | `figma-console_figma_execute` |
| Capturar Figma | `mcp__figma-console-local__figma_take_screenshot` | `figma-console_figma_capture_screenshot` |

En OpenCode, usar la herramienta disponible en la sesión y no inventar el prefijo MCP. La
secuencia no cambia: verificar conexión, extraer, comparar, documentar y validar.

## 1. Conectar los motores

### Playwright

1. Abrir o seleccionar una pestaña con `playwright_browser_tabs`.
2. Navegar al URL de desarrollo.
3. Ejecutar `playwright_browser_snapshot` con `boxes: true`.
4. Confirmar que el selector objetivo existe. Una URL de login no prueba por sí sola que la
   sesión haya expirado: si el selector existe, la pantalla sigue siendo válida.
5. Si aparece autenticación, detenerse. El usuario inicia sesión manualmente; el skill nunca
   escribe credenciales.

### Figma Desktop Bridge

1. Navegar al archivo con `figma_navigate`.
2. Verificar con `figma_get_status({ probe: true })`.
3. Confirmar archivo, `fileKey`, página activa y selección.
4. Ejecutar `figma_search_components` al iniciar cada sesión para refrescar IDs.
5. **Probar la vía REST una sola vez** (`figma_get_component_for_development` sobre el nodo
   objetivo). Si responde con datos, es la fuente más completa y barata: devuelve el árbol con
   `boundVariables` ya resueltas, estados e imagen en una sola llamada, y evita reconstruir esa
   información nodo por nodo con `figma_execute`. **Si responde 403 (`Token expired` o sin
   `FIGMA_ACCESS_TOKEN`), no reintentar** — caer a `figma_execute` y `figma_capture_screenshot`
   (Desktop Bridge) para el resto de la corrida. El token puede estar configurado en una máquina
   y no en otra: probar una vez y decidir, no asumir de entrada cuál es el caso ni descartar REST
   por sistema.
6. Si el puente no responde, detener las escrituras y pedir que el usuario abra Desktop Bridge
   en el archivo correcto.

Los IDs se resuelven nuevamente en cada sesión. Nunca reutilizar IDs de otra conversación.

## 2. Resolver objetivo y selector

Usar este orden: `data-testid`/`data-qa`, rol accesible, clase estable y ruta DOM como último
recurso. Registrar URL, selector raíz, selectores de hijos, cantidad de instancias y si la
corrida es reproducible.

La sonda debe usar `querySelectorAll` y devolver una entrada por instancia. Medir el contenedor
y los hijos relevantes: retorno, stepper, título, bajada, tarjetas, íconos, textos, chevrons y
enlace alternativo.

No inferir equivalencias por nombre o cercanía. Un control con nombre parecido no reemplaza otro
control: comparar rol, posición, tamaño y relación con sus hermanos. Usar visibilidad efectiva,
es decir, `visible` del nodo y de todos sus ancestros, además de `clipsContent`, para excluir capas
no visibles del inventario esperado. Una capa oculta del diseño no se reporta como faltante ni se
convierte en una obligación para desarrollo. En particular,
distinguir:

- control de retroceso del stepper a la izquierda;
- chevron de navegación junto al nombre del paso;
- enlace `Volver` fuera del stepper.

Si desarrollo muestra un elemento visible que no forma parte de la composición validada, reportar
el elemento visible y explicar su impacto, sin describirlo como “oculto en Figma”. Si el diseño
tiene un elemento visible y desarrollo no tiene representación, es un elemento faltante y debe
marcarse en la posición aprobada.
En componentes repetidos, comparar cada hermano por separado: el contenido, alto, rect y estado
de la primera tarjeta no se reutilizan como evidencia de la segunda.

## 2 bis. Una sola llamada de reconocimiento

El primer contacto con el componente **no son tres pasos**: es una sola llamada que devuelve todo
lo que decide el resto de la corrida. Verificado el 2026-08-07 — buena parte de la diferencia de
tiempo entre una revisión y la siguiente salió de acá.

Lo que tiene que volver en esa llamada:

| Dato | Para qué |
|------|----------|
| Raíz resuelta y su rect | Fija el sistema de coordenadas de todo lo demás |
| Árbol de descendientes visibles, con rect relativo a la raíz | Selectores, disposición y rects de los marcadores |
| Estilos computados por nodo, filtrando los valores por defecto | Evita una segunda pasada por cada elemento |
| `textContent` e `innerText` de las hojas | Copy y transformaciones de texto (T7) |
| Inventario de custom properties, separando vendors | Decide si el eje de tokens existe (T4) |
| `devicePixelRatio` | Tolerancia de bordes |
| `sheetErrors` | Qué quedó sin auditar |

Filtrar en la propia llamada los valores por defecto (`0px`, `none`, `normal`, `rgba(0,0,0,0)`,
`static`…) reduce la salida a un tercio sin perder nada: lo que no está declarado no es un hallazgo.

Después de esa llamada suele quedar **un** hueco —el `font-style` de un badge, el `viewBox` de un
ícono, el `box-sizing` de una card—. Ese se cierra con una segunda llamada dirigida, no con otra
pasada completa.

## 3. Extraer desarrollo y estados

Medir todos los rects relativos a la raíz:

```js
const root = rootEl.getBoundingClientRect();
const r = el.getBoundingClientRect();
return { x: r.left - root.left, y: r.top - root.top,
  width: r.width, height: r.height };
```

Extraer estilos computados, declaración ganadora, tokens, `textContent`, `innerText`,
`devicePixelRatio` y `sheetErrors`.

Capturar la raíz del componente, no toda la ventana:

```text
playwright_browser_take_screenshot
target: selector raíz
scale: device
filename: dev-[componente].png
```

Un `filename` relativo se resuelve contra el directorio de trabajo del proceso de Playwright,
que en Windows suele ser el home del usuario (`$HOME` / `%USERPROFILE%`) — **no** la carpeta
`.playwright-mcp\` donde quedan el snapshot y el log de consola. Verificar ahí directo con
`ls "$HOME/dev-[componente].png"` (o `Test-Path` en PowerShell) antes de escalar a cualquier
búsqueda más amplia: un `find`/`Get-ChildItem` sobre todo el disco es lento, tropieza con
permisos de carpetas de sistema, y puede devolver un código de salida que se lee como fallo aun
cuando el archivo sí existe. Escribir esta ruta de forma portable —la variable de entorno, no una
ruta de usuario fija— para que sirva en cualquier máquina.

Medir por separado cada estado documentado: reposo, `hover`, `focus`, `disabled`, `error` y
tema. Provocarlos con interacción real, esperar la transición y volver a leer estilos. No forzar
atributos para fabricar estados ni mezclar resultados de estados distintos.

## 4. Servir e insertar capturas

Usar un puerto permitido y CORS habilitado:

```powershell
npx --yes http-server . -p 9225 --cors
```

Verificar `http://localhost:9225/dev-[componente].png` antes de escribir. En Figma usar
`fetch` y `figma.createImage`, no `createImageAsync`:

```js
const response = await fetch('http://localhost:9225/dev-[componente].png');
if (!response.ok) throw new Error(`Capture fetch failed: ${response.status}`);
const image = figma.createImage(
  new Uint8Array(await response.arrayBuffer())
);
```

El frame debe tener el tamaño CSS medido, no el tamaño del PNG a escala de dispositivo:

```js
capture.resize(domRect.width, domRect.height);
capture.fills = [{ type: 'IMAGE', imageHash: image.hash, scaleMode: 'FILL' }];
```

Si `fetch` falla, verificar proceso, puerto, URL y `--cors`. No reutilizar una imagen vieja ni
declarar documentación completa si la captura actual no pudo insertarse.

**Cierra B22 acá, no al final.** Apenas se inserta la imagen, confirmar que corresponde al DOM
medido: leer el tamaño del frame `Captura` (`capture.width`/`capture.height`) y compararlo contra
el rect medido en el navegador, y verificar que el `imageHash` corresponde al `fetch` recién
hecho —mismo `byteLength` que el archivo servido— y no a una corrida anterior. No alcanza con
mirar la página compuesta a escala reducida al cierre: a esa resolución no se distingue si la
imagen insertada es la correcta.

## 5. Reemplazar nodos con seguridad

1. Si es un componente o estado nuevo, crear una QA nueva desde cero. No clonar una QA
   anterior: sus paneles, offsets, marcadores y leyendas pueden pertenecer a otra geometría.
2. Reutilizar una QA existente solo cuando se esté actualizando exactamente el mismo componente,
   estado, viewport y estructura.
3. Escribir únicamente dentro de la página QA y sus frames hijos.
4. Actualizar solo los frames `Captura` de QA.
5. Retirar marcadores, leyendas y `Comment` obsoletos solo dentro de QA.
6. Mantener el mismo número en marcador, leyenda y comentario.
7. Reanclar colisiones al hijo más preciso. Nunca agrandar el área del marcador.
8. Si persisten colisiones, separar paneles por tipo de desviación, no por número.
9. Resolver el nodo aprobado y verificar su `type`.
10. Clonarlo dentro de `Diseño aprobado`; nunca editar el original.
11. Resolver componentes del kit por nombre y aceptar solo `COMPONENT` o `COMPONENT_SET`;
    descartar instancias creadas en corridas previas.
12. Retirar observaciones resueltas, actualizar las vigentes y separar hallazgos contra el diseño.
13. No dejar paneles vacíos ni textos placeholder.

### Contrato de coordenadas

Los rects del navegador siempre son relativos a la raíz DOM. La posición final del marcador es:

```js
marker.x = capture.x + rect.x;
marker.y = capture.y + rect.y;
```

No sumar el `x/y` del panel ni el origen de la página una segunda vez. Si se reemplaza una
captura, recalcular todos los rects y marcadores; nunca conservar offsets de la imagen anterior.

## 6. Validar posiciones y estados

Dibujar temporalmente los rects sobre el componente real, capturar y revisar. Limpiar todos los
overlays en la misma corrida:

```js
const overlay = document.createElement('div');
overlay.className = '__qa_overlay';
overlay.style.cssText =
  `position:fixed;left:${root.left + rect.x}px;top:${root.top + rect.y}px;` +
  `width:${rect.width}px;height:${rect.height}px;` +
  'border:2px dashed #F5A623;pointer-events:none;z-index:99999;';
document.body.appendChild(overlay);
document.querySelectorAll('.__qa_overlay').forEach(e => e.remove());
```

En Figma verificar `imageHash`, tamaño CSS, numeración, solapamientos, recortes, placeholders,
marcadores fuera del panel y que el panel aprobado no tenga marcadores de desarrollo.

Para tipografía, comparar siempre familia, estilo/peso, tamaño, interlineado, transformación,
color y dimensión del bloque. No dar por correcta una fuente solo porque la familia coincide:
`Poppins 15/20` y `Poppins 15/24` son especificaciones distintas.

## 7. Verificación visual

Son **dos verificaciones distintas** y ninguna reemplaza a la otra:

| Verificación | Dónde | Qué atrapa | Costo |
|---|---|---|---|
| Overlay de rects | En el navegador, antes de escribir | Un área anclada al elemento equivocado | Barato, no usa el puente |
| Captura del panel | En Figma, tras construir cada panel | Colisiones, recortes, desfase de la imagen | Se agota: ver abajo |

La primera es obligatoria y no tiene excusa: no depende del puente ni del export.

Para la segunda, **capturar cada panel apenas se termina de construir**, nunca todos al final.
`figma_capture_screenshot` se degrada con el uso — verificado: tres capturas bien y timeout
consistente desde la cuarta, con el puente respondiendo en 3 ms. Dejarlas para el cierre garantiza
que los últimos paneles queden sin mirar.

Ante un timeout: `figma_get_status({ probe: true })`; si el puente está sano, `figma_reload_plugin`
y un solo reintento; si vuelve a fallar, dejar de exportar y pasar a validación estructural.

Iterar como máximo tres veces por panel. **El cierre informa la cobertura como fracción** —
`3 de 6 paneles`— y nombra los que quedaron sin mirar. Declarar "verificada" una página que no se
miró entera es el único resultado inaceptable.
Prioridad si hay que racionar: más marcadores, marcador más chico, marcador que abarca todo, área
de elemento faltante, observaciones, y por último el panel aprobado →
`references/figma-build.md`.
