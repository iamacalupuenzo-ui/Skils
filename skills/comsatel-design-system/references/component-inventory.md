# Inventario de estado — Comsatel Design System (Angular)

Actualización: 2026-09-10, reconstrucción de `AppLayout` y navegación. Se
tokenizaron bordes, motion y tipografía; se agregaron landmarks y estados ARIA
(`aria-expanded`, `aria-controls`, `aria-current`), nombres accesibles en rail,
foco visible, drawer móvil con Escape, foco inicial/restauración y trampa de
foco. La página `/components/app-layout` ahora documenta accesibilidad y
lineamientos en dos columnas, y se agregó `app-layout.stories.ts` con las
composiciones ya verificadas en la página Angular. La página temporal de
seguimiento se reorganizó por átomos, moléculas, organismos y patrones
compuestos, incluyendo los pendientes de Angular y los pendientes de fuente
React.

Este archivo se actualiza al final de cada auditoría o reconstrucción sobre
el proyecto Angular (`D:\Investigacion\Comsatel-DS-Angular`). Es el único
archivo del skill que se espera que cambie con el uso — los demás son
conocimiento estático de la arquitectura.

Actualización concurrente: 2026-09-10, reconstrucción aislada de `Button` y
`Badge`. Button: C1 corregido en los dos bordes de variante y en el anillo de
foco; se agregó la transferencia de `aria-label` al `<button>` nativo y la
sección de lineamientos de uso con sus ocho casos de paridad documental. Una
instancia local separada confirmó el nombre accesible, el orden de Tab y la
sección; Storybook compiló su caso solo-ícono accesible. Badge: el borde base
pasó a `--layout-border-thin`, el contenido proyectado se centra por su
altura tipográfica real dentro del alto fijo, y se incorporaron los ocho
ejemplos de lineamientos del referente, agrupados en las dos columnas
Recomendado/Evita.

Actualización concurrente: 2026-09-10, reconstrucción aislada de `Menu`
(trabajo en paralelo con la ronda de Button/Badge de arriba — sesión
distinta, mismo repositorio; se evitó tocar cualquier archivo fuera de
`menu/`, `directives/collapse.directive.ts`, `public-api.ts` y
`menu-demo/`). Hallazgos de la auditoría contra `menu.tsx`/
`MenuPageContent.tsx`, todos corregidos:
- **Bug de comportamiento real** (`menu.ts`): `isOpen()` hacía
  `openHrefs.has(href) || isHighlighted(item)` — un grupo con hijo activo
  quedaba highlighted para siempre y el toggle manual nunca lo cerraba
  visualmente (el `||` seguía ganando). React sí permite colapsar un grupo
  activo (`useState` real + `useEffect` que solo FUERZA a abrir cuando
  cambia el activo). Fix: `isOpen()` ahora lee solo `openHrefs`; se agregó
  `ngOnChanges` que agrega el href activo al set cuando `activeHref`/
  `groups` cambian — mismo efecto que el `useEffect` de React, sin dejar el
  grupo pegado en cada evaluación.
- **Animación de expandir/colapsar faltante**: el submenú aparecía/
  desaparecía de golpe con `@if`. Se extrajo el mecanismo GSAP que ya usaba
  `cs-accordion-item` (`height: 0→auto`, CSS puro no puede transicionar eso)
  a una directiva reusable nueva, **`Collapse` (`[csCollapse]`)** en
  `projects/comsatel-ds/src/lib/directives/collapse.directive.ts`, exportada
  en `public-api.ts` — Menu es su primer consumidor; el `<ul
  class="cs-menu__children">` ahora vive siempre en el DOM (mismo criterio
  que el `body` de Accordion) y el binding `[csCollapse]="isOpen(item)"`
  controla la animación.
- **C1** (padding convertido mal desde Tailwind al portar): `.cs-menu__row`
  vertical `sm`→`md` (React `py-2`=8px), `.cs-menu__child` y
  `.cs-menu__flyout-item` verticales `xs`→`sm` (React `py-1.5`=6px),
  `.cs-menu__rail-btn`/`--disabled` `sm`→10px explícito (React
  `py-2.5`=10px, hueco de escala) y `.cs-menu__tooltip` horizontal
  `md`→10px explícito (React `px-2.5`=10px). También el `transition` del
  chevron pasó de `0.15s ease` crudo a
  `var(--motion-duration-leaving) var(--motion-easing-default)` (150ms ya
  coincidía con el token, solo no estaba atado).
- **C13**: `.cs-menu__row` y `.cs-menu__child` tenían `line-height: 16px`
  fijo en vez de `var(--font-line-height-content-note)` — se habían
  escapado de la ronda de auditoría C13 anterior (que sí corrigió
  group-header/flyout-title/flyout-item/tooltip).
- **Página** (`menu-page.*`): assets `public/logos/c-locator-logo.png` y
  `-compact.png` copiados desde React (no existían en Angular). Sección
  "Ejemplo completo" reescrita a un solo frame en modo expandido con header
  de marca (logo), sin alto fijo — el alto 424px + header rotulado de texto
  que tenía antes correspondía en realidad al patrón del Playground de
  React, no al de esta sección. Playground: agregado el control "Ítem
  activo" que faltaba (`activeItem`, ausente respecto a
  `MenuPageContent.tsx`) y el header de logo (compacto en modo rail).
  Lineamientos de uso: agregado el par "groups" completo que faltaba
  (agrupar ítems relacionados vs. grupo de un solo ítem) y, siguiendo B15,
  las tarjetas "Recomendado" de los pares actions/depth pasaron de solo
  texto a un `<cs-menu>` real embebido e interactivo (igual que React,
  que sí los renderiza vivos ahí) — los 4 snippets de código restantes
  (`.guide-card__code`, patrón ya usado en Accordion) se agregaron donde
  antes solo había texto.

**Verificación en vivo (2026-09-10, tras reinicio de `ng serve` coordinado
por el usuario):** el usuario reportó 4 hallazgos reales adicionales al
ver la página reconstruida, los 4 corregidos en la misma pasada:
- **Imágenes del logo desbordaban el frame.** El asset real
  (`c-locator-logo.png` = 1106×100px, `-compact.png` = 317×90px) es mucho
  más ancho que alto — fijar solo `height:28px` (mismo criterio que
  `h-7 w-auto` de React) lo desborda del ancho del frame (240px/72px). Fix:
  `.frame__header img` con `max-width:100%; max-height:28px; width:auto;
  height:auto;` en `menu-page.css` — el ancho manda cuando la proporción lo
  exige.
- **Colisión de key reservada `mode` con el tema del Canvas.** Bug real de
  la página (preexistente, no introducido en esta ronda): el
  `ControlDef` de Menu usaba `key: 'mode'` para su prop `mode`
  (expanded/rail) — pero `demo-shell.ts` usa esa MISMA clave internamente
  para su propio interruptor de tema claro/oscuro (`state = signal({mode:
  'light'})`, `[attr.data-theme]="mode()"`). El valor de Menu sobreescribía
  el tema real, dejando `data-theme="expanded"` en vez de `"light"`/`"dark"`
  — rompía visualmente el grid de puntos/colores del Canvas. Fix: la key del
  control de Menu pasó a `menuMode` en `menu-page.ts` (`onPlaygroundState`
  actualizado igual). Cualquier página futura con una prop real llamada
  `mode` debe usar una key distinta a `mode` en su `ControlDef` por la misma
  razón.
- **Playground con alto fijo generaba scrollbar interna.** Se quitó
  `.frame--fixed-height` (424px + `overflow-y:auto`) — el frame ahora crece
  con su contenido, sin scroll, incluida la variante rail/expandido.
- **Faltaba el frame contraído (rail) en "Ejemplo completo".** Pedido
  explícito del usuario tras ver el resultado (diverge de
  `MenuPageContent.tsx`, que solo muestra expandido ahí — decisión del
  usuario, no un hallazgo de paridad con React). Se agregó el segundo frame
  en modo rail con el logo compacto, igual patrón que el frame expandido.

**Verificado con interacción real** (`ng.getDirectives`/`ng.getComponent`
vía consola, más recarga con `activeHref` temporal apuntando a un hijo de
"Flota"): el grupo con hijo activo SÍ se puede colapsar y reabrir con clic
(`openHrefs`/`ngOnChanges` correctos en ambas direcciones — confirmado por
el chevron y el `@Input` de `Collapse` alternando `true`/`false`), y la
animación GSAP progresa correctamente hacia los extremos (0 / altura real).
La DURACIÓN exacta de la animación no se pudo medir con precisión en este
Browser pane — `document.hasFocus()` devuelve `false` incluso con el tab al
frente (mismo gotcha ya documentado en `environment-issues.md` punto 6),
lo que throttlea `setTimeout`/rAF y distorsiona cualquier medición de
tiempo real; el progreso relativo de la animación sí se confirmó estable
en ambas direcciones. Sin errores de consola. Playground, Estados y las 2
guide-cards vivas (`actions`/`depth`) confirmados visualmente sin errores.

Componente y página quedan **Cerrados** con esta pasada.

**Segunda ronda (2026-09-10): auditoría de la referencia React, 2 bugs
heredados encontrados y corregidos también en Angular.** El usuario pidió
auditar `menu.tsx` en `Sistema-de-dise-o-Comsatel` (excepción puntual al
alcance habitual del skill — no para portar nada, sino para revisar la
calidad de la fuente) tras notar en vivo que el flyout de rail se veía con
etiquetas grandes y un doble borde raro. Confirmado con HTML/estilos
computados reales (no solo lectura de código):
- **Tooltip de hoja del flyout de rail reimplementado a mano en React**
  (`RailItem`, rama sin `children`) en vez de reusar `<Tooltip>` real:
  `text-[12px]`/`px-2.5 py-1.5`/`rounded-md`/`shadow-lg` contra
  `label/small` (11px)/`layout-padding-xs md`/`radius-xs`/`shadow-md` que
  sí usa `tooltip.tsx`. **Este mismo bug ya estaba en Angular** (heredado
  al portar): `.cs-menu__tooltip` usaba `--font-size-content-note`
  (12px)/`--layout-padding-sm 10px`/`--radius-sm`/`--shadow-lg` en vez de
  calcar `cs-tooltip` real (`tooltip.css:24-28`). Corregido en Angular
  (`menu.css`) a `--font-size-label-small`/`--layout-padding-xs md`/
  `--radius-xs`/`--shadow-md`. **React sigue sin corregir** — el usuario no
  confirmó todavía si quiere ese fix también en la fuente.
- **Ningún ítem de Menu (rail ni expandido) definía foco visible
  tokenizado**, ni en React ni en Angular — a diferencia de `Button`
  (`focus-visible:ring-2 ring-[var(--color-border-focused)] ring-offset-2`
  en React; `box-shadow` doble equivalente en `button.css:39-43` de
  Angular). El navegador aplicaba su outline nativo en su lugar. Corregido
  en Angular: `.cs-menu__row`/`.cs-menu__rail-btn` (triggers raíz) con el
  mismo `box-shadow` doble de Button; `.cs-menu__child`/
  `.cs-menu__flyout-item` (ítems de lista secundarios) con el criterio de
  `.cs-dropdown-item:focus-visible` (fondo de hover, sin ring propio —
  serían redundantes/se recortarían contra los vecinos). **React sigue sin
  corregir.**

Librería Angular reconstruida (`✔ Built comsatel-ds` sin errores) y
verificado con interacción real (`ng.getDirectives`/hover real vía
`computer`) que el fix del tooltip SÍ quedó aplicado: `.cs-menu__tooltip`
midió 11px/4px-8px/2px de radius/sombra de dos capas — coincide con
`cs-tooltip` real. Pendiente confirmar con el usuario si corresponde
aplicar los mismos 2 fixes en React (`menu.tsx`), ya que ahí se originó el
patrón.

**Tercera ronda (2026-09-10): refactor a `cs-popover` real, motivado por el
usuario ("el hover sigue entrecortado... el de varias opciones sí parece
usar el Popover que tenemos, creo").** Confirmado un hallazgo C8 más
grande de lo que parecía: el flyout de rail de Menu (tooltip de hoja Y
lista de children) reimplementaba TODO el motor de overlay a mano
(`onRailEnter` calculando `getBoundingClientRect` manual, `position:fixed`
propio, SIN animación de entrada/salida, SIN cierre por click-afuera ni
Escape) — mientras que `cs-popover` (`projects/comsatel-ds/src/lib/popover/`)
ya resuelve exactamente eso, documentado desde su construcción como "base
real para Select/Spotlight/**Menu**" en este mismo archivo, pero nunca se
integró. Nadie más en la librería consumía `<cs-popover>` todavía —
Menu es su primer uso real.
- **`Popover` ganó un `@Input() bare`** (`popover.ts`/`.html`/`.css`): quita
  el marco propio (borde/fondo/radio/sombra), dejando solo posicionamiento/
  portal/animación/cierre — para un consumidor cuyo contenido ya trae su
  propia superficie visual (el tooltip oscuro de Menu no debe verse dentro
  de una segunda tarjeta clara). No rompe ningún uso existente (no había
  ninguno).
- **`menu.ts`**: `onRailEnter` ya no calcula posición a mano (perdió el
  parámetro del evento); se quitó el signal `flyoutPos` (ahora lo resuelve
  Popover vía `[triggerRef]`).
- **`menu.html`**: cada trigger de rail (`#railTrigger`) tiene su propio
  `<cs-popover [isOpen]="hoveredItem()===item" [triggerRef]="railTrigger"
  placement="right-start" [offset]="6">` — `[bare]="true"` en el caso hoja
  (tooltip), sin `bare` en el caso children (lista, que SÍ debe verse como
  tarjeta con marco). Se quitó el bloque `@if` global que dibujaba el
  flyout fuera del `@for`.
- **`menu.css`**: `.cs-menu__flyout` perdió `position/z-index/border-radius/
  border/background-color/box-shadow` (duplicaban el marco que ya provee
  `cs-popover`) — de paso corrigió que usaba `--elevation-surface-raised`
  en vez de `--elevation-surface-overlay` (el token real de overlay
  flotante, el mismo que usan Popover y Modal).

Librería reconstruida (`✔ Built comsatel-ds` sin errores).
**Pendiente:** verificación visual del refactor completo (animación de
entrada/salida del flyout, cierre con click-afuera/Escape, reposición en
scroll/resize) — el usuario coordina el reinicio de `ng serve` (puerto
4300, compartido con otra sesión en paralelo).

Última reconstrucción individual: `Avatar` (incluye AvatarLabel,
AvatarGroup y AvatarAddButton). Se cerraron los criterios C1–C13, la paridad
documental y la verificación visual del conjunto el 2026-09-10.

Última reconstrucción individual: `Input` + `InputGroup` (incluye
InputGroupAddon, InputGroupInput e InputGroupText). Se cerraron los criterios
C1–C13, la API nativa de accesibilidad, la paridad documental con React y la
verificación visual/interactiva del conjunto el 2026-09-10.

Última reconstrucción individual: `Dropdown` + `InputDropdown` (incluye
DropdownItem). Se cerraron los criterios C1–C13, los patrones de menú y
combobox/listbox, la navegación por teclado, la paridad documental con React y
la verificación visual/interactiva del conjunto el 2026-09-10.

Última actualización: 2026-09-16, escala de etiquetas de campo. Se publica
`fieldLabelTypography` desde `lib/input/input-tokens.ts`: `xs` usa
`label/small`; `sm` y `md`, `content/note`; y `lg`, `content/caption`, siempre
con peso `accent`. `Select`, `InputDropdown`, `DateTimePicker` y
`DateTimeRangePicker` derivan su etiqueta encapsulada de ese mapa y conservan
los spacers del rango en la misma altura. `Input`, `InputGroupInput` y
`PasswordInput` mantienen intencionalmente una etiqueta externa; la guía de
Input documenta la receta pública `textStyle(fieldLabelTypography[size],
'accent')`. No añadir un input `label` a esos controles sin diseñar primero un
`FormField` que resuelva toda la anatomía. Verificado con build de librería y
app, tests de librería/aplicación, controles de documentos, Storybook y la ruta
local `/components/select` en tamaño `lg`, además de `/components/datetime-picker`.

Última actualización: 2026-09-10, quinta ronda (cierre de la lista completa
del usuario: Mapa y Animaciones). Se investigaron primero las páginas reales
de React (`MapThemePageContent.tsx`, `MarkersPageContent.tsx`,
`LiveMapPreview.tsx`, `MotionPageContent.tsx`, `MotionTokensPageContent.tsx`,
`motion.tsx`) antes de tocar código Angular, mismo criterio que cada
componente anterior. Construido:
- **`Motion` (`projects/comsatel-ds/src/lib/motion/motion.ts`)** —
  primitivo de animación de entrada/salida genérico, nuevo componente de
  librería (no solo una directiva puntual como `PressScale`). 6 presets
  (fade/scale/slide-*), duración/easing por token, motor GSAP. Ver su
  entrada completa más abajo en "Componentes de librería".
- **Páginas `/animations/tokens` y `/animations/motion`** — documentan los
  tokens de motion (ya existían en `tokens.css`, sin cambios de valor) y el
  componente `Motion` nuevo.
- **Página `/map/theme`** — requirió evaluar qué librería de mapas es
  compatible con Angular (pedido explícito del usuario: "no necesariamente
  el que utilizamos en react es compatible con angular"). Se verificó
  `leaflet` (BSD-2-Clause, sin `peerDependencies`, confirmado leyendo el
  LICENSE real del tarball de npm, no solo el metadata) — se usa el paquete
  core `leaflet` con su API vanilla directo en un componente Angular
  (`LiveMapPreview`, local a esta página de documentación, NO exportado
  desde `comsatel-ds`: en React tampoco vive en `components/ui/`, es un
  componente de docs). Nuevos tokens de color en `tokens.css` (ver su
  entrada abajo).
- **Página `/map/markers`** — documentación pura, sin componente de
  librería nuevo: igual que en React, los marcadores reales los pinta
  Leaflet con `divIcon`/HTML plano (código de C-Locater, fuera de este
  repo). Los componentes `VehiclePill`/`GpsCompact`/`GpsFull`/
  `ClusterBadge` son locales a esta página (mockups de referencia), no
  parte de `comsatel-ds`.
- Íconos nuevos en el registro: `car`, `bike`, `bus`, `tractor`,
  `satellite`, `sun`, `map-pin`, `locate-fixed`, `timer`, `wand-2`.
- `nav.ts`: secciones nuevas "Mapa" y "Animaciones"; corregido un
  `pending: true` obsoleto en Pagination (ya estaba construido y con ruta
  real desde una ronda anterior, quedó sin actualizar en `nav.ts`).
- Dependencia nueva del proyecto Angular (raíz, no de `comsatel-ds`):
  `leaflet` + `@types/leaflet`, con `leaflet.css` registrado en
  `angular.json` (`styles`).

**Con esto se cierra la lista completa de componentes/secciones pedida por
el usuario el 2026-09-10.** No queda ningún pendiente explícito de esa
lista. Sigue, si el usuario lo pide: auditoría de tokens/tamaños de este
último tramo (Motion, Mapa, Marcadores) con el mismo checklist de 13
criterios ya aplicado al resto.

Actualización anterior: 2026-09-10, cuarta ronda (auditoría completa de
tokens/tamaños/tipografía de todo lo construido hasta ese punto — bug
sistémico de `line-height` faltante encontrado y corregido en 8
componentes, más 2 valores crudos de `menu.css` alineados a token; ver
`audit-checklist.md` C13 para el detalle completo).

Actualización anterior: 2026-09-10, tercera ronda (Skeleton, Accordion y
Radio construidos y verificados — primeros de la lista de componentes
faltantes, en el orden de dependencia acordado con el usuario. Corrección
real: Header y List item NO estaban listos para portar, son dead links en
React también — se sacaron de la lista de "listos". Progress indicator se
reconstruyó después como componente nuevo solicitado explícitamente.
Mecanismo `@ContentChildren` establecido como el estándar para coordinar
componentes compuestos padre-hijo, documentado para que Menu/Table lo
reutilicen sin reabrir la pregunta de DI).

Actualización anterior: 2026-09-10, segunda ronda (fundamento "Layout"
construido — reveló que el Shell real del sitio no implementaba el sistema
de 3 modos responsivos que la página describe; se reconstruyó completo:
tokens de breakpoint/layout-chrome nuevos, servicio `SidenavState`, rail
con flyout, drawer mobile. Pendiente explícito: `AppLayout` reusable para
producto, ver sección "Pendientes").

Actualización anterior: 2026-09-10, primera ronda (GSAP evaluado y aceptado
como motor de animación — ver sección propia más abajo; directiva
`PressScale` construida y aplicada en el sidebar; corregido el color del
ícono del sidebar para heredar del texto en vez de un color propio fijo).

Actualización anterior: 2026-09-07 (tercera ronda: se escribió `.stories.ts`
para todos los componentes de librería que faltaban en Storybook — y se
corrigió, agregando la regla B11/`storybook-pattern.md`, que varias
composiciones se habían inventado directo en Storybook sin existir en el
desarrollo Angular real: un botón con ícono a ambos extremos, un botón
solo-ícono, `showPlaceholderIcon` suelto en Avatar, `embedded`/`fullWidth`
sueltos en InputDropdown — todas revertidas o reemplazadas por el patrón
real. Detalle completo en `storybook-pattern.md`.

Segunda ronda de hallazgos reales
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

## PrimeNG — evaluado y descartado (decisión cerrada, 2026-09-09)

Se evaluó a fondo usar PrimeNG como motor de comportamiento/accesibilidad
para componentes complejos (se llegó a construir un piloto funcional de
Modal envolviendo `p-dialog`). **Decisión final: no.** No por motivo
técnico — por licenciamiento: PrimeNG 22 exige licencia comercial que
Comsatel no califica gratis (15+ desarrolladores, tope real es 4), y
envolverlo dentro del sistema de diseño no exime a los desarrolladores que
lo consuman después (confirmado con la FAQ oficial de PrimeUI). La única
versión MIT permanente (PrimeNG 21) no soporta Angular 22, que es lo que
corre este proyecto. Historial completo de la evaluación en
`D:\Investigacion\Comsatel-DS-Angular\PRIMENG_PLAN.md`.

**Todo componente se construye a mano, sin excepción — ver B14 en
`SKILL.md` y `references/accessibility-patterns.md`.** Ese archivo tiene el
patrón concreto (código real) para foco atrapado, portal a
`document.body`, bloqueo de scroll, cierre con Escape/clic afuera, y
animación de entrada/salida sin librería — más un gotcha real de esta app
(corre sin `zone.js`, zoneless por defecto: cualquier estado mutado dentro
de un `setTimeout` tiene que ser `signal()`, no una propiedad plana, o la
vista nunca se actualiza — ver C4 punto 7 en `audit-checklist.md`).

Registrado también en `Sistema-de-dise-o-Comsatel/COMPONENT_GAPS.md` para
que quede visible desde los dos proyectos.

## GSAP — evaluado y aceptado (2026-09-10)

Distinto de PrimeNG: no es una librería de UI (sin componentes ni identidad
visual propia), es un motor de animación de utilidad. Se evaluó con el
mismo rigor de necesidad (¿CSS puro ya lo resuelve?) para el caso real que
lo disparó — el feedback de "presionado" del sidebar (equivalente a
`whileTap` de Framer Motion en React, ver `Sidebar.tsx`/`menu.tsx` en
`Sistema-de-dise-o-Comsatel`) — y se aceptó como dependencia de
`comsatel-ds`. Se descartó antes `@angular/animations`: instalado,
probado, y desinstalado en la misma sesión al confirmar que Angular 22 lo
marca deprecado a favor de `animate.enter`/`animate.leave` (que solo cubre
entrada/salida del DOM, no el caso de interacción que hacía falta).

Detalle técnico y el criterio de "cuándo sí / cuándo no" en
`references/accessibility-patterns.md` sección 9. B14 en `SKILL.md` se
actualizó para aclarar que la regla de "nada de librerías de terceros" era
sobre librerías de UI (PrimeNG-tipo), no sobre cualquier paquete npm.

## Componentes de librería — construidos en Angular con el patrón completo

Librería (`projects/comsatel-ds/src/lib/`) + página de documentación
(`src/app/pages/<nombre>-demo/`) + ruta + entrada en `nav.ts`, verificados en
navegador con interacción real:

- Button (incluye `fullWidth`, agregado después del build inicial)
- Badge
- Tag — componente informativo nuevo solicitado explícitamente: compone
  `cs-badge` para reutilizar geometría, tipografía y centrado; expone
  `severity`, `size`, `rounded`, `value`, `icon`, `aria-label` y `aria-live`.
  Las severidades siguen la semántica de categorización pública evaluada
  para el patrón (`primary`, `secondary`, `success`, `info`, `warn`,
  `danger`, `contrast`) y se mapean a variantes de Badge propias del sistema.
- Progress indicator — componente de recorrido por etapas solicitado
  explícitamente: estados `done`/`active`/`pending`, orientación horizontal o
  vertical, interacción opcional por botones y evento `stepClick`; usa la
  estructura de recorrido de la referencia funcional, con tokens y motor
  propios de Angular.
- Stepper — indicador de una secuencia fija: los estados `done`/`active`/
  `pending` usan una lista informativa por defecto y botones nativos solo con
  `interactive`; los conectores comienzan y terminan en los centros de los
  nodos y la variante vertical conserva sus tramos visibles. No implementa
  paneles de wizard, que son un patrón distinto.
- Header — patrón compuesto solicitado explícitamente: marca de texto no navegable, notificaciones y menú de cuenta
  configurable, acciones de utilidad y cuenta. Reutiliza Avatar, Icon y el
  portal accesible de Popover; expone eventos de navegación, notificaciones,
  configuración y cierre de sesión sin acoplarse a un producto concreto.
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
- Tooltip — posicionamiento CSS puro relativo al trigger, delay simulado con
  `transition-delay`
- Dropdown + InputDropdown — cierre al clic afuera vía
  `@HostListener('document:mousedown')`; glyphs de checkbox/radio del ítem
  de menú comparten CSS con Checkbox/Radio vía `shared/selection-glyphs.css`
  y la fórmula del punto vive en `shared/radio-glyph.ts`, para evitar que
  ambos contextos diverjan. `InputDropdown` tiene dos modificadores opcionales
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
- Modal — `projects/comsatel-ds/src/lib/modal/`. Motor de comportamiento
  100% a mano (ver B14 en `SKILL.md` y `accessibility-patterns.md`): foco
  atrapado, portal a `document.body` vía `Renderer2`, bloqueo de scroll,
  restauración de foco, cierre con Escape/clic afuera. `appearance`
  (`default`/`warning`/`danger`) tiñe el título y el botón principal juntos
  — mapea a las variantes ya existentes de `cs-button`
  (`primary`/`warning`/`destructive`). `width` con escala propia (`sm`
  400px/`md` 560px/`lg` 720px/`xl` 960px, sin equivalente en
  `token-architecture.md` — mismos números que el Modal de React, ver B1)
  o un número directo. `scrollBehavior` (`body`/`viewport`) controla si el
  contenido interno scrollea (con tope `85vh`) o si todo el panel se
  desplaza en la página. **Bug real de plataforma encontrado y corregido:**
  el estado de la animación de entrada/salida (`rendered`/`visible`) se
  escribió primero como propiedades planas mutadas dentro de un
  `setTimeout` — la transición nunca se veía porque esta app corre sin
  `zone.js` (zoneless). Fix: `signal()` en vez de propiedad plana — ver C4
  punto 7 en `audit-checklist.md`.
- `PressScale` (directiva `[csPressScale]`) —
  `projects/comsatel-ds/src/lib/directives/press-scale.directive.ts`.
  Feedback de "presionado" reusable (encoge a escala 0.98 mientras el
  puntero está abajo) vía GSAP — ver sección "GSAP" arriba y
  `accessibility-patterns.md` sección 9. Aplicada por ahora en el sidebar
  de la shell (`src/app/layout/shell/shell.html`: grupo, ítem raíz activo,
  ítem hijo). Las duraciones se leen en tiempo real de
  `--motion-duration-fast`/`--motion-duration-leaving`, no quedan copiadas
  como número suelto.
- **Corrección real (2026-09-10), sidebar de la shell:** el ícono de cada
  ítem del menú (`.sidebar__item-icon`) tenía un color propio fijo
  (`--color-text-base-subtlest`) en vez de heredar el color del texto que
  lo acompaña — a diferencia de la referencia React, donde el ícono es un
  SVG con `stroke="currentColor"` y sigue automáticamente el color del
  texto del contenedor (normal/hover/activo) sin reglas por estado. Fix:
  `color: inherit` en `.sidebar__item-icon` (`shell.css`), que además
  permitió borrar las reglas `.sidebar__item--active .sidebar__item-icon`/
  `.sidebar__group--active .sidebar__item-icon` — ya no hacían falta.

- **App Layout (2026-09-10)** —
  `projects/comsatel-ds/src/lib/app-layout/` (`AppLayout` + `AppLayoutState`,
  ambos exportados en `public-api.ts`) + página
  `/components/app-layout` (`src/app/pages/app-layout-demo/`). Componente
  NUEVO sin equivalente 1:1 en React (React no separa "shell del sitio" de
  "shell reusable de producto") — pedido explícito del usuario tras cerrar
  el fundamento Layout: el Shell interno del sitio
  (`src/app/layout/shell/`) sirve a ESTE sitio; `AppLayout` es la misma
  mecánica empaquetada para que cualquier producto la consuma sin conocer
  `nav.ts` de este repo.
  - **API**: `[hasPanel]`/`[showCollapseButton]` como `@Input()`; áreas vía
    `<ng-content select="[topnav]">`/`[sidenav]`/`[panel]`, `main` es el
    `<ng-content>` por defecto. `AppLayoutState` (`providedIn: 'root'`)
    expone `mode()` (`'expanded'|'rail'`), `collapsed()`,
    `toggleCollapsed()` — cualquier componente de la app puede inyectarla,
    incluido el propio contenido proyectado del consumidor.
  - **Decisión de diseño real, no trivial:** `AppLayoutState` es
    `providedIn: 'root'` a propósito, NO un provider a nivel del propio
    componente — el contenido proyectado vía `<ng-content>` resuelve su
    inyección contra el árbol donde se DECLARÓ (el template del
    consumidor), no donde Angular lo renderiza dentro de `AppLayout`; un
    provider de componente sería invisible para el nav del consumidor. Un
    singleton root es correcto acá porque un producto monta un solo
    `AppLayout` en la raíz de su app, igual que este sitio monta un solo
    Shell.
  - **Qué NO resuelve, a propósito:** no conoce datos de navegación ni
    íconos de ningún producto — el `[sidenav]` proyectado es responsabilidad
    del consumidor, incluido decidir cómo se ve en modo rail (ocultar
    labels, etc.), inyectando `AppLayoutState` igual que hace la demo.
    Tampoco tiene modo Drawer/mobile: decisión explícita del usuario
    (2026-09-10) — la app mobile va a ser un producto aparte con estructura
    propia, todavía sin definir; no construir esa pieza hasta que exista
    esa definición.
  - **Verificado con interacción real:** toggle de colapsar/expandir vía
    click real dentro del demo, confirmado `data-mode`, ancho del sidenav
    (`240px`→`64px`) y que el label del nav de ejemplo desaparece al leer
    `AppLayoutState.mode()` — sin errores de consola. La auditoría posterior
    confirmó en el árbol de accesibilidad el landmark de navegación, los
    nombres de los ítems en rail y el estado expandido/colapsado de los
    grupos. El drawer del Shell conserva el foco, cierra con Escape y restaura
    el foco al botón que lo abrió.
  - **Reconstrucción cerrada:** `app-layout.html/css`, `shell.ts/html/css`,
    `app-layout-page.html/css`, `app-layout.stories.ts` y la página temporal
    de seguimiento. Las transiciones respetan `prefers-reduced-motion`; no se
    agregó modo Drawer al componente reusable porque la decisión vigente lo
    reserva para el producto mobile separado.

- **Skeleton (2026-09-10)** — `projects/comsatel-ds/src/lib/skeleton/`. Primitivo
  interno de carga (shimmer en loop), sin página de documentación propia —
  React tampoco le da una (no aparece en su `nav.ts`), es un primitivo que
  otros componentes consumen (prerequisito real de Table). Duración del
  shimmer (1.6s) declarada explícita con comentario — no coincide con ningún
  `--motion-duration-*` de la escala (100-350ms, pensada para transiciones
  puntuales de UI, no para un loop ambiente) y no correspondía forzarla
  (B1).
- **Accordion (2026-09-10)** — `projects/comsatel-ds/src/lib/accordion/`
  (`Accordion` + `AccordionItem`) + página `/components/accordion`. API
  compuesta (`<cs-accordion><cs-accordion-item id="x"><div header>...</div>
  ...contenido...</cs-accordion-item></cs-accordion>`), NO el `items: []`
  de React — Angular no tiene un equivalente directo a pasar JSX dentro de
  un array de datos, y un compound component es el patrón idiomático acá
  (mismo criterio que Angular Material `mat-accordion`/`mat-expansion-panel`).
  **Decisión de arquitectura real:** el padre coordina la exclusión mutua
  (`type="single"`) vía `@ContentChildren(AccordionItem)` + suscripción
  manual a un `@Output() toggled` de cada hijo — NO vía `inject(Accordion)`
  desde el hijo, porque un `<cs-accordion-item>` está declarado en el
  template del CONSUMIDOR (contenido proyectado), y la resolución de DI de
  Angular para eso es terreno ambiguo; `@ContentChildren`/`QueryList`
  siempre funciona sin importar esa ambigüedad. Mismo patrón para Radio
  (ver abajo) — **cualquier componente compuesto nuevo (Tab, etc.) debe
  seguir este mismo mecanismo, no reabrir la pregunta de DI cada vez.**
  Animación de expandir/colapsar con **GSAP animando a `height: 'auto'`**
  (`accordion-item.ts`) — primer caso real donde CSS puro genuinamente no
  alcanza (no se puede transicionar a `height: auto` con CSS), justo el
  caso que motivó aceptar GSAP como motor (ver sección "GSAP" arriba). El
  chevron sí es CSS puro (`transform: rotate` + `transition`) — GSAP solo
  donde CSS no resuelve. **Auditoría individual cerrada (2026-09-10):**
  encabezado y panel enlazados con `aria-controls`/`aria-labelledby`, panel
  con `role="region"` y `aria-hidden` sincronizado, foco visible por tokens,
  estado disabled nativo y exclusión `single` verificada con interacción real;
  Storybook documenta Default/Multiple/DisabledItem. **Revisión de estados
  (2026-09-11):** las etiquetas de telemetría reutilizan `cs-badge` con
  íconos curados más texto (`activity`/Activo, `circle-pause`/Detenido y
  `wifi-off`/Sin señal); el contenido se centra mediante el wrapper propio
  de Badge, sin dibujar una variante local. La página sustituyó sus SVG
  inline de lineamientos por `cs-icon`, y completó los pares
  `font-size`/`line-height` de la demo. **Reconstrucción de geometría y
  teclado (2026-09-11):** el componente conserva ancho fluido para consumo,
  mientras la documentación limita únicamente la muestra de flota a 40rem
  para una lectura proporcionada; los ids ARIA de cada instancia son únicos,
  los paneles cerrados quedan `inert` y Flecha arriba/abajo, Inicio y Fin
  recorren encabezados habilitados.
- **Radio (2026-09-10)** —
  `projects/comsatel-ds/src/lib/radio/` (`Radio` + `RadioGroup`) + página
  `/components/radio`. Mismo mecanismo de coordinación padre-hijo que
  Accordion (`@ContentChildren`, nunca DI). Accesibilidad vía
  `<input type="radio">` nativo oculto compartiendo `name` (mismo criterio
  que Checkbox: el navegador da teclado/arrow-keys/roving-tabindex gratis,
  sin reimplementar ARIA a mano) — `RadioGroup` reparte el `name` generado
  y el `checked`/`disabled` efectivo a cada `Radio` hijo.
  **Extracción real (ya anotada como pendiente en la sesión anterior):** el
  glyph de anillo/punto que antes vivía SOLO dentro de `dropdown-item.ts`
  (para `selectionMode="radio"`) se movió a `shared/selection-glyphs.css`
  (clases renombradas de `cs-dropdown-item__radio-*` a `cs-radio-*`, genéricas)
  y la fórmula `radioDotSize` a `shared/radio-glyph.ts` — `dropdown-item.ts`
  ahora importa la función en vez de tener su propia copia. Sin esto, Radio
  y el glyph de Dropdown podían divergir con el tiempo (exactamente el
  problema que ya había en React antes de compartir el código real, ver
  comentario original en `radio.tsx`).
  **Simplificación real respecto a React:** no existe un `options: []`
  declarativo — mismo criterio que Accordion, el consumidor arma el `@for`
  en su propio template en vez de pasar un array de datos; también se
  quitó la propagación automática de `size` de grupo a hijos (React la
  tiene vía `options`, acá cada `<cs-radio>` declara su propio `size`) para
  no dejar un prop de grupo que no hiciera nada real en la API compuesta.

- **Tab (2026-09-10)** — `projects/comsatel-ds/src/lib/tab/` (`Tabs` +
  `Tab`) + página `/components/tab`. **Única excepción real al mecanismo
  `@ContentChildren` de Accordion/Radio**: acá se usó `contentChildren()`
  (la query basada en signals, no `@ContentChildren`/`QueryList`) porque el
  PROPIO template de `Tabs` necesita re-renderizar la fila de botones a
  partir de la lista de tabs — en Accordion/Radio el padre nunca dibuja
  nada a partir de la lista en su propio template, solo setea signals en
  cada hijo (que se re-renderiza solo). Cuando el padre sí necesita iterar
  la lista en su propio template de forma reactiva en esta app zoneless,
  la query tiene que ser un signal de verdad — `QueryList` no alcanza ahí.
  Variantes `line`/`pill`, CSS puro (sin GSAP, no hacía falta).
- **Pagination (2026-09-10)** — `projects/comsatel-ds/src/lib/pagination/`.
  Completamente controlado (`page`/`totalPages` los posee el padre, sin
  estado interno) — puerto directo, incluida `buildPageTokens()` (algoritmo
  de truncado con elipsis) exportada tal cual. Variantes `numbered`/`simple`.
- **Toast (2026-09-10)** — `projects/comsatel-ds/src/lib/toast/`. Puramente
  visual, sin cola ni auto-cierre — confirmado que ni la propia página de
  documentación de React arma una cola real (cada demo es estático), así
  que no hay ninguna referencia real que portar para eso; encolar/apilar/
  auto-cerrar por temporizador queda 100% del lado del consumidor (ver
  accessibility-patterns.md sección 8). Variantes con tono
  (info/success/warning/error) nunca muestran botón de cerrar — decisión
  real de React que se preserva: exigen una acción directa, no permiten
  descartar sin leer.

- **Popover (2026-09-10)** — `projects/comsatel-ds/src/lib/popover/`
  (`Popover` + `computePopoverPosition` exportada aparte, función pura sin
  dependencias de Angular). Primitivo genérico de posicionamiento flotante
  — base real para Select/Spotlight/Menu. Reutiliza los patrones ya
  documentados de Modal (portal a `document.body` vía `Renderer2`, cierre
  con Escape/clic afuera, animación de entrada/salida con dos signals) —
  lo único nuevo es el algoritmo de posición: mide el panel real
  (`offsetWidth/offsetHeight`, nunca una estimación fija) y voltea al lado
  opuesto cuando no entra en el eje principal, se recalcula en
  resize/scroll mientras está abierto. 12 placements (4 lados ×
  start/center/end), `matchTriggerWidth`, `offset` configurable.
  **Verificado con interacción real:** abre/cierra con clic y Escape,
  placement "top" confirmado abriendo arriba del trigger
  (`getBoundingClientRect()` del panel vs. del trigger), `matchTriggerWidth`
  confirmado con `getComputedStyle` (280px exacto) — sin errores de consola.

- **Select (2026-09-10)** — `projects/comsatel-ds/src/lib/select/`.
  **Hallazgo real antes de construir:** el archivo `select.tsx` suelto en
  React (Base UI Select, sin border, pensado para addons) NO es lo que la
  página `/components/select` documenta — es código huérfano, ningún
  import real lo usa. La página real importa `InputSelect` desde
  `dropdown.tsx` (selección simple/múltiple con chips) — se portó ESE,
  verificado leyendo qué importa `SelectPageContent.tsx` antes de asumir
   que el archivo con el nombre obvio era el correcto. Reconstruido el
   2026-09-11: reutiliza `Popover` como primitivo real de portal y
   posicionamiento para que el listbox no quede recortado por una tarjeta o
   el cuerpo desplazable de una modal; conserva `INPUT_TOKENS` y `Badge`
   para los chips en modo `multiple`. El valor simple y múltiple se guardan
   por separado en el playground, y el estado múltiple de la documentación
   es interactivo. En modo múltiple, cada chip conserva su acción accesible
   de quitar; el limpiado total solo se ofrece para selección simple. Incluye
   navegación con flechas/Home/End/Escape, etiqueta asociada y Storybook.

- **Spotlight (2026-09-10)** — `projects/comsatel-ds/src/lib/spotlight/`.
  Mucho más simple de lo esperado por el nombre: no es un command palette,
  es un resaltado de onboarding (halo + callout junto a un elemento real,
  proyectado vía `<ng-content>`). Sin portal, sin blanket, sin focus-trap
  a propósito — la persona puede seguir usando el resto de la página. CSS
  puro (`position: absolute` dentro de un `:host` `position: relative`),
  sin GSAP ni Popover: no lo necesitaba. Reconstrucción individual cerrada
  el 2026-09-11: el diálogo no modal vincula titular y descripción con ARIA,
  anuncia en modo cortés y, si es descartable, responde a Escape; las
  recorrido usa una columna de objetivos con el callout activo a la derecha
  y permite que salga del bloque sin recorte; las posiciones se muestran en
  filas con título, contexto y separadores a todo el ancho; los lineamientos
  tienen ejemplos vivos compactos y sin recorte. Storybook cubre el caso
  base, recorrido, cierre y posición lateral.
- **DateTimeRangePicker (2026-09-10)** —
  `projects/comsatel-ds/src/lib/datetime-range-picker/`. Compone
  `cs-calendar` (selección de rango por dos clics, mismo patrón que su
  propia demo de rango) + dos `cs-input-dropdown` para una ventana horaria
  ÚNICA que aplica a todo el rango de fechas (no dos datetimes
  independientes). `generateTimeOptions`/`formatRangeDisplay` DUPLICADOS a
  propósito en su propio archivo de helpers en vez de importados de
  `datetime-picker-helpers.ts` — mismo criterio que React: mantener este
  componente sin depender del de un solo datetime evita que un cambio ahí
  rompa silenciosamente el caso de rango.

- **Menu (2026-09-10)** —
  `projects/comsatel-ds/src/lib/menu/` (`Menu` + tipos `MenuGroupData`/
  `MenuItemData`/`MenuMode`). Generalización real de la lógica que YA
  existía ad-hoc en el Shell del sitio (rail con flyout, `csPressScale`,
  grupos expandibles) — no una implementación paralela, Shell resultó ser
  un consumidor temprano no-reusable del mismo patrón. Requiere
  `@angular/router` como peer dependency nueva (agregada a
  `package.json`) porque usa `routerLink` para los ítems.
  **Corrección real sobre `accessibility-patterns.md` sección 7:** esa
  sección anticipaba navegación por teclado con flechas/Home/End/
  type-ahead para cuando se construyera Menu — al leer la referencia real
  (`menu.tsx`) se confirmó que React NUNCA lo implementó, la navegación es
  el orden de Tab nativo de los `<a>` reales. Se portó fiel a lo que
  existe (no lo que la sección 7 anticipaba); el outline queda como
  referencia si el usuario pide esa navegación explícita más adelante.
  Mismo gotcha de zoneless ya documentado: `hoveredItem`/`flyoutPos` son
  `signal()` porque `scheduleHide()` los muta dentro de un `setTimeout`.

- **Table (2026-09-10)** — `projects/comsatel-ds/src/lib/table/`
  (`Table` + tipos). Completamente controlado — igual que Pagination, nunca
  ordena `rows` por su cuenta, solo emite `(sort)`. Usa `cs-skeleton`
  (prerequisito ya construido) para el estado de carga inicial, y un
  overlay de opacidad+spinner para refetch (datos ya visibles, no
  reemplazarlos por skeleton — pierde la posición de scroll de quien mira).
  **Decisión de diseño real, no en React:** React tipa `cells:
  React.ReactNode[]` (JSX arbitrario); Angular no tiene equivalente
  directo, así que `TableCellValue` es `string | { template: TemplateRef,
  context? }` — el consumidor define un `<ng-template #cell let-x>` UNA
  vez (ej. el badge de estado) y pasa `{ template, context: { $implicit:
  valorDeEstaFila } }` por cada fila, vía `[ngTemplateOutletContext]`. Caso
  real confirmado en la referencia (no una posibilidad teórica): la
  columna de estado de la demo real de React usa un `Badge`, no texto.

- **Table tree (2026-09-10)** —
  `projects/comsatel-ds/src/lib/table-tree/`. Última pieza de la lista
  original de componentes faltantes. **Decisión real de arquitectura:**
  las filas recursivas se resuelven con UN `<ng-template #rowTpl>` que se
  referencia a sí mismo vía `*ngTemplateOutlet` (pasando `depth + 1` en
  cada nivel) — NO un sub-componente por fila, que hubiera metido un
  elemento custom entre `<tbody>`/`<tr>` y roto la estructura real de
  tabla. Mismo tipo de celda que Table (texto o `{ template, context }`).
  Soporta carga perezosa real: `TableTreeItem.children === undefined`
  dibuja una fila skeleton al expandir (vs. `children: []`, que significa
  "cargado, sin hijos") — verificado en la demo con un timeout simulando
  la resolución real.
- **Motion (2026-09-10)** — `projects/comsatel-ds/src/lib/motion/motion.ts`.
  Primitivo de animación de entrada/salida genérico (`show`, `preset`:
  fade/scale/slide-up/down/left/right, duración/easing por token) —
  equivalente a `<Motion>` en React (que envuelve Framer Motion), acá
  motorizado con GSAP como el resto de la animación de este proyecto.
  **Diferencia real de plataforma, documentada en el propio código:**
  React desmonta el contenido recién después de la salida animada gracias a
  `AnimatePresence`; en Angular el contenido proyectado por `<ng-content>`
  ya existe como vista del consumidor en cuanto `<cs-motion>` se instancia
  (Angular no puede diferir la creación de contenido proyectado desde
  adentro del hijo) — la señal `rendered` solo controla si esa vista está
  insertada en el DOM vía `@if`, mismo patrón dual-signal que ya usan
  Modal/Toast/Popover. El efecto visual final es idéntico: nada queda
  visible ni interactuable después de la salida. Sigue el mismo patrón de
  `ngOnChanges` + `setTimeout` de Modal para esperar a que `@ViewChild`
  resuelva el wrapper recién insertado antes de animarlo. `eases.ts` ganó
  `EASE_ENTER`/`EASE_EXIT`/`EASE_SPRING` (antes solo tenía `EASE_DEFAULT`,
  usado por `PressScale`) — los 4 `CustomEase` de GSAP que corresponden a
  los 4 `--motion-easing-*` de `tokens.css`.

  **Con esto se completó la lista original de componentes pendientes**
  (Popover, Radio, Select, Spotlight, Stepper, Tab, Table, Table tree,
  Toast, Accordion, DateTimeRangePicker, Pagination, Menu). Siguieron, ya cerradas: la auditoría
  completa de tokens/tamaños (ver "cuarta ronda" arriba, C13) y las
  secciones Mapa/Marcadores + Animaciones (ver "quinta ronda" arriba).

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
- **Layout (2026-09-10)** — `/foundations/layout`
  (`src/app/pages/layout/`). No fue solo documentar: portar esta página
  desde `LayoutPageContent.tsx` reveló que el Shell real de Angular
  (`src/app/layout/shell/`) todavía no implementaba lo que la página
  describe — sidebar de un solo modo (224px fijo, sin token), sin rail, sin
  drawer mobile, sin ningún token de breakpoint/layout-chrome en
  `tokens.css`. Se reconstruyó el Shell completo para que la página deje de
  documentar una aspiración y pase a documentar el comportamiento real:
  - **Tokens nuevos** en `tokens.css`: `--breakpoint-sm/md/lg/xl/2xl`
    (640/768/1024/1280/1536, mismos valores que React — mismo criterio que
    los tokens de motion: nombre y valor son la decisión real del sistema,
    no un valor copiado de React sin pasar por acá) y
    `--layout-topnav-height` (56px), `--layout-sidenav-width-expanded`
    (240px, antes 224px sin token), `--layout-sidenav-width-collapsed`
    (64px), `--layout-panel-width` (192px). Ojo: este `--layout-` es un
    prefijo distinto del `--layout-padding/gap/radius/size` de la escala
    primitiva — ambos coexisten a propósito, mismo criterio que React.
  - **`SidenavState`** (`src/app/lib/sidenav-state.ts`) — servicio
    `providedIn: 'root'` con signals (`mode`: `expanded`/`rail`/`drawer`,
    `mobileOpen`), persistencia de la preferencia del usuario en
    `localStorage`. Simplificación real respecto a React: `sidenav.ts` en
    React necesita un hack de `CustomEvent`+`window` porque TopNav y
    Sidebar son dos islas de Astro que no comparten árbol; acá Shell es un
    único árbol de componentes Angular, así que un servicio singleton con
    signals ya se comparte solo — no hace falta el evento de window.
  - **Shell reconstruido** (`shell.ts`/`.html`/`.css`) — host binding
    `[attr.data-sidenav-mode]`/`[attr.data-mobile-open]` maneja los 3 modos
    vía selectores `:host([data-sidenav-mode='rail'])` etc. Rail: solo
    íconos, flyout al hover/foco con label + hijos (mismo patrón que
    `RailItem` en `menu.tsx` de React, sin portar código, ver
    `onRailEnter`/`scheduleHide`/`cancelHide` en `shell.ts`). Drawer: fuera
    de pantalla por defecto (`transform: translateX(-100%)`), entra como
    overlay con backdrop, botón de menú en el topnav (solo existe en modo
    drawer). Botón de colapsar/expandir al pie del sidebar (ausente en
    drawer). `TableOfContents` (`table-of-contents.css`) se tokenizó
    también: `192px`→`var(--layout-panel-width)`,
    `56px`→`var(--layout-topnav-height)`.
  - **Verificado con interacción real** en los 3 viewports
    (`resize_window`: desktop/900px-tablet/mobile): rail muestra
    solo-íconos + flyout funcional con hijos y estado pending correcto;
    drawer abre/cierra con el botón y con clic en el backdrop
    (`data-mobile-open` + `getComputedStyle().transform` confirmados antes
    y después); sin errores de consola en ningún tamaño.
  - **Pendiente, explícitamente fuera de esta pasada:** un `AppLayout`
    reusable y exportado desde `comsatel-ds` para que un PRODUCTO real (no
    el propio sitio del design system) lo consuma. Decisión del usuario
    (2026-09-10): "al final ejecutarás ambos, solo uno primero y después el
    otro" — el Shell del sitio se resolvió primero; el componente
    reusable de producto es la siguiente tarea, no una decisión abierta.

## Mapa y Animaciones — páginas de documentación (2026-09-10)

- **`/animations/tokens`** — muestra los 5 `--motion-duration-*` y 4
  `--motion-easing-*` que ya existían en `tokens.css` sin cambios; cada fila
  es un bloque local (`DurationRow`/`EasingRow`, no exportados desde
  `comsatel-ds`) que anima con GSAP al hacer clic en "Repetir".
- **`/animations/motion`** — Playground + galería de los 6 presets +
  lineamientos + tabla de props del componente `Motion` (ver su entrada en
  "Componentes de librería").
- **`/map/theme`** — documenta por qué el tema del mapa es independiente
  del tema de la app (los tiles son imágenes de un proveedor externo, no
  hay token que los repinte), los dos proveedores reales (CartoDB
  Voyager/Stadia Alidade Smooth Dark, ambos hoy sin API key configurada en
  C-Locater — mismo hallazgo que documenta React, no es un problema nuevo
  de Angular) y los colores de categoría GPS. **Nuevos tokens en
  `tokens.css`** (bloque "Map", una copia por tema claro/oscuro, igual que
  "Status indicators"): `--color-map-gps-flotas/basico/contingencia/svr-x`
  (alias de `--color-accent-blue/teal/purple/orange`),
  `--color-map-status-reporting/no-signal/low-signal/disconnected` (alias
  de `--color-status-online/busy/warning/offline`),
  `--color-map-vehicle-active/stopped/offline` (alias de
  `--color-status-online/busy/offline`, sin el tier de warning — así lo
  documenta React también), `--color-map-alarm` (alias de
  `--color-background-danger-default`). **Token nuevo real, no solo un
  alias de Mapa:** `--color-status-warning`, agregado al bloque "Status
  indicators" existente (antes solo tenía online/busy/offline) — se ató a
  `--color-background-warning-default`, que ya existía en `tokens.css` con
  el mismo valor que React documenta para ese tier (coincidencia de
  arquitectura de tokens, no un valor copiado — ver B2).
  **`LiveMapPreview`** (`src/app/pages/map-theme-demo/live-map-preview.ts`)
  es un componente Angular local a esta página (no exportado desde
  `comsatel-ds`, igual que en React) que usa el paquete `leaflet` (core,
  API vanilla) directo — ver el racionamiento de por qué esta librería en
  la entrada de "quinta ronda" al inicio del archivo.
- **`/map/markers`** — documentación pura de los mockups de marcador
  (`VehiclePill`, `GpsCompact`, `GpsFull`, `ClusterBadge`, todos locales a
  `src/app/pages/markers-demo/`, no exportados desde `comsatel-ds`): Leaflet
  pinta los pines reales con `divIcon`/HTML plano en C-Locater, fuera de
  este repo, igual que documenta React. **Excepciones B1 explícitas**
  (valores que no coinciden con ningún paso de la escala tipográfica):
  `.cluster-badge__count--unit` a 17px y `.cluster-badge__unit` a 7px — ni
  10 (2xs) ni ningún otro primitivo calza. El resto de la tipografía de
  estos mockups sí sale de tokens reales (`--font-size-label-small/micro` +
  su `line-height` correspondiente, sin repetir el bug C13).

## Pendientes — pedidos ahora, siguientes en construirse

Ninguno. La lista completa pedida por el usuario el 2026-09-10 (componentes
faltantes → auditoría de tokens/tamaños → Mapa/Marcadores + Animaciones)
está cerrada — ver la entrada "quinta ronda" al inicio del archivo. El
siguiente trabajo sobre este proyecto parte de un pedido nuevo del usuario,
no de este backlog.

## Sin tocar todavía — ni auditados ni construidos en Angular

Todos los componentes que React tiene listos para portar ya se portaron:
Popover, Select, Spotlight, DateTimeRangePicker, Menu, Table, Table tree,
Skeleton, Accordion, Radio, Tab, Pagination, Toast, Modal — ver cada uno en
"Componentes de librería" arriba. Si el próximo pedido es un componente
nuevo, revisar primero si React ya lo resolvió (mismo criterio de siempre:
estructura/comportamiento de React, valores de acá) y, si coordina hijos
compuestos, seguir el mecanismo `@ContentChildren` ya establecido en
Accordion/Radio — no `inject()` del padre desde el hijo.

**Corrección real (2026-09-10):** Header y List item NO están listos para
portar — se revisó `nav.ts` de React directo y ambos están marcados
`pending: true` ahí también (dead links, React nunca los construyó). Van al
mismo grupo que Logos/Grids abajo: no construir sin que el usuario lo pida
explícitamente con un diseño propio, porque acá no hay ninguna referencia
real que portar.

**No existen ni en React** (dead links en su propio `nav.ts`, no construir
sin que el usuario lo pida explícitamente): Logos, Grids, Header y List item.
`Tag` y `Progress indicator` fueron solicitados explícitamente y ahora quedan
construidos en Angular como componentes nuevos, con sus decisiones de diseño
registradas arriba; no se presentan como ports directos desde React.

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

**Radio (referencia funcional histórica)** — `Radio` individual + `RadioGroup` con `options` (declarativo) o
`children` (layout avanzado,
ej. radios en una tabla). Trae `label`/`required`/`helperText`/`errorText`/
`invalid` nativos, mismo patrón que Input/DateTimePicker. Angular ya cerró
esta implementación en `projects/comsatel-ds/src/lib/radio/`; esta nota
conserva la estructura de React para futuras comprobaciones de paridad, pero
las decisiones de tokens, ARIA y composición válidas son las de la fila
Radio + RadioGroup del registro de auditorías.

## Decisiones de diseño ya tomadas (no reabrir sin que el usuario lo pida)

- Tipografía: Manrope para heading, Public Sans para content — **ya no es
  divergencia, es la decisión compartida por ambas plataformas.** Public
  Sans nació como excepción solo de Angular (2026-09-06); el usuario
  revirtió esa separación el 2026-09-07 y llevó Public Sans también al
  sistema React (`typography.mjs`, `globals.css`, `translations/
  typography.ts`), para que Angular y React usen exactamente la misma
  tipografía. Ver `token-architecture.md`.
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
- Logos, Grids y List item no se construyen sin una solicitud explícita:
  siguen siendo dead links en React. Header fue solicitado y reconstruido
  como patrón compuesto configurable. `Tag` y `Progress indicator`
  ya no pertenecen a esta excepción porque fueron solicitados y reconstruidos
  como extensiones controladas del sistema.
- **Storybook (`.stories.ts`) nunca estrena un patrón nuevo** — se escribe
  o actualiza SOLO después de que ese patrón ya está construido y
  verificado en `src/app/pages/*-demo/` (o en React si Angular no lo tiene
  aún). Ver B11 en `SKILL.md` y `references/storybook-pattern.md`. Todos
  los componentes de librería ya tienen su `.stories.ts` (2026-09-07) —
  cualquier patrón NUEVO en un componente existente necesita construirse
  primero en su página `*-demo`, y recién después reflejarse en el story.

## Registro de auditorías y mejoras verificadas

Cada fila requiere evidencia concreta; no se infiere una auditoría individual
solo porque exista una ronda global histórica.

| Componente | Alcance cerrado | Verificación ejecutada | Estado |
|---|---|---|---|
| Button | C1: bordes y anillo de foco atados a tokens; paridad de lineamientos; `aria-label` para botón solo-ícono y nombre de respaldo durante loading; documentación de semántica, teclado y estados. | Build de librería, app local con árbol de accesibilidad + Tab, build de Storybook; rutas Button, Badge y Avatar con sección de accesibilidad. | Cerrado — 2026-09-10 |
| Badge | C1: borde base atado a `--layout-border-thin`; paridad de variantes, tamaños, íconos y lineamientos de uso; documentación de etiqueta informativa, significado textual e interacción. | Build de librería y rutas Button, Badge y Avatar con sección de accesibilidad. | Cerrado — 2026-09-10 |
| Tag | C1-C3/C13: severidades, escala y line-height se delegan a `cs-badge`; C7-C8: ícono del registro curado y composición del primitivo Badge sin CSS visual duplicado; C9: no interactivo, sin foco por defecto; C12: el texto permanece visible junto al color; B15.2: lineamientos en dos columnas. API con `value`, `severity`, `size`, `rounded`, `icon`, `aria-label` y `aria-live`. | Build de librería y app, reinicio del servidor, ruta `/components/tag`, árbol de accesibilidad, cambio real de severidad, switch de redondeado (`role=switch`, `aria-checked`), revisión visual de Playground/severidades/tamaños/íconos y consola sin errores. | Cerrado — 2026-09-10 |
| Progress indicator | C1-C3/C13: nodos, conectores y etiquetas usan tokens de layout y tipografía con line-height; C7-C8: ícono `check` del registro curado y composición autónoma; C9-C10: recorrido horizontal/vertical con líneas limitadas entre centros en horizontal y conectores visibles en vertical; C11-C12: estados `done`/`active`/`pending` se comunican con texto y `aria-current`; B15.2: lineamientos en dos columnas. API con `steps`, `orientation`, `interactive`, `ariaLabel` y `stepClick`; `interactive` convierte nodos en botones nombrados. | Build de librería y app, reinicio del servidor, ruta `/components/progress-indicator`, árbol de accesibilidad (`list`/`listitem`, `aria-current`), controles con etiquetas en español y valores técnicos internos, cambio real del switch `Interactivo`, click real de paso en Playground y sección interactiva, revisión visual horizontal/vertical, consola sin errores y build de Storybook con Default/Vertical/Interactive. | Cerrado — 2026-09-11 |
| Stepper | C1-C3/C13: dimensiones, conectores y textos usan tokens de layout y tipografía con line-height; C7: `check` procede del registro curado; C9-C10: los conectores horizontales llegan exactamente al centro de los nodos y la variante vertical los conserva; C11: punto interior par dentro del nodo de 20 px; C12: estado se comunica por texto, marca/punto y `aria-current`; B15.2: lineamientos en dos columnas. La referencia funcional de PrimeNG confirma que los paneles pertenecen a un wizard; se excluyen deliberadamente porque Stepper es un estado de progreso. API con `steps`, `orientation`, `interactive`, `ariaLabel` y `stepClick`. | `npm run build`, reinicio de servidor y ruta `/components/stepper`; árbol de accesibilidad con `list`/`listitem` y botones nombrados en modo interactivo; selección real de orientación vertical, click de «En tránsito» que actualiza el estado y la región `status`; revisión visual clara y oscura, horizontal/vertical, conectores y lineamientos; build de Storybook con Default/Vertical/Interactive. | Cerrado — 2026-09-11 |
| Accordion | C1-C3/C13: superficie, separación y contenido con tokens y line-height; C4: coordinación reactiva por `@ContentChildren` y signals; C7-C8: `cs-icon` curado y `cs-badge` compartido para estados Activo/Detenido/Sin señal; C9-C10: panel expandido/colapsado con animación de altura y chevron; C11-C12: foco, disabled y estados conservan semántica. Encabezado/panel enlazados con ids únicos mediante `aria-controls`/`aria-labelledby`; región con `aria-hidden` e `inert`, navegación single/multiple y flechas/Inicio/Fin entre encabezados habilitados. La documentación limita solo el ejemplo de flota a un ancho de lectura y conserva lineamientos en pares. | Build de librería y app, reinicio del servidor, ruta `/components/accordion`, árbol ARIA con IDs y regiones, click real del segundo ítem que cierra el primero en `single`, Flecha abajo y Espacio sobre el segundo encabezado, revisión visual de ancho y badges con ícono+texto centrados; build de Storybook con Default/Multiple/DisabledItem. | Cerrado — 2026-09-11 |
| Tabs | C1-C3/C13: variantes line/pill, geometría y tipografía con line-height; C4: estado activo con signals; C8: compound component `Tabs` + `Tab`; C9-C10: paneles sincronizados y IDs únicos por instancia; C11-C12: selección, disabled y foco conservan semántica. `role=tablist`, tabs y paneles enlazados con `aria-controls`/`aria-labelledby`, roving tabindex y navegación Arrow/Home/End. | Build de librería y app, reinicio del servidor, ruta `/components/tab`, árbol ARIA, click y navegación real con ArrowRight (Overview → Specs), foco restaurado en el tab activo, paneles asociados y consola sin errores; build de Storybook con Default/Pill/Disabled. | Cerrado — 2026-09-10 |
| Pagination | C1-C3/C13: tamaños, estados, botones y line-height con tokens; C7-C8: íconos curados y directiva compartida; C9-C10: truncado, saltos de límite y variantes numbered/simple; C11-C12: página activa, disabled y estado anunciado. Landmark `nav` con `navLabel`, `aria-current="page"`, nombres por acción y región `role=status`; lineamientos y accesibilidad en dos columnas. | Build de librería y app, reinicio del servidor, ruta `/components/pagination`, árbol ARIA, click real en Página 2 que actualiza `aria-current` y «Página 2 de 10», revisión visual de truncado/variantes, consola sin errores y build de Storybook con Numbered/Simple/LargeSet. | Cerrado — 2026-09-10 |
| Avatar | C1: diámetros y solapamientos atados a tokens; C3: escala tipográfica; C7: íconos curados; C10: grupo sin caja de línea extra ni recorte de iniciales; la variante de iniciales usa 6px para conservar densidad sin ocultar letras; indicador con borde fino en xs/sm y grueso desde md para conservar superficie visible; estado expuesto a lectores de pantalla; `alt` nombra foto, iniciales y placeholder; company usa un borde fino de 1px alrededor de `companyIconSrc` y el fallback adapta el ícono al área interior sin recorte; lineamientos en pares y documentación de accesibilidad. | Build de librería, ruta local `/components/avatar`, cambios reales de Playground, árbol de accesibilidad, mediciones de geometría y revisión visual. | Cerrado — 2026-09-10 |
| Checkbox | C1: anillo de foco atado a `--layout-border-thick` y excepciones de 10px/1px/1.5px justificadas; C2-C3: texto escala por tamaño y rol; C7-C8: glyph compartido; C9: input nativo, etiqueta o `aria-label`; C10: geometría de check y estado mixto revisada; C11: lineamientos en pares; C12: check y guion usan `--color-text-inverse`. | Build de librería, reinicio de app, ruta local `/components/checkbox`, revisión visual, interacción por clic/Espacio y conteo de 24/24 nombres accesibles. | Cerrado — 2026-09-10 |
| Toggle | C1: anillo de foco atado a `--layout-border-thick` y excepciones de 10px/1px justificadas; C2-C3: etiqueta y descripción escalan por tamaño; C6: sombra de thumb usa token; C10-C11: track/thumb centrados por paridad; C12: thumb usa `--color-text-inverse`; switch nativo, etiqueta o `aria-label` y lineamientos en pares. | Build de librería, reinicio de app, ruta local `/components/toggle`, revisión visual, interacción por clic/Espacio y conteo de 18/18 nombres accesibles. | Cerrado — 2026-09-10 |
| Tooltip | C1: separación y flecha atadas a tokens; excepción explícita de 400ms para el retardo de puntero y 20rem para límite de lectura; C2: `label/small`; C5-C6: z-index y sombra semánticos; C9: popup no recortado en DemoShell; accesibilidad con `aria-describedby`, foco inmediato, Escape y botones de ícono con nombre propio; lineamientos en pares y documentación. | Build de librería, reinicio de app, ruta local `/components/tooltip`, árbol de accesibilidad, relación ARIA, apertura por foco, Escape y revisión visual. | Cerrado — 2026-09-10 |
| Toast | C1: borde, espaciado y anillo de foco atados a tokens; la caja del ícono es flex con `line-height: 0`, evitando espacio basal y manteniendo simetría vertical en el Toast de solo título; C2-C3/C13: título y descripción conservan pares tipográficos completos; C4: resultados y visibilidad del Playground usan `signal()`; C7: íconos y encabezados de lineamientos usan el registro curado; C9-C10: acciones y cierre son controles nativos dentro de un toast de geometría estable; C11-C12: las variantes se comunican por título, ícono y color. El host anuncia con `role="status"`, `aria-live="polite"` y `aria-atomic="true"`; el cierre tiene nombre configurable y foco visible. La página documenta accesibilidad, lineamientos en pares y ejemplos vivos de acción/cierre, con resultado debajo del componente. | `npm run build:lib`, reinicio de servidor y ruta `/components/toast`; click real en «Reintentar» actualiza el resultado debajo del Toast, «Descartar» retira el toast del Playground, atributos ARIA leídos del DOM, medición posterior de Toast sin descripción (título 13/13 px e ícono 14/13 px respecto al contenedor), y consola sin errores; `npm run build-storybook` completó con historias Default/SuccessWithAction/Warning. | Cerrado — 2026-09-11 |
| Popover | C1: superficie, borde, sombra, z-index y geometría usan tokens; el offset de 8 px es una excepción documentada para separar trigger y panel. C4: apertura/cierre/posición usan `signal()` y se cancelan timers pendientes; C5-C6: portal a `document.body`, z-index de dropdown y sombra semántica; C7: íconos de lineamientos consumen el registro curado; C9-C10: mide el panel real, reubica con scroll/resize y cambia de lado ante colisión; C11-C12: estado abierto expuesto en el trigger. El panel tiene id y nombre accesible; `aria-expanded`, `aria-controls` y `aria-haspopup` se aplican al botón nativo real incluso dentro de `cs-button`; Escape devuelve el foco. Documentación de accesibilidad, lineamientos en pares con overlays reales y Storybook. | `npm run build:lib`, reinicio de servidor y ruta `/components/popover`; apertura real, ARIA `expanded/controls/haspopup` enlazado con el id del panel, Escape con cierre + foco en el botón nativo, selector `matchTriggerWidth` con selección real, lineamiento con portal fuera de la tarjeta sin recorte y consola sin errores; `npm run build-storybook` completó con Default/RightEnd/MatchTriggerWidth. | Cerrado — 2026-09-11 |
| Input + InputGroup | C1: escala de alturas, bordes y anillos atados a tokens; tablas de accesibilidad de dos columnas alineadas con `content/note` y su `line-height`; excepción explícita de 2px para el inset exterior del addon `compact`, además de las excepciones de 10px/14px del inset horizontal sin paso equivalente; C2-C3: sm/md/lg mantienen el par font-size/line-height; C8: InputGroup compone piezas existentes; C10: campos y addons medidos en la misma altura; C13: reglas tipográficas completas. API nativa con `id`, `name`, `required`, `autocomplete`, límites y atributos ARIA; grupos con foco/invalidez vía `:has()`; addon `compact` para acciones y `divider` para distinguir selectores integrados; accesibilidad, lineamientos en pares y ejemplos en inglés; recomendación de contraseña con estado signal e interacción real. | Build de librería y app, reinicio de servidor, build de Storybook, ruta local `/components/input`, árbol de accesibilidad, alturas 28/32/40, foco del grupo, foco por addon, apertura de selector embebido con portal, selección por clic y teclado, opciones textuales de país junto a bandera decorativa, selector de moneda compacto, medición del botón Copy a 2px del borde, toggle de contraseña en Playground y recomendación (password → text → password), y medición de tabla de accesibilidad a 12/18px. | Cerrado — 2026-09-11 |
| Dropdown + InputDropdown | C1-C3: escala xs/sm/md/lg y tipografía con line-height; C4: estado zoneless con `signal()` y foco posterior a render; C5-C6: z-index/sombra del menú; C7: check compartido vía `cs-icon`; C8: glyphs de selección compartidos; C9: listbox limitado a 9 opciones y portado con `Popover`, sin recorte; C10: triggers y opciones simétricos, con representación compacta independiente de la etiqueta del menú; C11: glyphs centrados; C12: estados semánticos. Para código telefónico, la bandera es decorativa y cada opción conserva el país y código como texto. API accesible con trigger nombrado, `role="menu"`, `menuitem*`, `role="combobox"`/`listbox`, asociación label/id, required/invalid/describedby, `name` para formulario, navegación Arrow/Home/End/Escape y lineamientos en pares. | Build de librería y app, build de Storybook, reinicio de servidor, ruta local `/components/dropdown` y `/components/input`, árbol de accesibilidad, alturas 24/28/32/40, trigger de ícono nombrado, foco inicial con ArrowDown, selección con clic, combobox/listbox mediante portal y revisión de asociaciones ARIA; menús de acciones y listbox de lineamientos abiertos sin recorte dentro de su tarjeta. | Cerrado — 2026-09-11 |
| Radio + RadioGroup | C1: gap de 10px y separación label/description de 1px documentados como huecos ópticos; C2-C3/C13: label y descripción escalan por tamaño con line-height correspondiente; C4: `id`/`name` se resuelven después de aplicar inputs y el grupo sincroniza estado con `signal()`; C7: íconos de documentación usan el registro curado; C8/C11: anillo y punto consumen glyph compartido con Dropdown y mantienen paridad de centrado; C9: input radio nativo, label visible o `aria-label`, flechas/Espacio y estados disabled; C12: estados required/invalid/error conservan semántica además del color. Grupo con `role="radiogroup"`, `aria-labelledby`, `aria-describedby`, `aria-errormessage`, `aria-required` y `aria-invalid`; documentación de accesibilidad, lineamientos en dos columnas y API de ambos componentes. | Build de librería y app, build de Storybook, reinicio del servidor, ruta local `/components/radio`, árbol de accesibilidad, clic + flecha abajo (Rojo → Azul), radios disabled, error enlazado y revisión visual de centrado en sm/md/lg. | Cerrado — 2026-09-10 |
| Calendar | C1: bordes y foco atados a tokens; C4: navegación reactiva y estado inicial; C7: nombres de mes/día en español; C9-C10: grilla de seis semanas y geometría estable; C11-C12: estados de fecha seleccionada, actual, deshabilitada y rango; C13: tipografía con line-height. Grilla ARIA con nombres completos de fecha, estados anunciables y foco roving con flechas, Home/End, PageUp/PageDown, Enter/Space. Documentación de accesibilidad y lineamientos en pares. | Build de librería y app, reinicio de servidor, ruta `/components/calendar`, árbol de accesibilidad, foco roving, navegación PageDown con foco restaurado, mes siguiente/anterior, fechas deshabilitadas y selección de rango verificados. | Cerrado — 2026-09-10 |
| DateTimePicker | C1: popover, foco y mensajes usan tokens; C4: signals inicializadas en `ngOnInit`; C9-C10: calendario en overlay `max-content` con espacio reservado y campos simétricos; C13: mensajes tipográficos completos. Campo de fecha con `aria-haspopup`, `aria-expanded`, `aria-controls`, ayuda/error mediante `aria-describedby`, calendario accesible, limpieza alcanzable por teclado y retorno de foco. Documentación de accesibilidad y lineamientos. | Build de librería y app, reinicio de servidor, ruta `/components/datetime-picker`, apertura real del calendario, selección de fecha con cierre y foco restaurado, valor ISO inicial, ayuda/error enlazados, botón de limpiar y secciones de accesibilidad/lineamientos verificadas. | Cerrado — 2026-09-10 |
| DateTimeRangePicker | C1: borde, separación y foco atados a tokens; C4: id estable y estado inicial; C9-C10: overlay de rango con espacio reservado, campos de hora medidos y labels alineados con spacer simétrico; C13: mensajes tipográficos completos. Trigger de rango etiquetado, horas de inicio/fin con nombres independientes, `aria-describedby`, Escape, selección en dos pasos, limpieza alcanzable y documentación de accesibilidad/lineamientos. | Build de librería y reinicio de servidor, ruta `/components/datetime-range-picker`, ids y labels asociados, medición previa y posterior de Requerido/Deshabilitado (fecha y horas a la misma coordenada vertical), selección real 10–18 sep 2026, cierre con foco restaurado, horas nombradas, overlay visible y secciones de accesibilidad/lineamientos verificadas. | Cerrado — 2026-09-10 |
| Banner | C1: bordes, padding y foco atados a tokens; C2-C3/C13: título, cuerpo y acción mantienen `content/ui` (13/19.5px), igual que Card Banner; la jerarquía se conserva por peso y color. El reinicio de ejemplos usa `content/note` (12/18px) y padding compacto; C7: íconos curados por variante; C9: acción y cierre quedan dentro del contenedor sin recorte; C12: estados semánticos conservan texto además de color. API con acción y cierre nombrados, secciones de accesibilidad y lineamientos en pares de dos columnas, ejemplos con acción/cierre verificables y `aria-live` en los resultados. | `npm run build:lib`, reinicio de servidor y ruta `/components/banner`; estructura de texto, acciones y cierres confirmada en el árbol de accesibilidad. | Cerrado — 2026-09-11 |
| Card (todas sus piezas) | C1: bordes de Action/CardBanner/Preview/Spotlight atados a `--layout-border-thin`; C7-C8: composición con AvatarGroup, Badge, Button, Toggle e Icon; C10: contenido y controles se mantienen dentro de la tarjeta; C12-C13: variantes y textos conservan contraste y line-height. Action card expone `buttonClick`/`toggleCheckedChange`, Toggle usa el título como nombre accesible y Preview button usa «Más opciones»; documentación de accesibilidad y lineamientos en pares de dos columnas con toggle real. | Build de librería y app, reinicio de servidor, ruta `/components/card`, árbol de accesibilidad, toggle de recomendación (estado y `aria-label`), botones de opciones nombrados, seis pares de lineamientos y revisión visual de la grilla de dos columnas. | Cerrado — 2026-09-10 |
| Modal | C1: overlay, superficie, sombra, bordes y foco atados a tokens; C2-C3/C13: título `content/highlight` (18/27px), cuerpo `content/ui` (13/19.5px) y acciones `Button sm` conservan jerarquía; C4: portal, signals y transición; C9-C10: panel con scroll de body/viewport sin recorte; C12: apariencia warning/danger sincroniza título y acción principal. Motor con `role="dialog"`, `aria-modal`, `aria-labelledby`, foco inicial configurable, trampa de foco, Escape, cierre por overlay, restauración de foco y scroll lock; `closeLabel` configurable; accesibilidad y lineamientos en pares de dos columnas con modales reales, estados anunciables y registro de íconos compartido. | Build de librería y app, build de Storybook con historias Default/Warning/Danger/WithoutCloseButton/LongContent, ruta local `/components/modal`, árbol ARIA, apertura real, foco visible, Escape, cierre y restauración, acciones de footer, overlay y revisión visual tipográfica. | Cerrado — 2026-09-10 |
| Table + TableTree | C4: el buscador del playground compone `InputGroup` con addon de ícono en vez de intentar atravesar la encapsulación de `cs-input`; C8: el ejemplo de lineamientos reutiliza `cs-skeleton`; Table conserva tabla nativa, carga anunciable y filas skeleton, mientras TableTree mantiene carga perezosa con `children === undefined`. | Build de librería y app; servidor reiniciado; ruta `/components/table` con búsqueda, carga inicial y shimmer visibles; ruta `/components/table-tree` con expansión perezosa visible y resolución posterior de sus hijos. | Cerrado — 2026-09-10 |
| Skeleton | C4: el host vacío se estiliza con `:host`, no con un selector interno que Emulated no puede aplicar; usa gradiente `base`/`shimmer`, animación ambiente explícita de 1.6s y alternativa estática para `prefers-reduced-motion`. | Build de librería y app; verificación visual de las cinco filas de Table y de la fila perezosa de TableTree. | Cerrado — 2026-09-10 |
| Patrón de lineamientos | `guide-grid` y `guidelines-grid` fijados a dos columnas: Recomendado a la izquierda y Evita a la derecha; cada tarjeta conserva su demo vivo dentro del cuerpo. | Recarga correcta del servidor Angular y rutas Button, Card, Banner y Modal actualizadas; acciones, toggles, cierres y modales interactivos comprobados. | Cerrado — 2026-09-10 |

- **FleetUnitList (2026-09-11)** — `projects/comsatel-ds/src/lib/fleet-unit-list/`.
  Organismo de telemetría que compone Accordion, Badge, Icon y Button: identidad,
  estado con texto e ícono, frescura de señal, telemetría semántica mediante
  `dl`, alerta opcional y evento `detailClick`. Se verificaron el panel
  expandido y la acción de detalle en la página de Accordion; queda pendiente
  una página de documentación propia para cerrar su auditoría independiente.

## Matriz de evaluación por componente

Esta es la lista operativa para las siguientes pasadas. “Auditoría global”
significa que la cuarta ronda revisó el conjunto, pero todavía no hay una ficha
con hallazgos y evidencia por componente; no debe confundirse con un cierre
individual trazable.

| Prioridad | Componente o familia | Estado de evaluación | Siguiente alcance |
|---|---|---|---|
| Cerrado | Button | Ficha individual completa. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Badge | Ficha individual completa. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Tag | Componente nuevo solicitado: API semántica, composición con Badge, accesibilidad, Storybook y lineamientos verificados. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Progress indicator | Componente nuevo solicitado: recorrido por etapas, estados, orientaciones, líneas de conexión horizontales/verticales, interacción opcional, accesibilidad, Storybook y lineamientos verificados. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Stepper | Indicador de progreso de secuencia fija, con orientación, interacción opcional, accesibilidad, Storybook y lineamientos verificados. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Accordion | Ficha individual completa: compound component, coordinación single/multiple, animación, ARIA, foco, disabled, Storybook y lineamientos verificados. | Ninguno; reabrir solo ante cambio. |
| P1 | FleetUnitList | Organismo nuevo de telemetría; la composición y acción se verificaron dentro de Accordion. | Página propia: accesibilidad, API, lineamientos y matriz de estados. |
| Cerrado | Tabs | Ficha individual completa: paneles ARIA, selección, disabled, foco, teclado Arrow/Home/End, Storybook y lineamientos verificados. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Pagination | Ficha individual completa: variantes, truncado, saltos, estados disabled, landmark, anuncios, Storybook y lineamientos verificados. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Avatar | Ficha individual completa. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Checkbox | Ficha individual completa. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Toggle | Ficha individual completa. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Tooltip | Ficha individual completa. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Input + InputGroup | Ficha individual completa. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Dropdown + InputDropdown | Ficha individual completa. | Ninguno; reabrir solo ante cambio. |
| Cerrado | AppLayout + navegación | Ficha individual completa. | Ninguno; reabrir solo ante cambio. |
| P1 | Motion | Construido, sin auditoría C1-C13 individual de la última ronda. | Tokens de animación, signals y documentación. |
| P1 | Tema de mapa | Construido, sin auditoría C1-C13 individual de la última ronda. | Tokens de mapa, contraste y proveedor de tiles. |
| P1 | Marcadores | Construido, sin auditoría C1-C13 individual de la última ronda. | Tokens, estados y accesibilidad de tarjetas/markers. |
| Cerrado | Toast | Reconstrucción individual: anuncio accesible, acciones y cierre verificables, lineamientos en pares, documentación de accesibilidad y Storybook. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Popover | Reconstrucción individual: portal, posicionamiento por colisión, vínculo ARIA trigger/panel, Escape con retorno de foco, lineamientos interactivos y Storybook. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Spotlight | Reconstrucción individual: diálogo no modal, relaciones ARIA, Escape opcional, posiciones sin colisión, lineamientos interactivos, accesibilidad y Storybook verificados. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Select | Reconstrucción individual: selección múltiple controlada, listbox portado, teclado, etiqueta asociada, lineamientos interactivos y Storybook. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Menu | Reconstrucción y verificación individual completadas; se sincronizó la matriz. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Table + TableTree | Ficha individual completa. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Skeleton | Ficha individual completa. | Ninguno; reabrir solo ante cambio. |
| Cerrado | PressScale | Ficha individual: puntero y teclado, movimiento reducido, limpieza de tweens, documentación, accesibilidad y lineamientos verificables. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Banner | Ficha individual completa. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Calendar | Ficha individual completa. | Ninguno; reabrir solo ante cambio. |
| Cerrado | DateTimePicker | Ficha individual completa. | Ninguno; reabrir solo ante cambio. |
| Cerrado | DateTimeRangePicker | Ficha individual completa. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Card (todas sus piezas) | Ficha individual completa. | Ninguno; reabrir solo ante cambio. |
| Cerrado | Modal | Ficha individual completa. | Ninguno; reabrir solo ante cambio. |

## Cómo actualizar este archivo

Al terminar una auditoría o reconstrucción de un componente/fundamento
existente, moverlo a la sección que corresponda. Al construir un componente
que no existía antes en Angular, agregarlo a "Componentes de librería" con
cualquier decisión de diseño nueva que otras auditorías futuras deban
respetar. Si se porta Radio, mover su nota de "Referencia funcional" a la
entrada real del componente construido, no borrarla — sigue siendo útil
para futuras correcciones.
