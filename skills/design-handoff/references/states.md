# States — Matriz de Variantes y Estados

Un componente no está documentado cuando se documentó su estado default. Está
documentado cuando dev sabe qué pasa en **cada** estado y **cada** variante.

---

## Matriz Obligatoria

Se evalúa contra todo componente interactivo. La columna "Aplica" se determina por
tipo de componente, no por lo que haya en Figma.

| # | Estado | Aplica a | Prioridad si falta |
|---|--------|----------|--------------------|
| 1 | `default` | Todos | Alta |
| 2 | `hover` | Todo lo clickeable en desktop | Alta |
| 3 | `focus` | Todo lo enfocable por teclado | Alta — requisito de a11y |
| 4 | `active` / `pressed` | Todo lo clickeable | Media |
| 5 | `disabled` | Todo lo que pueda deshabilitarse | Alta |
| 6 | `loading` | Lo que dispara acción async | Alta si hay async |
| 7 | `error` / `invalid` | Inputs y formularios | Alta en inputs |
| 8 | `selected` / `checked` | Toggles, tabs, checkboxes, radios | Alta si aplica |

**Un estado faltante no bloquea el documento** — se documenta lo que existe y el
faltante va como `⛔ TODO` en la tabla de cobertura. Lo que bloquea es la
implementación de ese estado, no la entrega. Ver B6 en el orquestador.

La prioridad ordena qué pedirle a diseño primero, no si se entrega o no.

Estados adicionales según componente: `read-only`, `empty`, `skeleton`, `expanded`,
`dragging`, `indeterminate`.

---

## Aplicabilidad por Tipo

| Componente | Estados mínimos |
|---|---|
| Button | default, hover, focus, active, disabled, loading |
| Input / Textarea | default, hover, focus, disabled, error, read-only, filled |
| Checkbox / Radio | default, hover, focus, disabled, checked, indeterminate |
| Toggle / Switch | default, hover, focus, disabled, on, off |
| Select / Dropdown | default, hover, focus, disabled, error, open, selected |
| Card clickeable | default, hover, focus, active, selected, disabled |
| Tab | default, hover, focus, active, selected, disabled |
| Link | default, hover, focus, active, visited, disabled |
| Modal / Sheet | closed, opening, open, closing |
| Lista / Tabla | default, loading, empty, error |

Componente **no interactivo** (badge, divider, avatar estático): la matriz no aplica.
Documentar solo variantes.

---

## Auditoría de Cobertura

Cruzar los variants extraídos (`extraction.md` → Variantes y Estados) contra la matriz.

```
Cobertura de estados — Button
| Estado   | En Figma | Requerido | Resultado    |
|----------|----------|-----------|--------------|
| default  | Sí       | Sí        | OK           |
| hover    | Sí       | Sí        | OK           |
| focus    | No       | Sí        | ⛔ TODO       |
| active   | No       | Sí        | ⛔ TODO       |
| disabled | Sí       | Sí        | OK           |
| loading  | No       | Sí        | ⛔ TODO       |

Cobertura: 3/6
```

Esta tabla va **en el documento final**, no solo en la conversación. Es evidencia
para el equipo de diseño de qué falta diseñar.

---

## Mapear un Component Set Real

Cuando el componente **sí** tiene sus estados, el trabajo no es detectar faltantes:
es traducir las variantes de Figma a algo implementable.

### 1 · Leer el set, no la instancia

```javascript
const inst = await figma.getNodeByIdAsync('INSTANCE_ID');
const main = await inst.getMainComponentAsync();
const set = main?.parent?.type === 'COMPONENT_SET' ? main.parent : null;
return { setId: set?.id, setName: set?.name, props: set?.componentPropertyDefinitions,
         variantes: set?.children.map(v => v.name) };
```

La instancia de la pantalla trae overrides. El set trae la verdad.

### 2 · Separar variantes de propiedades booleanas

`componentPropertyDefinitions` mezcla ambas. No son lo mismo para dev.

| Tipo | En Figma | En código |
|---|---|---|
| `VARIANT` | `State=Error filled` | Un valor de un enum |
| `BOOLEAN` | `Help notification#…` | Un prop independiente |
| `TEXT` | `Number#…` | Contenido |

Un set con `State` (7 valores) + 2 booleanas no tiene 7 combinaciones: tiene 28. La
tabla de estados documenta las 7; las booleanas van como props en su propia fila.

### 3 · Extraer el delta, no la spec completa

Por cada variante, comparar contra `default` y quedarse con lo que cambia.

```javascript
const hex = c => { const h = v => Math.round(v*255).toString(16).padStart(2,'0');
                   return '#'+h(c.r)+h(c.g)+h(c.b); };
for (const v of set.children) {
  const pieza = v.findOne(n => n.name === 'NOMBRE_DE_LA_PIEZA');
  console.log(v.name, {
    fill: (pieza.fills||[]).filter(f=>f.type==='SOLID').map(f=>hex(f.color)),
    stroke: (pieza.strokes||[]).filter(s=>s.type==='SOLID').map(s=>hex(s.color)),
    sw: pieza.strokeWeight,
    alto: v.height
  });
}
```

Documentar `Error filled → borde #DD4145`, no repetir el radio y el padding que no
cambiaron.

### 4 · Detectar sub-componentes anidados

Si una variante contiene otro `COMPONENT_SET`, ese se documenta aparte.

```javascript
const anidados = new Set();
for (const v of set.children) {
  for (const n of v.findAll(x => x.type === 'INSTANCE')) {
    const m = await n.getMainComponentAsync();
    if (m?.parent?.type === 'COMPONENT_SET') anidados.add(m.parent.name);
  }
}
return [...anidados];
```

Dos capas con nombres distintos pueden ser **el mismo componente** con distinto
variant. Sin este chequeo, dev construye dos.

### 5 · Renderizar — obligatorio

Instanciar cada variante desde el set y mirarla. Ver D14 en `decisiones.md`.

Lo que solo aparece renderizando:

| Síntoma | Causa |
|---|---|
| Dos elementos donde debería haber uno | Varias capas con `visible: true` en la misma variante |
| Textos de ejemplo (`Information text`, `Label`) | Placeholder que en un dump se lee como contenido válido |
| Un cambio que la propiedad no explica | Cursor, máscara, o efecto en una capa hija |

### 6 · Alto variable

Si las variantes miden distinto, es dato de layout: el contenedor tiene que
absorberlo.

| Estado | Alto |
|---|---|
| `Unfilled` … `Disabled` | `100` |
| `Error unfilled` / `Error filled` | `128` |

Documentar la diferencia y su causa — acá, la notificación de error que se agrega
abajo. Sin eso dev fija el alto y el mensaje se corta.

---

## Estado Faltante — Protocolo

Nunca inventar los valores de un estado no diseñado. Ver B6 en el orquestador.

Al detectar un faltante, ofrecer al usuario tres salidas concretas:

```
Falta el estado [X] de [Componente].
a) Existe en otro componente del DS → dame el nodo y lo extraigo
b) Hay una regla global del DS (ej: hover = -8% luminosidad) → confirmámela
c) Se diseña después → lo dejo como TODO explícito en el doc
```

Nunca proponer un valor concreto inventado como opción.

### Si la respuesta es (b) — regla global

Documentar la regla, no el resultado calculado:

```
hover — derivado por regla del DS: fondo del default con -8% de luminosidad.
Base: color/accent/default #E8603C → #D4522F
```

Se muestra el cálculo para que dev pueda verificarlo, y se marca `[derivado]`.

### Si la respuesta es (c) — TODO

```
### Estado: loading
> ⛔ **No diseñado.** Pendiente de definición por diseño.
> No implementar hasta recibir el spec. Fecha de solicitud: [fecha]
```

---

## Variantes vs Estados

No confundir. Se documentan en secciones separadas.

| | Variante | Estado |
|---|---|---|
| Qué es | Decisión de quien usa el componente | Consecuencia de la interacción |
| Quién la controla | El desarrollador al instanciar | El runtime |
| Ejemplos | `size`, `variant`, `icon-position` | `hover`, `disabled`, `loading` |
| En Figma | Variant property | Variant property (`State=`) |
| En código | Prop / input | Estado interno o prop de control |

`State=Hover` en Figma es una variante técnicamente, pero se documenta como estado.
Criterio: si el desarrollador **elige** el valor → variante. Si el navegador o la lógica
lo **produce** → estado.

---

## Matriz Cruzada

Cuando hay múltiples variantes, la combinatoria explota. No documentar cada celda —
documentar la regla y señalar solo las excepciones.

```
Variantes: size (sm, md, lg) × variant (primary, secondary, ghost)
Estados: 6
Combinaciones teóricas: 54
```

En el documento:
1. Tabla de **variantes** — qué cambia por cada una (solo lo que cambia)
2. Tabla de **estados** — qué cambia por cada uno, expresado como delta sobre default
3. Sección de **excepciones** — combinaciones que rompen la regla

```
Excepciones
| Combinación          | Comportamiento distinto                      |
|----------------------|----------------------------------------------|
| ghost + disabled     | Sin fondo, solo texto al 40% — no gris claro |
| sm + loading         | Spinner de 12px, no 16px                     |
```

Detectar excepciones comparando los variants extraídos contra la regla derivada.
Si un variant no coincide con lo que la regla predice → es excepción o es un error
de diseño. Ante la duda, preguntar.

---

## Transiciones

Dev necesita saber cómo se pasa de un estado a otro, no solo cómo se ven.

Figma casi nunca lo tiene. Extraer si existe prototipo:

```javascript
const n = await figma.getNodeByIdAsync('NODE_ID');
return {
  reactions: n.reactions?.map(r => ({
    trigger: r.trigger?.type,               // ON_HOVER, ON_CLICK, ON_PRESS...
    action: r.action?.type,                 // NODE, CHANGE_TO, BACK...
    transition: r.action?.transition        // { type, easing, duration }
  })) || []
};
```

Sin prototipo → gap Advertencia. Proponer la regla del DS si existe, o dejar TODO.
Nunca inventar una duración.
