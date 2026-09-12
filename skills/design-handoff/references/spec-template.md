# Spec Template — Estructura del Documento

Formato del entregable. Criterio de calidad: **un desarrollador construye el componente
sin abrir Figma y sin preguntar nada.**

Archivo: `handoff/[componente].md` (kebab-case). Pantallas: `handoff/pantallas/[nombre].md`.

---

## Plantilla

````markdown
# [Componente]

> Handoff para desarrollo · [fecha] · v[n]
> Figma: [nombre del archivo] · Node `[id]`

## Resumen

[Dos o tres líneas: qué es, para qué se usa, dónde aparece. Sin adjetivos.]

| | |
|---|---|
| Tipo | Atom / Molecule / Organism |
| Interactivo | Sí / No |
| Variantes | [N] |
| Estados | [N] de [N] requeridos |
| Node | `[id]` |

---

## Anatomía

![](./assets/[componente]-anatomia.png)

> El componente se muestra dentro de un contenedor centrado (ver D15).  
> Contenedor: `800 × [altura]` — componente centrado a `( (800 - w)/2, 62 )`.

| # | Capa | Tipo | Rol | Requerido |
|---|------|------|-----|-----------|
| 1 | Container | Frame | Envuelve y define el área táctil | Sí |
| 2 | Icon | Instance | Ícono opcional a la izquierda | No |
| 3 | Label | Text | Texto de la acción | Sí |

---

## Layout

| Propiedad | Valor | Token |
|---|---|---|
| Dirección | Horizontal | — |
| Gap | `8px` | `spacing/sm` |
| Padding | `12px 16px` | `spacing/md` `spacing/lg` |
| Alineación | center / center | — |
| Ancho | hug contents | — |
| Alto | `40px` fijo | `size/control/md` |
| Alto mínimo táctil | `44px` | — |

```css
display: flex;
flex-direction: row;
align-items: center;
justify-content: center;
gap: var(--spacing-sm);
padding: var(--spacing-md) var(--spacing-lg);
height: var(--size-control-md);
width: fit-content;
```

### Comportamiento de dimensionamiento

| Capa | Ancho | Alto |
|---|---|---|
| Container | hug | fijo `40px` |
| Icon | fijo `20px` | fijo `20px` |
| Label | hug | hug |

---

## Estilo

### Fondo
| Propiedad | Valor | Token |
|---|---|---|
| Fill | `#E8603C` | `color/accent/default` |
| Opacidad | 100% | — |

### Borde
| Propiedad | Valor | Token |
|---|---|---|
| Ancho | `0px` | — |
| Radio | `8px` | `radius/md` |

### Sombra
| Propiedad | Valor | Token |
|---|---|---|
| Drop shadow | `0px 1px 2px 0px rgba(0,0,0,0.05)` | `shadow/sm` |

```css
background: var(--color-accent-default);
border-radius: var(--radius-md);
box-shadow: var(--shadow-sm);
```

### Tipografía
| Propiedad | Valor | Token |
|---|---|---|
| Familia | Inter | `font/family/base` |
| Tamaño | `14px` | `font/size/sm` |
| Peso | 600 | `font/weight/semibold` |
| Interlineado | `20px` | `font/lineHeight/sm` |
| Espaciado | `0px` | — |
| Color | `#FFFFFF` | `color/accent/on-default` |
| Alineación | center | — |
| Overflow | trunca con ellipsis, 1 línea | — |

---

## Variantes

Lo que el desarrollador elige al instanciar.

### `size`
| Valor | Alto | Padding H | Font | Icon | Radio |
|---|---|---|---|---|---|
| `sm` | `32px` | `12px` | `12px` | `16px` | `6px` |
| `md` | `40px` | `16px` | `14px` | `20px` | `8px` |
| `lg` | `48px` | `20px` | `16px` | `24px` | `8px` |

### `variant`
| Valor | Fondo | Texto | Borde |
|---|---|---|---|
| `primary` | `color/accent/default` | `color/accent/on-default` | ninguno |
| `secondary` | `color/surface/raised` | `color/text/default` | `1px color/border/default` |
| `ghost` | transparente | `color/accent/default` | ninguno |

---

## Estados

Deltas sobre `default`. Solo lo que cambia.

| Estado | Cambio | Token |
|---|---|---|
| `default` | — | — |
| `hover` | Fondo → `#D4522F` | `color/accent/hover` |
| `focus` | Ring `2px` offset `2px` | `color/focus/ring` |
| `active` | Fondo → `#C04829` | `color/accent/pressed` |
| `disabled` | Fondo `color/surface/muted`, texto al 40%, `cursor: not-allowed` | — |
| `loading` | Spinner `16px` reemplaza el ícono, label visible, no clickeable | — |

### Cobertura

| Estado | En Figma | Requerido | Resultado |
|---|---|---|---|
| default | Sí | Sí | OK |
| hover | Sí | Sí | OK |
| focus | No | Sí | `[derivado]` regla global del DS |
| active | Sí | Sí | OK |
| disabled | Sí | Sí | OK |
| loading | No | Sí | ⛔ TODO |

### Excepciones

| Combinación | Comportamiento distinto |
|---|---|
| `ghost` + `disabled` | Sin fondo. Solo el texto al 40% |

---

## Transiciones

| De → A | Propiedad | Duración | Easing |
|---|---|---|---|
| default → hover | background | `150ms` | `ease-out` |
| cualquiera → focus | box-shadow | `0ms` | — |

```css
transition: background 150ms ease-out;
```

`focus` sin transición: el ring debe aparecer instantáneo por accesibilidad.

---

## Accesibilidad

| Requisito | Valor |
|---|---|
| Rol | `button` |
| Label accesible | Texto del label. Si es solo ícono → `aria-label` obligatorio |
| Teclado | `Enter` y `Space` activan. `Tab` enfoca |
| Foco visible | Ring `2px`, contraste ≥ 3:1 contra el fondo |
| Estado disabled | `disabled` nativo, no solo estilo |
| Estado loading | `aria-busy="true"` |
| Contraste texto | `#FFFFFF` sobre `#E8603C` = 3.4:1 — ⚠ cumple AA solo en texto ≥ 18px |
| Área táctil | `44×44px` mínimo. En `sm` requiere padding invisible |

---

## API del Componente

Traducción de las propiedades de Figma a props.

| Prop | Tipo | Default | Requerido |
|---|---|---|---|
| `label` | `string` | — | Sí |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | No |
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | No |
| `icon` | `ReactNode` | — | No |
| `disabled` | `boolean` | `false` | No |
| `loading` | `boolean` | `false` | No |
| `onClick` | `() => void` | — | Sí |

---

## Responsive

| Breakpoint | Comportamiento |
|---|---|
| ≥ 768px | Ancho hug |
| < 768px | Ancho 100% del contenedor |

---

## Pendientes

Lo que bloquea la implementación completa.

| # | Qué falta | Bloquea | Estado |
|---|---|---|---|
| 1 | Estado `loading` sin diseñar | La variante loading | Solicitado a diseño |

---

## Registro de Decisiones

| Fecha | Gap | Decisión | Quién |
|---|---|---|---|
| 2026-07-24 | Estado focus | Ring `2px` `color/focus/ring`, offset `2px` | Enzo |
| 2026-07-24 | Label largo | Trunca con ellipsis, 1 línea | Enzo |

---

## Changelog

| Fecha | Versión | Cambio |
|---|---|---|
| 2026-07-24 | v1 | Documento inicial |
````

---

## Reglas de Escritura

### Sí
- Tablas para todo lo que sea valor. Prosa solo en el resumen
- Un bloque CSS por sección de layout y estilo — dev copia y pega
- Marcadores de origen visibles (`[derivado]`, `[inferido]`, `⚠`, `⛔`)
- Estados como delta sobre default, nunca repitiendo la spec completa
- Valores exactos del nodo: si Figma dice `23.5`, va `23.5`

### No
- IDs de nodo en el cuerpo del documento (solo en el encabezado)
- Lenguaje de la API de Figma (`fills[0].color`, `layoutGrow`, `getNodeByIdAsync`)
- Adjetivos de calidad ("un botón moderno y limpio")
- Repetir la spec completa por cada variante — solo lo que cambia
- Secciones vacías con "N/A" — si no aplica, se omite la sección

---

## Secciones Condicionales

| Sección | Se incluye si |
|---|---|
| Variantes | El componente tiene variant properties |
| Estados | Es interactivo |
| Transiciones | Tiene estados con cambio visual |
| API | Va a implementarse como componente reutilizable |
| Responsive | Cambia de comportamiento entre breakpoints |
| Pendientes | Hay TODOs. Si no hay, se omite |
| Anatomía completa | Modo AVANZADO — en NORMAL se omiten las capas transparentes |
| Reconstrucción | Modo AVANZADO únicamente |

---

## Sección Reconstrucción — solo AVANZADO

Va después de Pendientes. No describe cómo **está** el componente sino qué habría que
cambiar en Figma para que sea construible. Es el input para diseño, no para dev.

Cada hallazgo se prueba con valores leídos del nodo. Sin evidencia numérica no se
escribe — una opinión de estructura sin medición es exactamente lo que `gaps.md`
prohíbe.

````markdown
## Reconstrucción

Observaciones sobre la construcción en Figma. No bloquean el desarrollo del estado
actual; bloquean que el componente escale.

### Jerarquía

| Hallazgo | Evidencia | Impacto en código |
|---|---|---|
| 3 niveles de anidación para 3 hijos | `Card > Stepper > Header > [back, texto]` | 3 divs sin rol propio |
| 2 capas ocultas | `1:1397` y `1:1404` con `visible: false` | Ruido: dev pregunta si van |
| Frame que solo agrupa | `Header` sin fill, borde, sombra ni radio | Se colapsa en el padre |

### Valores muertos

Propiedades que Figma reporta pero no tienen efecto. Dev las lee y las implementa.

| Propiedad | Valor | Por qué no aplica |
|---|---|---|
| `itemSpacing` | `41` | `SPACE_BETWEEN` lo anula |
| `strokeWeight` del vector | `28.44` | `strokes` está vacío |
| `itemSpacing` de la Card | `16` | Tiene un solo hijo |

### Layout

| Hallazgo | Cálculo | Propuesta |
|---|---|---|
| Texto 20px fuera del centro | extremos `24` vs `64` → centro texto `151`, centro card `171` | Reservar `64` a ambos lados |
| Bloque de texto con ancho fijo | `145px`, `layoutGrow: 0` | `fill container` |

### Higiene

| Hallazgo | Valor |
|---|---|
| Relleno gris por defecto de Figma | `#D9D9D9` en el track del anillo |
| Medidas no enteras | `57.379`, `63.9998`, `16.339×30.0005` |
| Nombres automáticos | `Frame 1686560640`, `Group 2608096` |
| Sin variables ni styles | 0 colecciones, 0 estilos |

### Prioridad

| # | Qué | Bloquea |
|---|---|---|
| 1 | Track del anillo en `#D9D9D9` | El paso `1/2` |
| 2 | Bloque de texto con ancho fijo | Copy largo |
| 3 | Convertir a Component con variantes | Todos los estados |
````

### Reglas

- Una fila = un hallazgo, con su evidencia numérica al lado
- **Verificar antes de afirmar.** "Vector descentrado en `x:4`" es falso si el centro
  ideal es `3.83`. Calcular el desvío, no leer la coordenada y suponer
- Separar lo que rompe el render de lo que ensucia el archivo
- No proponer un rediseño: proponer el cambio mínimo que resuelve el hallazgo

---

## Documento de Pantalla

Para modo PANTALLA. No repite specs de componentes — los referencia.

````markdown
# [Pantalla]

> Handoff · [fecha] · Node `[id]`

## Composición

![](./assets/[pantalla].png)

| # | Zona | Componente | Doc |
|---|---|---|---|
| 1 | Header | AppBar | [appbar.md](../appbar.md) |
| 2 | Body | Form | — |
| 3 | Footer | Button (primary, lg) | [button.md](../button.md) |

## Grid y Layout

| Propiedad | Valor | Token |
|---|---|---|
| Ancho máximo | `1200px` | `layout/container/max` |
| Columnas | 12 | — |
| Gutter | `24px` | `spacing/lg` |
| Margen lateral | `16px` mobile / `32px` desktop | `spacing/md` `spacing/xl` |

## Espaciado Vertical

| Entre | Valor | Token |
|---|---|---|
| Header → Body | `32px` | `spacing/xl` |
| Campos del form | `16px` | `spacing/md` |

## Estados de Pantalla

| Estado | Qué se muestra |
|---|---|
| Carga | Skeleton de los 3 campos |
| Vacío | No aplica |
| Error de red | Banner arriba del form, campos habilitados |

## Flujo

[Qué dispara cada acción y a dónde navega. Tabla, no prosa.]

| Acción | Resultado |
|---|---|
| Submit válido | Navega a `/dashboard` |
| Submit inválido | Marca campos en error, foco al primero |
````
