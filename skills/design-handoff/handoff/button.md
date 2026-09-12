# Button

> Handoff para desarrollo · 2026-07-26 · v1
> Figma: Untitled · Node `24:2657`
> Doc en Figma: `Handoff` > `Documentación — Button` (`26:1831`)

## Resumen

Botón con tres variantes visuales (Primary, Secondary, Ghost) y seis estados. Sigue el
layout básico de Figma: Auto Layout horizontal con padding, radio completo y texto
centrado.

| | |
|---|---|
| Tipo | Atom |
| Interactivo | Sí |
| Variantes | 3 (`Primary`, `Secondary`, `Ghost`) |
| Estados | 6 de 6 requeridos |
| Node | `24:2657` |

---

## Anatomía

> El componente se muestra dentro de un contenedor centrado (ver D15).
> Contenedor: `800 × 180` — componente centrado a `( (800 - w)/2, 62 )`.

| # | Capa | Tipo | Rol | Requerido |
|---|---|---|---|---|
| Ⓐ | Container | Frame | Envuelve el botón (fondo, borde, radio) | Sí |
| Ⓑ | Label | Text | Texto de la acción | Sí |

---

## Layout

| Propiedad | Valor | Origen |
|---|---|---|
| Dirección | Horizontal | Extraído |
| Gap | `8px` | Extraído |
| Padding | `12px 24px` | Extraído |
| Alineación | center / center | Extraído |
| Ancho | hug contents | Extraído |
| Alto | hug contents | Extraído |

```css
display: inline-flex;
flex-direction: row;
align-items: center;
justify-content: center;
gap: 8px;
padding: 12px 24px;
width: fit-content;
```

### Comportamiento de dimensionamiento

| Variante | Ancho | Alto |
|---|---|---|
| Primary | hug (`155px`) | hug (`41px`) |
| Secondary | hug (`172px`) | hug (`41px`) |
| Ghost | hug (`136px`) | hug (`41px`) |

El alto varía por el padding + la altura del texto (17px Inter Medium 14px +
line-height auto). Si no hay gap, el layout colapsa — porque el `itemSpacing` no es la
causa del alto.

---

## Estilo

### Tipografía del Label

| Propiedad | Valor | Origen |
|---|---|---|
| Familia | Inter | Extraído |
| Peso | Medium | Extraído |
| Tamaño | `14px` | Extraído |
| Interlineado | auto | Extraído |
| Espaciado | `0%` | Extraído |
| Color | varía por variante | Extraído |
| Alineación | left | Extraído |
| Overflow | WIDTH_AND_HEIGHT — el botón crece con el texto | Extraído |

---

## Variantes

Lo que el desarrollador elige al instanciar.

### `variant`

| Valor | Fondo | Borde | Label | Radio | Token |
|---|---|---|---|---|---|
| `Primary` | `#1257cc` | ninguno | `#ffffff` | `24px` | `—` |
| `Secondary` | transparente | `1.5px #e8e6e3` | `#1a1814` | `24px` | `—` |
| `Ghost` | transparente | ninguno | `#0f49a8` | `24px` | `—` |

Las tres variantes comparten `hug/hug`, padding `12/24`, gap `8`, radius `24`,
Inter Medium 14px.

---

## Estados

Deltas sobre `default`. Solo lo que cambia.

| Estado | `Primary` | `Secondary` | `Ghost` |
|---|---|---|---|
| `default` | Fondo `#1257cc`, label `#ffffff` | Borde `#e8e6e3`, label `#1a1814` | label `#0f49a8` |
| `hover` | Fondo `#0e3d99` | Fondo `#f5f5f4` | Fondo `#eef4fe` |
| `focus` | Fondo `#0e3d99` | Fondo `#f5f5f4`, borde `#0e3d99` `2px` | Fondo `#eef4fe`, borde `#0e3d99` `2px` |
| `active` | Fondo `#0a2d73` | Fondo `#e8e6e3`, borde `#1257cc` | Fondo `#d4d1cc` |
| `disabled` | Fondo `#eef4fe`, label `#d4d1cc` | Borde `#d4d1cc`, label `#d4d1cc` | label `#d4d1cc` |
| `loading` | Fondo `#1257cc` al 60%, label `#ffffff` | — | — |

### Cobertura

| Estado | En Figma | Requerido | Resultado |
|---|---|---|---|
| default | Sí (3) | Sí | OK |
| hover | Sí (3) | Sí | OK |
| focus | Sí (3) | Sí | OK |
| active | Sí (3) | Sí | OK |
| disabled | Sí (3) | Sí | OK |
| loading | Sí (solo Primary) | Sí | OK |

Cobertura: **6/6**

### Excepciones

| Combinación | Comportamiento distinto |
|---|---|
| `Ghost` + `disabled` | Sin fondo. Solo label al `#d4d1cc`. Requiere `cursor: not-allowed` |
| `Secondary` + `disabled` | Borde atenuado a `#d4d1cc` (vs `#e8e6e3` en default) |

---

## Transiciones

Sin prototipo en Figma. Se recomienda regla global del sistema:

```css
transition: background 150ms ease-out;
```

`focus` sin transición: el focus ring debe aparecer instantáneo por accesibilidad.

---

## Accesibilidad

| Requisito | Valor |
|---|---|
| Rol | `<button>` nativo |
| Label accesible | Texto del Label |
| Teclado | `Enter` y `Space` activan. `Tab` enfoca |
| Foco visible | Requiere focus ring de `2px` con contraste ≥ 3:1 |
| Estado disabled | `disabled` nativo, no solo estilo |
| Estado loading | `aria-busy="true"`, botón no clickeable |
| Contraste texto | Primary: `#ffffff` sobre `#1257cc` — verificar AA. Ghost: `#0f49a8` sobre fondo blanco — 4.5:1+ |
| Área táctil | `41px` de alto. Para cumplir `44px` mínimo (WCAG 2.5.8), requiere padding extra |

---

## API del Componente

| Prop | Tipo | Default | Requerido |
|---|---|---|---|
| `label` | `string` | — | Sí |
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | No |
| `state` | `'default' \| 'disabled'` | `'default'` | No |
| `loading` | `boolean` | `false` | No |
| `onClick` | `() => void` | — | Sí |

Las variantes de estado (hover, focus, active) se manejan internamente con CSS
pseudo-clases (`:hover`, `:focus-visible`, `:active`), no como props.

---

## Pendientes

| # | Qué falta | Bloquea | Estado |
|---|---|---|---|
| 1 | Estados `loading` para Secondary y Ghost | Implementación completa de loading | Pendiente de diseño |
| 2 | Focus ring: color y offset exactos | Accesibilidad keyboard | Pendiente de definición |
| 3 | Transición: duración y easing no están en el DS | Higiene de interacción | Pendiente de definición |

---

## Nota sobre tokens

El archivo tiene variables ligadas a padding, radius y fills del Primary. Sin embargo,
por política de la skill y consistencia con el resto del sistema, se documentan valores
crudos. Los tokens candidatos identificados:

| Valor crudo | Apariciones | Posible token |
|---|---|---|
| `#1257cc` | 4 (Primary fill, Secondary active border, Ghost focus border) | `color/primary/default` |
| `#0e3d99` | 5 (hover fills, focus fills) | `color/primary/hover` |
| `#0a2d73` | 1 (active fill) | `color/primary/active` |
| `#eef4fe` | 2 (Primary disabled bg, Ghost hover/focus bg) | `color/primary/muted` |
| `#0f49a8` | 3 (Ghost label) | `color/primary/on-muted` |
| `#e8e6e3` | 2 (Secondary border default) | `color/border/default` |
| `#d4d1cc` | 4 (disabled labels, secondary disabled border, ghost active bg) | `color/text/muted` |
| `#1a1814` | 2 (Secondary label) | `color/text/default` |
| `#ffffff` | 4 (Primary label) | `color/primary/on-default` |

---

## Registro de Decisiones

| Fecha | Gap | Decisión | Quién |
|---|---|---|---|
| 2026-07-26 | Estados hover/focus/active/loading | Creados por derivación cromática del fill primary | Enzo |
| 2026-07-26 | Secondary disabled stroke | Corregido a `#d4d1cc` (estaba `#e8e6e3`) | Enzo |
| 2026-07-26 | Text overflow | WIDTH_AND_HEIGHT — el botón crece con el contenido | Enzo |
| 2026-07-26 | Duplicado Ghost Disabled | Eliminado (estaba duplicado en el component set) | Enzo |

---

## Changelog

| Fecha | Versión | Cambio |
|---|---|---|
| 2026-07-26 | v1 | Documento inicial |
