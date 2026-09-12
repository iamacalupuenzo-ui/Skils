---
name: design-handoff
description: Genera documentación de handoff para desarrollo a partir de componentes de Figma. Extrae medidas, espaciados, colores, sombras, fondos, tipografía, variantes y estados leyendo los nodos reales — nunca estima. Activar con frases como "documentá este componente para desarrollo", "handoff de", "specs del componente", "qué necesita dev para construir esto", "armá la documentación técnica de", "pasá esto a desarrollo", "el equipo de dev no sabe cómo construir".
version: 1.0.0
allowed-tools: Read, Write, Edit, Glob, Grep, mcp__figma-console-local__*, mcp__figma-console__*
---

# Design Handoff — Orquestador

Skill de documentación técnica de componentes. Lee el nodo de Figma como fuente de
verdad y produce un documento que permite a un desarrollador construir el componente
sin abrir Figma y sin preguntar nada.

**HERRAMIENTAS:** figma-console-local (o `figma-console` según la máquina). Usar `mcp__figma-console-local__*` o `mcp__figma-console__*` según cuál esté activo.

**Nombre del MCP según la máquina:** este servidor se llama `figma-console` en una laptop y `figma-console-local` en la otra — verificar cuál está activo (`/mcp` o la lista de herramientas disponibles) y usar las tool calls `mcp__<nombre-activo>__*` correspondientes.

**LEER SIEMPRE AL INICIAR:**
- `references/decisiones.md` — por qué la skill hace lo que hace, y los errores ya cometidos
- `references/extraction.md` — código Figma para extraer cada tipo de spec
- `references/spec-template.md` — estructura exacta del documento de salida
- `references/annotation.md` — anotar el diseño en Figma con el kit `Handoff —`
- `references/states.md` — matriz de estados y variantes obligatorias
- `references/gaps.md` — qué se extrae, qué se infiere y qué se pregunta

**LEER SOLO CUANDO APLICA:**
- `references/tokens.md` — si el archivo tiene variables o styles
- `references/doc-page.md` — si se pide documentar un **sistema**, no un componente

---

## Entregable Doble

Cada componente produce dos artefactos que se referencian entre sí:

| Artefacto | Dónde | Para qué |
|---|---|---|
| **Anotación** | Sobre el diseño en Figma | Dev ve medidas y spacing en contexto |
| **Documento** | `handoff/[componente].md` | Tokens, estados, API, accesibilidad, pendientes |

El vínculo son los **markers**: `Ⓐ Ⓑ Ⓒ` en el canvas corresponden a las filas de la
tabla de Anatomía del documento. Mismo orden, misma letra.

Si el archivo no tiene el kit `Handoff —`, generar solo el documento y avisarlo.

---

## Principio Rector

> Si está en Figma, lo extraigo. Si no está, lo marco como gap y lo pregunto.
> Nunca lo invento.

Un valor en el documento tiene exactamente dos orígenes válidos: leído del nodo, o
confirmado por el usuario. No hay tercera opción.

---

## Modos de Detalle

Se declara junto al modo, en la primera línea. Por defecto **NORMAL**.

| | NORMAL | AVANZADO |
|---|---|---|
| Para quién | Dev que construye la pantalla | Dev que construye el design system |
| Capas transparentes | Se omiten | Fila completa |
| Contenido visible | Todo | Todo |
| Medidas y spacing en canvas | Todo | Todo |
| Alertas | Solo las que cambian el código | Todas |
| Sección Reconstrucción | No | Sí |

### Filtro de alertas — la prueba

Antes de escribir una alerta, responder: **¿cambia lo que dev escribe?**

| Respuesta | Dónde va |
|---|---|
| Sí, y es una instrucción de construcción | **Dentro de la fila de esa capa**, no como alerta |
| Sí, y es algo que NO debe construir | Alerta `TODO` — va en ambos modos |
| No, es una crítica de cómo está armado en Figma | Solo AVANZADO, sección Reconstrucción |
| No, describe el proceso interno del archivo | **Nunca.** Es ruido |

Una alerta que dev lee y no puede accionar es peor que ausente: intenta accionarla igual.

| Ejemplo | Prueba | Resultado |
|---|---|---|
| "Área táctil `24×48`, ampliar a `44×48`" | Sí, es instrucción | A la fila de esa capa |
| "El texto queda 20px fuera del centro" | No — flex ya lo produce | Reconstrucción |
| "En Figma el arco se recorta con 2 rectángulos" | No — cómo se dibujó no importa | Nunca |
| "Sin estados hover, focus, disabled" | Sí — le dice qué no construir | `TODO`, ambos modos |

Regla corta: **en NORMAL solo sobreviven los `TODO`.** Todo lo demás o es spec (y va
en su fila) o es crítica (y va a AVANZADO).

### Capa transparente — definición mecánica

Un frame es **transparente** cuando cumple **todas** estas condiciones:

```javascript
const n = await figma.getNodeByIdAsync('NODE_ID');
const solidFills = (n.fills === figma.mixed ? [] : n.fills || []).filter(f => f.visible !== false);
const esTransparente =
  solidFills.length === 0 &&
  (n.strokes || []).length === 0 &&
  (n.effects || []).filter(e => e.visible).length === 0 &&
  (!n.cornerRadius || n.cornerRadius === 0) &&
  (n.reactions || []).length === 0;
return { esTransparente };
```

Sin fondo, sin borde, sin sombra, sin radio y sin interacción: no se ve, solo agrupa.

### Excepciones — nunca se omiten aunque sean transparentes

| Caso | Por qué |
|---|---|
| Es el nodo raíz que se está documentando | Es el componente |
| Es el área táctil de un elemento interactivo | Dev necesita su tamaño |
| Es el único que aporta un `gap` o `padding` **no anotado en el canvas** | Se perdería la medida |
| **Es una unidad gráfica** | Sus hijos no son capas, son el dibujo |

### Unidad gráfica

Un frame transparente cuyos hijos son **solo** vectores o formas — sin texto suelto y
sin frames anidados — es un ícono o una ilustración. Se documenta como hoja: dev lo
implementa con un SVG, no reconstruyendo cada path.

```javascript
const GRAFICOS = ['VECTOR','BOOLEAN_OPERATION','GROUP','ELLIPSE','RECTANGLE','POLYGON','STAR','LINE'];
const n = await figma.getNodeByIdAsync('NODE_ID');
const kids = n.children || [];
const esUnidadGrafica = kids.length > 0 && kids.every(k => GRAFICOS.includes(k.type));
return { esUnidadGrafica, tipos: kids.map(k => k.type) };
```

| Frame | Hijos | Resultado |
|---|---|---|
| Ícono de flecha | `VECTOR` | Unidad gráfica — se mantiene |
| Anillo de progreso | `GROUP` con elipse, booleano y texto | Unidad gráfica — se mantiene |
| Bloque de textos | `TEXT`, `TEXT` | Transparente — se omite, los textos suben |

`TEXT` como hijo directo **rompe** la condición: el texto es contenido que dev escribe,
no dibujo que exporta. Un `GROUP` con texto adentro no la rompe — ahí el texto ya es
parte del gráfico.

### Qué pasa con la capa omitida

No se borra información, se reubica:

| Su propiedad | A dónde va en NORMAL |
|---|---|
| `itemSpacing`, `padding` | Medida de Spacing en el canvas |
| `layoutGrow` / hug / fill | Tabla de Dimensionamiento del documento |
| Sus hijos | Suben un nivel — pasan a ser markers de primer nivel |

Las letras se renumeran de corrido: en NORMAL no quedan huecos en la secuencia.

> Si al omitir una capa una medida deja de estar en el canvas **y** en el documento,
> la capa no era transparente. Restaurarla.

---

## Detección de Modo

Declarar el modo en la primera línea de cada respuesta.

| Modo | Señales del usuario |
|------|---------------------|
| **COMPONENTE** | Da un nodo/URL de un componente o component set. "documentá el botón" |
| **PANTALLA** | Da un frame completo. "handoff de la pantalla de login" |
| **ACTUALIZACIÓN** | El doc ya existe. "actualizá el spec de X", "cambió el color de Y" |

---

## Protocolo por Modo

### COMPONENTE

1. **Resolver el nodo** → `references/gaps.md` (sección Identificación). Sin nodo válido → B1.
2. **Extraer el árbol** → `references/extraction.md` (sección Árbol de Anatomía).
   Un nivel por vez, nunca async recursivo.
3. **Extraer specs por capa** → medidas, Auto Layout, fills, strokes, effects, tipografía,
   radius. Cada uno tiene su patrón en `references/extraction.md`.
4. **Mapear a tokens** → solo si el archivo tiene variables o styles. Si no tiene
   ninguno, documentar en crudo y saltar `tokens.md` (ver Política de Tokens).
5. **Extraer variantes y estados** → `references/states.md`. Comparar contra la matriz
   obligatoria y listar los estados faltantes.
6. **Emitir tabla de gaps ANTES de escribir el documento** (ver abajo).
7. **Esperar respuestas del usuario** sobre los gaps bloqueantes.
8. **Escribir el documento** → `references/spec-template.md`.
9. **Anotar en Figma** → `references/annotation.md`. Requiere OK del usuario: escribe
   en su archivo.
10. **Emitir bloque de confirmación.**

---

## Política de Tokens — Valores en Crudo

**Por defecto, el handoff va en crudo: hex, px y nombres de fuente literales.**

No es una limitación del archivo. Es una decisión tomada sobre el problema real: en
este equipo **el design system no se respeta en desarrollo**. Un token en el documento
describe una intención que el código no cumple; el hex describe lo que hay que
construir.

| Situación | Qué escribir |
|---|---|
| Dev implementa contra el DS | Nombre de token |
| **Dev no honra el DS** | **Valor crudo** — es lo único accionable |
| El archivo no tiene variables | Valor crudo |

Escribir `color/accent/default` cuando dev no tiene ese token lo obliga a traducir, y
va a traducir mal o va a preguntar. Escribir `#D41117` no se malinterpreta.

> El origen del componente **no cambia la política**. Un componente traído de una
> librería externa puede tener tokens en su archivo de origen: da igual, si el código
> no los usa. Documentar lo que hay que escribir, no lo que debería existir.

### Deuda, no ruido

El documento cierra con **Nota sobre tokens**: tabla de valores candidatos con su
conteo de apariciones. Señala la deuda sin contaminar las tablas de spec.

Nunca inventar nombres de token dentro de las specs — dev los busca en el código y no
existen.

> Pendiente de la skill: si algún día el DS se respeta, agregar un modo TOKENIZAR.
> Hasta entonces, `references/tokens.md` solo se usa a pedido explícito.

### PANTALLA

1. Listar todos los componentes del frame con su nodeId — tabla previa al trabajo.
2. Identificar cuáles son instancias de un mismo main component (se documenta una vez).
3. Proponer el alcance:
```
Detecté [N] componentes únicos en [pantalla]:
| # | Componente | Instancias | Node | ¿Documentar? |
|---|-----------|-----------|------|--------------|
¿Documento todos o filtramos?
```
4. Esperar confirmación — nunca documentar la pantalla entera sin OK.
5. Por cada componente aprobado → protocolo COMPONENTE.
6. Cerrar con un documento índice de la pantalla (layout, grid, orden de composición).

### ACTUALIZACIÓN

1. Leer el documento existente.
2. Re-extraer del nodo solo la sección afectada — nunca confiar en el valor documentado.
3. Aplicar el cambio y registrar en el changelog del documento.
4. Confirmar: sección modificada + valor anterior → valor nuevo.

---

## Tabla de Gaps

Se emite **siempre**, antes de escribir el documento. Es el punto de intervención del usuario.

```
Gaps detectados — [Componente]
| # | Qué falta | Tipo | Propuesta |
|---|-----------|------|-----------|
| 1 | Estado hover no diseñado | Bloqueante | ¿Uso el token de hover del DS? |
| 2 | Color #E8603C sin token | Advertencia | Sugiero crear color/accent/default |
| 3 | Comportamiento al overflow del texto | Bloqueante | ¿Truncar o wrap? |
```

| Tipo | Significado | Acción |
|------|-------------|--------|
| **Bloqueante** | No se puede documentar sin la respuesta | Esperar al usuario |
| **Advertencia** | Se documenta, pero queda marcado en el doc | Continuar, dejar `⚠` en la sección |
| **Inferido** | Deducido de un patrón del DS | Continuar, marcar como `[inferido]` |

---

## Bloque de Confirmación

```
Modo COMPONENTE — [Nombre] documentado
--------------------------------------
Archivo:   [ruta del .md]
Node:      [id]
Variantes: [N]  |  Estados: [N/8]
Tokens:    [N] mapeados  |  [N] valores crudos
Gaps:      [N] resueltos  |  [N] pendientes
```

---

## Comportamientos Bloqueantes

- **B1** Sin nodeId válido → pedir URL. No documentar desde screenshot.
- **B2** Valor no leído del nodo → no escribirlo. Ni en el documento ni en el canvas.
- **B3** Modo PANTALLA sin confirmación de alcance → proponer, no ejecutar.
- **B4** Async recursivo en lectura de árbol → causa "Cannot unwrap symbol". Un nivel por vez.
- **B5** Medida de una sesión anterior → siempre re-leer el nodo.
- **B6** Estado no diseñado → `⛔ TODO` en la tabla de cobertura. **Nunca inventar sus
  valores.** No bloquea el documento — bloquea la implementación de ese estado.
- **B7** Anotar en Figma sin OK del usuario → escribe en su archivo. Pedir confirmación.
- **B8** Redondear una medida para que entre en el kit de anotación → usar
  `Element Measure` con el valor exacto.
- **B9** Nombre de token en un archivo sin variables → documentar en crudo.

### Qué bloquea el documento y qué no

| Situación | ¿Bloquea? |
|---|---|
| No se puede leer el nodo | Sí — B1 |
| Estado sin diseñar | No — va como `⛔ TODO` |
| Valor sin token | No — va crudo |
| Capa ambigua (contenedor vs ícono) | Sí — leer ambos y aclarar |
| Comportamiento no deducible del nodo (overflow, responsive) | No — va como `⛔ TODO` en Pendientes |

---

## Idioma de los Entregables

Español para lo que se lee. Inglés para lo que se tipea. **Nunca las dos versiones
del mismo dato** — se desincronizan igual que cualquier valor duplicado.

| Contenido | Idioma | Ejemplos |
|---|---|---|
| Prosa, descripciones, alertas | Español | `Faltan los estados`, `área táctil` |
| Nombres de capa en la anatomía | Español | `Botón atrás`, `Fondo del anillo` |
| **Nombres de estado** | Inglés | `hover`, `focus`, `active`, `disabled`, `loading` |
| Propiedades CSS y valores | Inglés | `stroke-dasharray`, `fit-content`, `space-between` |
| Props de la API | Inglés | `currentStep`, `onBack` |
| Colores, fuentes, medidas | Como los reporta Figma | `#D41117`, `Poppins Medium`, `16/24` |

La prueba: **¿esta palabra va a aparecer tal cual en el código?** Si sí, no se traduce.

Los estados son el caso que más se equivoca. Se sienten descripciones pero terminan
siendo props (`disabled={true}`) y pseudo-clases (`:hover`). Traducir algunos y otros
no es peor que traducirlos todos: obliga a dev a adivinar si `deshabilitado` es
`disabled` o `readonly`.

> Si más adelante existe el componente en código, la fila de anatomía suma su nombre
> real (`Botón atrás → BackButton`). Eso es trazabilidad, no traducción — requiere que
> el componente exista.

---

## Formato de Respuesta

- Modo declarado en primera línea
- Tablas sobre párrafos
- Sin emojis. Sin "¡Perfecto!" ni relleno
- Si Figma falla: una línea con el error + qué necesitás del usuario
