# Engine — Playwright MCP

Cómo llegar al componente renderizado, y qué límites tiene el entorno.

---

## Configuración (scope user, `~/.claude.json`)

```json
"playwright": {
  "type": "stdio",
  "command": "npx",
  "args": ["@playwright/mcp@latest", "--user-data-dir", "<RUTA_ABSOLUTA_A_TU_PERFIL>"]
}
```

`<RUTA_ABSOLUTA_A_TU_PERFIL>` depende del usuario de Windows de cada máquina — nunca copiar
un ejemplo de otra laptop tal cual. Ver `references/setup.md` para la instalación completa
paso a paso.

Dos consecuencias que definen el flujo:

- **Sin `--headless`** → el browser abre con ventana visible. El usuario puede interactuar.
- **Con `--user-data-dir`** → perfil persistente. El login se hace **una sola vez** y la sesión
  sobrevive entre corridas y entre sesiones de Claude.

`chrome-devtools` (`chrome-devtools-mcp@latest --browser-url http://127.0.0.1:9222`) está
instalado como complemento de diagnóstico. No es el engine principal: no tiene perfil
persistente propio y requiere un Chrome ya corriendo con el puerto de depuración abierto.

---

## Protocolo de login — no negociable

1. El skill navega al URL.
2. Si aparece una pantalla de autenticación, **se detiene y se lo dice al usuario**.
3. El usuario escribe usuario y contraseña **en la ventana del browser**, con sus propias manos.
4. El skill continúa cuando el usuario confirma que ya está adentro.

**El skill nunca escribe credenciales.** Ni con `browser_type`, ni con `browser_fill_form`, ni
leyéndolas de un `.env`, ni aunque el usuario las pegue en el chat. Si el usuario las pega,
decirle que no hacen falta y que las escriba él en la ventana.

Como el perfil persiste, esto pasa una vez por plataforma, no una vez por corrida.

### Sesión expirada — detectarla bien

**La señal es que el selector objetivo dejó de existir**, no que la URL parezca de login.

Verificado en corrida real: una pantalla de código OTP se sirve desde el dominio del proveedor de
identidad (`oauth2.…/realms/…/login-actions/authenticate`) y **es** el componente a medir. Frenar
por el patrón de URL aborta una inspección perfectamente válida.

```javascript
const vivo = !!document.querySelector(SEL_OBJETIVO);
// vivo === false  →  recién ahí sospechar de la sesión
```

Cuando de verdad expiró: no seguir extrayendo —los datos serían de la pantalla de login—, decirlo,
pedir re-login, y retomar desde el elemento que falló. En un `SWEEP`, la pista es que **todos** los
selectores fallan a la vez; si falla uno solo, es el selector, no la sesión.

---

## Límites del entorno (verificados 2026-08-03)

| Límite | Detalle | Cómo se sortea |
|--------|---------|----------------|
| Protocolo `file:` bloqueado | `browser_navigate` a `file:///...` da error explícito | Servir por HTTP en localhost |
| No hay Python | Ni `python` ni `py` en PATH | Node v24 sí está — servidor estático en Node |
| Hojas de estilo cross-origin | `sheet.cssRules` tira `SecurityError` | La sonda lo captura en `sheetErrors` |

El tercero importa de verdad: si el CSS viene de un CDN de otro origen, **no se puede leer el
valor declarado** y el veredicto de token es imposible para esas reglas. La sonda lo reporta en
`sheetErrors` en vez de fallar en silencio. Si `sheetErrors` no está vacío, decirlo en el
reporte: hay reglas que no se pudieron auditar.

---

## Meter una captura de dev dentro de Figma

El problema: `paridad-diseno-desarrollo` produce capturas del navegador y la documentación las necesita **dentro**
del archivo de Figma. Tres caminos fallan y uno funciona.

| Camino | Resultado |
|--------|-----------|
| `figma_set_image_fill` con ruta de archivo | **Falla en Windows.** El contrato pide rutas que empiecen con `/`; una ruta `C:/...` se interpreta como base64, se intenta decodificar y **tumba el puente**. Node tampoco resuelve `/C:/...`. |
| `figma_set_image_fill` con base64 | Funciona, pero cuesta ~15K caracteres por captura y el propio tool advierte de truncación en imágenes grandes. Último recurso. |
| `node.exportAsync()` dentro del plugin | Se cuelga: el puente no transfiere bien buffers grandes. Timeout a los 30s. |
| **`fetch` desde el plugin + `figma.createImage(bytes)`** | **Funciona y es gratis.** ← usar este |

### El detalle que lo hace posible

El manifest del bridge (`~/.figma-console-mcp/plugin/manifest.json`) tiene en `allowedDomains` el
rango **`http://localhost:9223` a `:9232`**, reservado para las instancias del MCP. Sirviendo la
captura en un puerto libre de ese rango, el `fetch` del plugin la alcanza sin tocar el manifest.

- Varios puertos del rango están tomados por instancias del bridge → verificar con
  `figma_get_status`, que lista `otherInstances`.
- **El puerto se resuelve en la corrida, nunca se da por sentado.** Cuál está libre cambia entre
  máquinas y entre días: verificado el 2026-08-07 con `9223`, `9224` y `9225` ocupados y `9226`
  libre — al revés de lo que suponía esta guía. Buscar el primer libre del rango antes de servir.
  Cualquier puerto fuera del rango (8899, 3000, …) **se bloquea**.
- `figma.createImageAsync(url)` **NO sirve**: valida `allowedDomains` con otro criterio y rechaza
  el mismo URL que `fetch` acepta. Usar `fetch` + `createImage`, nunca `createImageAsync`.

```js
// domRect = getBoundingClientRect() de SEL_RAIZ, medido por la sonda EN LA MISMA CORRIDA.
// dpr     = devicePixelRatio DEL NAVEGADOR, que la sonda devuelve junto con los rects.
// Los dos entran como literales al inyectar este código; no se leen desde el plugin.
const r = await fetch('http://localhost:<puerto libre del rango>/captura.png');
if (!r.ok) throw new Error(`Capture fetch failed: ${r.status}`);
const buf = await r.arrayBuffer();
const img = figma.createImage(new Uint8Array(buf));

frame.resize(domRect.width, domRect.height);   // ← el tamaño del DOM, NUNCA el del PNG
frame.fills = [{ type: 'IMAGE', imageHash: img.hash, scaleMode: 'FILL' }];

// getSizeAsync sirve como CONTROL CRUZADO, no como fuente de la geometría:
const size = await img.getSizeAsync();
const desvio = Math.abs(size.width / dpr - domRect.width);
if (desvio > 2) throw new Error(
  `La captura no corresponde al elemento medido: PNG ${size.width}/${dpr} vs DOM ${domRect.width}`);
```

El servidor debe iniciarse con CORS habilitado. Sin CORS, el navegador puede abrir la imagen
pero el `fetch` dentro de Figma falla.

### El host tiene que ser literalmente `localhost`, y ahí está la trampa

Dos condiciones que se contradicen si el servidor no está preparado. Verificado el 2026-08-07:
`Failed to fetch` con el servidor levantado y respondiendo por HTTP.

1. **`allowedDomains` lista `http://localhost:<puerto>`, no `127.0.0.1`.** Cambiar el host por la
   IP hace que el plugin rechace el pedido antes de emitirlo. El string tiene que decir `localhost`.
2. **En Windows, `localhost` resuelve primero a `::1` (IPv6).** `npx http-server` escucha solo en
   IPv4, así que el pedido llega a un puerto donde no hay nadie. El síntoma es cruel: `curl
   http://127.0.0.1:<puerto>/captura.png` devuelve **200**, y `curl http://localhost:<puerto>/…`
   devuelve **conexión rechazada**. Probar solo con la IP da falso verde.

**El diagnóstico de un `Failed to fetch` es siempre el mismo par de curls.** Si la IP responde y
`localhost` no, es esto y no el manifest, ni el CORS, ni el puerto.

Servidor mínimo local. Servir una carpeta temporal dedicada y escuchar en `::1`, ya que el
plugin usa `localhost`. No abrir todas las interfaces. Si el entorno requiere IPv4, iniciar
otra instancia explícita en `127.0.0.1` y autorizar solo ese origen.

```js
const http = require('http'), fs = require('fs'), path = require('path');
const DIR = path.resolve(process.argv[2]), PORT = Number(process.argv[3]);
http.createServer((req, res) => {
  const requested = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
  const f = path.resolve(DIR, requested);
  const relative = path.relative(DIR, f);
  if (!requested.endsWith('.png') || relative.startsWith('..') || path.isAbsolute(relative))
    return res.writeHead(403).end();
  fs.readFile(f, (e, b) => e
    ? res.writeHead(404, { 'Access-Control-Allow-Origin': '*' }).end()
    : res.writeHead(200, { 'Content-Type': 'image/png',
        'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }).end(b));
}).listen(PORT, '::1');           // solo loopback IPv6 para http://localhost
```

Verificar **con `localhost`**, que es lo que usa el plugin, antes de escribir nada:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:<puerto>/captura.png
```

Antes de reemplazar una captura, probar desde `figma_execute` tanto la raíz del servidor como el
PNG. Si falla, no reutilizar una imagen vieja ni cerrar la documentación como completa.

### El frame mide lo que mide el DOM. Nunca lo que mide el PNG, ni el PNG dividido

El riesgo es real: con el tamaño del PNG crudo, a dpr 1.25 el frame queda 25% más grande que el
diseño y toda comparación visual miente. **Pero el remedio no es dividir por el `devicePixelRatio`
— es no usar el PNG en absoluto.**

Dividir parece que funciona y no funciona, por tres motivos distintos:

1. **El redondeo del PNG no es invertible.** Un elemento de 460×**409** a dpr 1.25 pide un recorte
   de 511,25 px de dispositivo; el navegador no emite medio píxel, redondea hacia arriba y alinea a
   la grilla: sale **575×513**. Dividir 513 / 1.25 da **410,4**, no 409. La información que el
   navegador redondeó se perdió, y el error va siempre en el mismo sentido: el frame queda igual o
   más grande, nunca más chico.
2. **Ese número ya está medido.** `getBoundingClientRect()` sobre `SEL_RAIZ` lo devolvió exacto, con
   decimales, en la misma llamada que produjo los rects de todos los hijos. Reemplazar una medición
   buena por una reconstrucción es exactamente lo que prohíbe **B3**.
3. **`dpr` no existe donde corre ese código.** El bloque se ejecuta en el sandbox del plugin, donde
   `window.devicePixelRatio` es el de Figma Desktop, no el del navegador que capturó. El arreglo
   correcto elimina la variable de esta ruta en vez de documentarla mejor.

**Por qué importa tanto:** los marcadores se colocan en absoluto (`OY + rect.y`) y **no se escalan
nunca**. Lo que se deforma es la imagen debajo, porque el fill está en `FILL` y se estira para
llenar el frame. Con 410,4 en vez de 409 el factor es 1,0034, así que **el marcador queda bien y la
foto queda mal**, y el desfase crece con la profundidad: 0,1px a `y` 40, 1,4px a `y` 400, 3,1px a
`y` 900. Arriba no se nota, abajo el marcador señala visiblemente el elemento de al lado. Por eso el
síntoma parece intermitente.

**Y la verificación B13 no puede atraparlo.** El overlay se dibuja en el navegador, donde no hay
frame, no hay `FILL` y no hay estiramiento: cae perfecto siempre y pasa en verde. El defecto vive
únicamente del lado de Figma. Usar el rect del DOM es lo que **restaura la validez de B13**.

### El `target` de la captura y el `SEL_RAIZ` de la sonda son el mismo selector

Invariante, no recomendación. Los rects de los hijos son relativos a `SEL_RAIZ`; el origen de la
imagen es el `target` de `browser_take_screenshot`. Si los dos selectores difieren, los dos sistemas
de referencia se separan y **todos** los marcadores se corren por una constante — un error parejo,
que a diferencia del anterior no crece con la profundidad y por eso se lee como "la captura está
descuadrada" en vez de como un bug. Antes de armar el frame, confirmar que son el mismo string.

### Cuál elegir: el equivalente al frame aprobado, no el más obvio

El selector que salta a la vista suele ser el del componente funcional; el nodo aprobado suele
incluir además su contenedor. Si se elige el primero, el contenedor **queda fuera de la captura y
sus hallazgos no tienen dónde anclarse**.

Verificado el 2026-08-07: el candidato natural era `#kc-mfa-code-form`, la raíz del formulario,
500,4×534. El nodo aprobado medía 580×614: la tarjeta con su margen interno de 40, su radio, su
borde y su sombra. Capturando el formulario se perdían cuatro propiedades comparables y el
marcador del margen interno no tenía superficie donde caer. Capturando `.login-container` la
comparación quedó 1:1 contra el nodo y el hallazgo pudo anclarse.

**La prueba barata:** si el ancho de la raíz candidata no coincide con el del frame aprobado,
subir un nivel y volver a medir. Coincidir en tamaño total es la señal de que los dos sistemas de
referencia son el mismo. Cuando ninguno coincide, decirlo en el reporte: la diferencia de
estructura es en sí misma un dato.

Orden de preferencia para el selector, de más a menos estable:

1. `[data-testid=...]` / `[data-qa=...]` — si el proyecto los tiene, son los mejores
2. Rol accesible + nombre — vía `browser_find`, resistente a cambios de clase
3. Clase de componente — `.btn--primary`. Frágil con CSS Modules o Tailwind (`.btn_a3f9x`)
4. Ruta del DOM — último recurso, se rompe con cualquier refactor

Con CSS-in-JS o CSS Modules las clases están hasheadas y cambian en cada build. Ahí el selector
por clase **no sirve para reproducir la corrida mañana**. Usar rol o testid, y si no hay ninguno
de los dos, decirle al usuario que el reporte no va a ser reproducible hasta que dev agregue
`data-testid`. Es un hallazgo válido en sí mismo.

### Reconocer el terreno antes de extraer

`browser_snapshot` con `boxes: true` da el árbol de accesibilidad con posiciones. Sirve para
ubicar el componente y confirmar que hay una sola instancia. Si hay varias, extraerlas todas:
la inconsistencia entre instancias del mismo componente en la misma pantalla es exactamente el
tipo de hallazgo que interesa.

---

## Fixture local para probar la sonda

Cuando hay que verificar que la sonda funciona (después de tocarla, o en una máquina nueva),
usar un fixture con los tres casos a propósito: un elemento que usa tokens, otro que hardcodea
**exactamente los mismos valores**, y otro con valores fuera de escala.

Si la sonda no distingue los dos primeros —que son pixel-idénticos— está rota, y todo reporte
que produzca es ruido.

`Bash` está en `allowed-tools` por dos motivos concretos: levantar este fixture, y **servir las
capturas en el puerto que el plugin de Figma puede alcanzar** (ver arriba). Sin eso, el modo
DOCUMENTAR no puede insertar imágenes. Servidor mínimo:

```js
const http=require('http'), fs=require('fs'), path=require('path');
http.createServer((req,res)=>{
  const f=path.join(__dirname, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/,'')||'index.html');
  fs.readFile(f,(e,b)=>e?res.writeHead(404).end():res.writeHead(200,{'Content-Type':'text/html'}).end(b));
}).listen(8899);
```

---

## Nombre del servidor MCP entre máquinas

`~/.claude/skills` está sincronizado entre dos laptops. El servidor de Figma se llama
`figma-console` en una y `figma-console-local` en la otra — `documentacion-handoff` ya documenta esto.
Verificar cuál está activo antes de llamar cualquier tool de Figma y usar `mcp__<activo>__*`.

El servidor de Playwright se llama `playwright` en ambas.

