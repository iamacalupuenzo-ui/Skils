# Setup — instalación de las 3 herramientas que este skill necesita

`paridad-diseno-desarrollo` no funciona con Claude Code solo. Depende de tres piezas externas que deben
estar instaladas y corriendo **antes** de invocar cualquier modo. Esta guía es para dejarlas
funcionando desde cero — en una laptop nueva, o después de reinstalar algo.

El GUARD del `SKILL.md` verifica que estén *activas* en cada corrida. Esta guía es la parte
anterior: cómo llegar a que existan.

---

## 1. Playwright MCP

Es el motor de navegación: abre el browser, navega, mide el DOM real.

### Instalación

Agregar en `~/.claude.json`, scope usuario (no en la config de un proyecto puntual):

```json
"playwright": {
  "type": "stdio",
  "command": "npx",
  "args": ["@playwright/mcp@latest", "--user-data-dir", "<RUTA_ABSOLUTA_A_TU_PERFIL>"]
}
```

**`<RUTA_ABSOLUTA_A_TU_PERFIL>` no es un placeholder decorativo — reemplazarlo siempre.** No
existe una ruta universal: depende del usuario de Windows de la máquina donde corre. Ejemplo
en esta laptop:

```
C:/Users/Enzo Macalupu/.playwright-qa-profile
```

Usar barras `/`, no `\`, y una carpeta que no exista todavía — Playwright la crea sola en el
primer uso.

**Por qué esta ruta importa:** sin `--user-data-dir` el perfil es efímero y hay que loguearse
en cada corrida. Con perfil persistente, el login se hace **una sola vez por máquina**, no una
vez por sesión de Claude.

**No usar `--headless`.** El browser necesita ventana visible porque el usuario inicia sesión
a mano ahí — ver Bloqueante B1 del `SKILL.md`.

### Verificar que quedó bien

Reiniciar Claude Code y pedirle al skill que navegue a cualquier URL. Si el servidor no
responde, el GUARD del `SKILL.md` lo va a decir explícitamente en la primera línea.

### Complemento opcional: chrome-devtools

`chrome-devtools-mcp@latest --browser-url http://127.0.0.1:9222` puede instalarse como
complemento de diagnóstico, pero **no reemplaza** a Playwright: no tiene perfil persistente
propio y necesita un Chrome ya corriendo con el puerto de depuración abierto. No es parte del
flujo estándar de `paridad-diseno-desarrollo`.

---

## 2. figma-console-local MCP + Figma Desktop Bridge

Es el puente hacia el archivo de Figma: lee nodos, variables, y permite escribir en la página
de QA. Tiene dos partes que deben estar corriendo a la vez — el servidor MCP y un plugin
adentro de Figma Desktop conectado a ese servidor.

### Instalación

La instalación completa del servidor y el plugin está fuera del alcance de este skill — es
infraestructura compartida con `documentacion-handoff` y el resto de los skills de Figma. Ver
`feedback_figma_mcp.md` en memoria: usar únicamente `figma-console-local` (o `figma-console`
según la máquina), nunca `mcp__claude_ai_Figma__*`.

Lo que sí es específico de `paridad-diseno-desarrollo`: el manifest del bridge
(`~/.figma-console-mcp/plugin/manifest.json`) debe tener en `allowedDomains` el rango
`http://localhost:9223` a `:9232` — es el rango que el paso 3 (servidor de capturas) necesita
para poder insertar imágenes dentro de Figma. Si el manifest no lo tiene, agregarlo antes de
usar el modo `DOCUMENTAR`.

### Nombre del servidor: varía entre máquinas

El mismo servidor se llama `figma-console` en una laptop y `figma-console-local` en otra —
depende de cómo se registró el MCP en cada una. **Nunca asumir el nombre**: verificar con
`figma_get_status` o `figma_list_open_files` cuál está activo antes de llamar cualquier tool,
y usar `mcp__<nombre-activo>__*`.

### Verificar que quedó bien

1. Abrir el archivo de Figma objetivo en Figma Desktop.
2. Abrir el plugin del Desktop Bridge desde ahí — **no se puede activar remotamente**, alguien
   tiene que abrirlo a mano en esa máquina.
3. Correr `figma_get_status({ probe: true })`. Debe confirmar archivo, `fileKey`, página activa
   y selección.
4. Si no responde, el GUARD del `SKILL.md` lo va a bloquear antes de prometer nada — es
   comportamiento esperado, no un bug.

---

## 3. Servidor de captura HTTP con CORS

No es algo que se "instala" una vez — es un comando que se levanta **cada vez que el modo
`DOCUMENTAR` necesita meter una captura de desarrollo dentro de Figma**. Requiere Node.js
instalado (ya viene con Claude Code en la mayoría de los setups); no requiere Python.

### Cómo se levanta

```powershell
npx --yes http-server . -p 9225 --cors
```

- **El puerto debe estar dentro de 9223-9232** — es el rango que el manifest del plugin de
  Figma tiene permitido en `allowedDomains`. Cualquier otro puerto (8899, 3000, etc.) se
  bloquea silenciosamente del lado de Figma.
- **`9225` suele estar libre.** `9223`, `9224` y `9226` suelen estar tomados por otras
  instancias del bridge — confirmar con `figma_get_status`, que lista `otherInstances`.
- **`--cors` es obligatorio.** Sin eso, el navegador puede abrir la imagen directamente pero el
  `fetch` que corre *dentro* de Figma falla igual.

### Verificar que quedó bien

Antes de que el skill intente insertar una imagen, probar manualmente:
```
http://localhost:9225/<nombre-del-archivo>.png
```
Si el navegador la muestra, el servidor está bien levantado. El paso siguiente (`fetch` +
`figma.createImage` desde el plugin) está documentado en `references/engine.md` y
`references/runbook.md` — no usar `createImageAsync`, ese no respeta el mismo `allowedDomains`.

---

## Checklist de instalación completa (correr una sola vez por máquina)

- [ ] Node.js instalado y en PATH (verificar con `node -v`)
- [ ] Entrada `playwright` en `~/.claude.json` con `--user-data-dir` apuntando a una ruta real
      de esta máquina (no copiada de otra laptop)
- [ ] Primera navegación de prueba hecha y login guardado en el perfil persistente
- [ ] Servidor `figma-console` / `figma-console-local` corriendo y visible en la config MCP
- [ ] Plugin del Desktop Bridge abierto dentro de Figma Desktop, en el archivo objetivo
- [ ] `~/.figma-console-mcp/plugin/manifest.json` con `allowedDomains` incluyendo
      `localhost:9223`-`:9232`
- [ ] `npx --yes http-server . -p 9225 --cors` probado al menos una vez y respondiendo

Si algún ítem falla, el GUARD del `SKILL.md` lo va a declarar en texto plano al usuario — no
falla en silencio.

