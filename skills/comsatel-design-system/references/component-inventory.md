# Inventario de estado — Comsatel Design System (Angular)

Este archivo se actualiza al final de cada auditoría o reconstrucción sobre
el proyecto Angular (`D:\Investigacion\Comsatel-DS-Angular`). Es el único
archivo del skill que se espera que cambie con el uso — los demás son
conocimiento estático de la arquitectura.

Última actualización: 2026-09-07 (segunda ronda de hallazgos reales
reportados por el usuario: (1) InputDropdown embebido en un InputGroup se
veía roto/doble marco en el Playground de Input; el campo de hora de
DateTimePicker no llenaba su ancho, dejando el botón de limpiar muy
alejado — ver `[embedded]`/`[fullWidth]` en la entrada de Dropdown +
InputDropdown; (2) CardBanner/FeatureSpotlightCard dibujaban un ícono de
silueta en sus avatares placeholder que el diseño real no tiene (solo
círculos de color planos) — ver `[showPlaceholderIcon]` en Avatar/
AvatarGroup; (3) `<h3 class="subsection__title">` suelto sin envolver en
`.subsection` en 3 páginas (Avatar, Input, Card) — corregido, ver
`page-pattern.md`. Detalle de (1) en la entrada de Dropdown + InputDropdown,
detalle de (2) en la entrada de Avatar, ambas más abajo).

## Componentes de librería — construidos en Angular con el patrón completo

Librería (`projects/comsatel-ds/src/lib/`) + página de documentación
(`src/app/pages/<nombre>-demo/`) + ruta + entrada en `nav.ts`, verificados en
navegador con interacción real:

- Button (incluye `fullWidth`, agregado después del build inicial)
- Badge
- Avatar (+ AvatarLabel, AvatarGroup, AvatarAddButton) — usa las 9 fotos
  reales de `public/avatars/avatar-1.jpg` a `avatar-9.jpg` (copiadas de
  React), no placeholders generados. `Avatar` tiene dos `@Input()`
  opcionales para el placeholder (sin foto/iniciales), ambos `true`/color
  brand-subtle por defecto — no rompen ningún uso existente:
  - `placeholderBg` — color de fondo del círculo.
  - `showPlaceholderIcon` — si se dibuja la silueta SVG dentro. Hallazgo
    real: Card (`CardBanner`/`FeatureSpotlightCard`) reusaba el
    placeholder de Avatar para su constelación decorativa de "personas sin
    foto", pero el diseño real de esos dos (`card.tsx`) dibuja solo un
    círculo de color PLANO, sin silueta — la reutilización directa de
    Avatar agregó un ícono que el sistema real no tiene ahí. `AvatarGroup`
    reenvía ambos (`showPlaceholderIcon`, y `placeholderBg` por ítem vía
    `AvatarGroupItem.placeholderBg`) a cada `cs-avatar` interno.
- Banner
- Checkbox — accesibilidad vía `<input type="checkbox">` nativo oculto, sin
  Base UI
- Toggle — mismo criterio que Checkbox, track/thumb dibujado + input nativo
- Tooltip — posicionamiento CSS puro (sin Floating UI), delay simulado con
  `transition-delay`
- Dropdown + InputDropdown — cierre al clic afuera vía
  `@HostListener('document:mousedown')`; glyphs de checkbox/radio del ítem
  de menú comparten CSS con Checkbox vía `shared/selection-glyphs.css`
  (el anillo/punto de radio todavía están SOLO ahí — falta extraerlos otra
  vez cuando se porte Radio como componente independiente, ver C8 en
  `audit-checklist.md`). `InputDropdown` tiene dos modificadores opcionales
  agregados tras hallazgos reales (ambos `false` por defecto, no rompen el
  uso normal):
  - `[embedded]="true"` — para usarlo dentro de un `cs-input-group-addon`
    (ej. selector de código de país en un campo de teléfono). Sin esto se
    veía como un "select" completo con su propio borde/fondo anidado
    dentro de otro campo completo (doble marco), y no escalaba de alto con
    el tamaño del grupo si nadie le pasaba `[size]` a mano — hallazgo real
    en el Playground de Input, tipo "Dropdown al inicio"/"al final". Ojo:
    la altura embebida se resuelve con el binding `[style.height.px]`
    normal (mismo que el modo no-embebido), NUNCA con `height:100%` — un
    porcentaje ahí no resuelve de forma confiable a través del
    `display:contents` del addon (se probó y falló silenciosamente,
    quedando ~23px en vez de los 40px reales del grupo).
  - `[fullWidth]="true"` — estira el trigger al 100% de su contenedor en
    vez de encogerse a su contenido, CONSERVANDO su borde/fondo propios
    (a diferencia de `embedded`). Hallazgo real: el campo de hora de
    DateTimePicker vivía en un wrapper de ancho fijo (`FIELD_WIDTH`) pero
    el trigger se quedaba en su ancho de contenido natural (~90-130px),
    dejando un hueco enorme antes del botón de limpiar (se veía "la X muy
    a la derecha") — este SÍ funciona con `width:100%` normal porque no
    hay ningún `display:contents` de por medio en ese caso.
- Input + InputGroup/InputGroupAddon/InputGroupInput/InputGroupText —
  `projects/comsatel-ds/src/lib/input/`. `InputGroup` reacciona a
  foco/inválido/disabled del `input` proyectado con selectores `:has()`
  puros (`.cs-input-group:has([data-slot='input-group-control'][aria-invalid='true'])`,
  etc.), sin JS de coordinación — verificado que el borde/anillo de peligro
  SÍ se aplica visualmente (screenshot), aunque `getComputedStyle()` en
  este Browser pane reportó el valor viejo incluso forzando un
  `style.setProperty(..., 'important')` inline: es una limitación de
  lectura del sandbox, no del CSS — ver punto nuevo en
  `environment-issues.md`. `InputGroupAddon` enfoca el `<input>` interno al
  hacer clic fuera de un botón anidado (`elementRef.nativeElement
  .parentElement?.querySelector('input')?.focus()`); ojo al probarlo por
  JS: el `(click)` está en el `<div>` interno, no en el host
  `<cs-input-group-addon>` (que es `display:contents`) — hacer
  `.click()` sobre el host no dispara el handler.
- Calendar — `projects/comsatel-ds/src/lib/calendar/`. Grilla de 6 semanas
  fijas (42 celdas), selección simple/rango/deshabilitado, navegación
  mes/año controlada o no controlada (mismo patrón dual que React). Nombres
  de mes/día vía `Intl.DateTimeFormat('es', …)` fijo, sin mecanismo de
  locale (ver "Sin i18n" abajo). El hover de celda se resuelve con un
  signal `hoveredIso` + `[ngStyle]` reactivo en vez de CSS `:hover` puro —
  mismo motivo que el bug C4 variante 5 (un color de estado ya viene por
  `[ngStyle]`, así que un `:hover` de CSS externo nunca le ganaría). Reveló
  el bug C4 variante 6 (`defaultMonth`/`defaultYear` sembrados en el
  inicializador de campo en vez de `ngOnInit()` — el Playground mostraba
  el mes actual en vez del pedido pese al binding correcto); ya corregido
  y documentado.
- DateTimePicker — `projects/comsatel-ds/src/lib/datetime-picker/`.
  Compone `InputGroup`/`InputGroupInput`/`InputGroupAddon` (campo de fecha
  con popover de `cs-calendar`) + `InputDropdown` (campo de hora), fecha y
  hora en signals separados. Escritura directa vía `parseTypedDate()` +
  tecla Enter, cierre por clic afuera vía `@HostListener('document:mousedown')`
  (para probarlo con `javascript_tool`, disparar un evento `mousedown` real,
  NO `.click()` — `.click()` no dispara `mousedown`, un falso negativo
  encontrado y descartado en esta sesión). `FIELD_WIDTH=258` fijo
  (7 columnas × `--layout-size-base` de Calendar + padding + borde) y
  `padding-bottom: 320px` reservado en el contenedor de la demo para que el
  popover no quede flotando sobre el Toolbar (C9). También reveló C4
  variante 6: `defaultValue`/`fieldId` sembraban `internalDate`/
  `internalTime`/`inputText`/`viewMonth`/`viewYear`/`resolvedId` en
  inicializadores de campo — ninguna demo con fecha precargada mostraba
  nada hasta mover esa siembra a `ngOnInit()`. `InputGroupInput` (librería
  compartida con Input) se extendió con `id`/`required`/`ariaHasPopup`/
  `ariaExpanded`/`ariaControls` y los outputs `focused`/`blurred`/
  `enterKey`/`escapeKey` — todos opcionales, no rompen el uso existente de
  Input — para que el campo de fecha pudiera reusar el mismo componente en
  vez de un `<input>` bespoke.
- Card — `projects/comsatel-ds/src/lib/card/`, 5 componentes separados
  (React los tenía los 5 en un solo `card.tsx`, acá cada uno es su propio
  `.ts/.html/.css`, igual que Avatar/AvatarGroup/AvatarLabel):
  `ActionCard`, `CardBanner`, `FeatureSpotlightCard`, `SpotlightCard`
  (compone `FeatureSpotlightCard`), `PreviewCard`. Todos reusan piezas ya
  construidas en vez de redibujar a mano (C8) — `ActionCard` usa
  `<cs-toggle size="md">` real donde React tenía un mini-toggle local
  propio, y `<cs-button variant="default" size="sm">`; `CardBanner` usa
  `<cs-avatar-group size="xs" [maxVisible]="3">` para el stack de
  avatares (24px = tamaño `xs` exacto) en vez de círculos superpuestos a
  mano; `FeatureSpotlightCard` usa `<cs-avatar>` individual por posición
  (tamaños 40/32 = `md`/`sm` exactos) dentro de wrappers con coordenadas
  `calc()` propias de esta constelación decorativa (no son tokens de
  layout, quedan explícitas con comentario, mismo criterio que
  `FIELD_WIDTH` en DateTimePicker). `Avatar` se extendió con
  `@Input() placeholderBg` (opcional, default el mismo brand-subtle de
  siempre) para que la constelación pueda variar el color de placeholder
  por posición sin reimplementar el círculo.
  **Hallazgo real corregido:** `cs-avatar-group` no fabrica placeholders
  solo — a diferencia de React (que mostraba 3 círculos de color cuando
  `avatars.length === 0`), si no se le pasan items no renderiza nada. La
  demo de `CardBanner` sin avatares reales pasa 3 `{}` explícitos
  (`AvatarGroupItem` vacío) para que el placeholder real de `cs-avatar`
  (ícono de silueta) aparezca — no hace falta redibujar círculos de color
  para este caso, el placeholder genérico del sistema ya es coherente.
  `PreviewCard` usa `<ng-content select="[logo]">`/`[image]` (slots
  proyectados) en vez de `@Input() logo/image: ReactNode`, que no tiene
  equivalente directo en Angular — mismo criterio que `InputGroupAddon`.

## Fundamentos — alineados al estándar de página Angular

- Tokens (`/foundations/tokens`)
- Color (overview, palette, semantic — Themes queda pendiente, tiene
  referencias a Glass desactualizadas incluso en React)
- Tipografía (`/foundations/typography` y `/typography/tokens`)
- Espaciado (`/foundations/spacing` y `/spacing/tokens`)
- Radios
- Íconos — catálogo completo de 1531 vía fetch a `/icons/lucide/catalog.json`
  (copiado de React), distinto del registro curado interno (ver
  `token-architecture.md`)
- Efectos

## Pendientes — pedidos ahora, siguientes en construirse

Ninguno pendiente de los pedidos explícitos de esta sesión — los 4
componentes (Input, DateTimePicker, Calendar, Card) están construidos y
verificados.

## Sin tocar todavía — ni auditados ni construidos en Angular

Header, List item, Menu, Modal, Progress indicator, Radio (el control
independiente — el glyph compartido ya existe dentro de Dropdown), Stepper,
Toast.

**No existen ni en React** (dead links en su propio `nav.ts`, no construir
sin que el usuario lo pida explícitamente): Tag, Logos, Grids.

## Referencia funcional de React para próximos componentes

Notas de comportamiento y API de los componentes React equivalentes — **son
referencia de ESTRUCTURA y comportamiento, nunca de valores de token** (ver
GUARD en `SKILL.md`). Al portar, releer el `.tsx` real de
`Sistema-de-dise-o-Comsatel` para el detalle exacto; esto es un resumen para
no perder las decisiones ya validadas con el usuario en ese proyecto. El
patrón `InputGroup` que Radio puede llegar a reutilizar
(foco/inválido/disabled vía `:has()`) ya está construido en Angular — ver
la entrada de Input arriba; Calendar, DateTimePicker y Card también ya
están construidos (ver "Componentes de librería" arriba), sus notas de
referencia funcional se retiraron de acá porque ya no aplican como
pendientes.

**Radio** — `Radio` individual + `RadioGroup` con `options` (declarativo) o
`children` (layout avanzado,
ej. radios en una tabla). Trae `label`/`required`/`helperText`/`errorText`/
`invalid` nativos, mismo patrón que Input/DateTimePicker. El anillo/punto ya
tienen su equivalente Angular parcial dentro de `dropdown-item.ts`
(`radioDotSize` con la fórmula de paridad segura, ver C11) — al construir el
componente Radio real, extraer esos estilos a
`shared/selection-glyphs.css` y hacer que Dropdown los consuma de ahí, en
vez de mantener dos implementaciones del mismo glyph.

## Decisiones de diseño ya tomadas (no reabrir sin que el usuario lo pida)

- Tipografía: Manrope para heading, Public Sans para content (divergencia
  intencional de Angular respecto a React, que usa Inter — ver
  `token-architecture.md`).
- **Color de marca (brand): azul marino `#1B4079`, no el índigo `#6172F3`
  del sistema React de referencia** — divergencia intencional decidida por
  el usuario (2026-09-07), NO viene de Figma/React, es una excepción real
  al mismo nivel que la tipografía de arriba. Toda la familia `brand`
  (`--color-background/text/border-brand-*`, `--color-text-link-*`,
  `--color-border-selected`, `--color-border-focused`, `--color-icon-selected`,
  `--color-background-selected`) se regeneró en `tokens.css` a partir de
  ese ancla, para AMBOS temas, preservando la misma arquitectura posicional
  de 9-11 pasos que ya tenía el sistema (cada token sigue apuntando a la
  misma "posición" relativa que antes, solo cambió la familia de color de
  fondo). El light theme usa el ancla `#1B4079` tal cual en `-default`; el
  dark theme usa una sub-escala MÁS CLARA (`#4981d7` en adelante) para
  `-default/-bolder/-boldest/-strongest` — el ancla es demasiado oscura
  para servir de fondo sólido con `--color-text-inverse` encima en dark.

  **Dos rondas de corrección real, no una:**
  1. Primer intento: reusó las mismas posiciones que React 1:1 en dark, y
     el botón primary quedó casi ilegible (texto oscuro sobre fondo azul
     oscuro) — cualquier cambio de color de marca a un tono más oscuro que
     el original necesita revisar el theme oscuro aparte, no basta con
     mapear posiciones.
  2. Segundo intento (a ojo, comparando luminosidad HSL "L%" entre pasos):
     se VEÍA legible y aun así 3 pares no cumplían WCAG AA real al
     calcularlos con la fórmula de contraste (luminancia relativa, no HSL
     L%) — `text-brand-subtle` en light (2.99:1), y el fondo del botón
     primary + el texto de link en dark (3.14:1 y 3.41:1), los tres contra
     el mínimo de 4.5:1 para texto. La luminosidad HSL NO es un proxy
     confiable del contraste WCAG — hay que calcular la luminancia relativa
     real (`references/token-architecture.md` tiene la fórmula y un script
     de verificación) cada vez que se toca un color, no alcanza con que "se
     vea bien". Valores finales, todos verificados ≥4.5:1 (texto) / ≥3:1
     (UI): light `text-brand-subtle` → `#3474d8`; dark `default/bolder/
     boldest/strongest` → `#4981d7/#79a1e0/#a4c0ec/#cbdcf6`; dark `text-
     brand-default`/`text-link-default`/`border-selected`/`border-brand-
     default`/`icon-selected` → `#3f7ad5`.

  Verificado visualmente (no por `getComputedStyle`, que en este Browser
  pane reportó el token viejo pese a que el CSS real sí cambió — mismo
  síntoma ya documentado en `environment-issues.md` punto 6) Y por cálculo
  real de contraste (script Node, fórmula WCAG 2.1).
- Escala de tamaños de fuente (10px a 48px): no reducir el rango global — el
  ajuste es de USO (elegir el nivel correcto por componente), no de escala.
- El registro curado de íconos (`icon-registry.ts`) es la fuente obligatoria
  para uso interno de componentes — el catálogo completo de 1531 es solo
  para la página de exploración, nunca se mezclan.
- Todo `<select>` de Playground es `cs-input-dropdown`, nunca nativo.
- Sin i18n en Angular — Spanish-only directo en el template, a propósito
  (simplificación intencional respecto a React, que sí es bilingüe).
- Logos, Grids y Tag no se construyen — son dead links incluso en el propio
  `nav.ts` de React, no un fundamento/componente real pendiente.

## Cómo actualizar este archivo

Al terminar una auditoría o reconstrucción de un componente/fundamento
existente, moverlo a la sección que corresponda. Al construir un componente
que no existía antes en Angular, agregarlo a "Componentes de librería" con
cualquier decisión de diseño nueva que otras auditorías futuras deban
respetar. Si se porta Radio, mover su nota de "Referencia funcional" a la
entrada real del componente construido, no borrarla — sigue siendo útil
para futuras correcciones.
