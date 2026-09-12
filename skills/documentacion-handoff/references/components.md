# Componentes — Catálogo del Kit

**Regla central: los IDs de nodo son por archivo y se vuelven obsoletos. Los nombres no.**

Nunca hardcodear un ID. Resolver siempre por nombre al inicio de cada sesión y guardar los IDs
resueltos en memoria de trabajo para esa sesión. El mismo kit aparece en archivos distintos con
IDs distintos; los nombres y las claves de propiedad se mantienen.

---

## Paso 0 — Resolución de sesión (obligatorio antes de crear nada)

```javascript
await figma.loadAllPagesAsync();
const R = {};
const byName = (n, t) => figma.root.findOne(x => x.name === n && (!t || x.type === t));

// Kit de anotación
R.measure  = byName('Handoff — Element Measure', 'COMPONENT_SET');
R.spacing  = byName('Handoff — Spacing', 'COMPONENT_SET');
R.arrows   = byName('Handoff — Arrows', 'COMPONENT_SET');
R.handoffMarker = byName('Handoff — Marker', 'COMPONENT_SET');
R.note     = byName('Handoff — Note', 'COMPONENT');
R.area     = byName('Handoff — Area', 'COMPONENT_SET');
R.code     = byName('Handoff — Code', 'COMPONENT_SET');

// Kit de documentación
R.section  = byName('Section', 'COMPONENT_SET');
R.dsHeader = byName('_Design system header', 'COMPONENT_SET');
R.divider  = byName('Divider Container', 'COMPONENT');
R.footer   = byName('Unlock Lyse Beta', 'COMPONENT');
R.tip      = byName('_Tip', 'COMPONENT');

// Kit de QA
// OJO: `Comment` puede ser COMPONENT o COMPONENT_SET segun el archivo. Resolver SIN filtrar
// por tipo y verificarlo despues; filtrar por 'COMPONENT' lo da por inexistente.
R.comment  = byName('Comment');
R.qaMarker = byName('Marker', 'COMPONENT_SET');
R.etiqueta = byName('Etiqueta Tipo', 'COMPONENT_SET');
R.status   = byName('Annotation Status', 'COMPONENT_SET');

const out = {};
for (const k of Object.keys(R)) {
  out[k] = R[k] ? { id: R[k].id, page: R[k].parent && R[k].parent.name,
    variants: R[k].type === 'COMPONENT_SET' ? R[k].children.map(c => c.name) : null,
    props: R[k].componentPropertyDefinitions || null } : null;
}
return out;
```

Lo que devuelva `null` no existe en ese archivo — declararlo antes de seguir, no improvisar un
reemplazo.

**El kit puede vivir en una página distinta de la del componente a documentar.** Las instancias
cross-page funcionan sin problema; solo hay que llamar `loadAllPagesAsync()` primero.

---

## Kit de anotación

### `Handoff — Element Measure` — medidas
Cota con número. **Redimensionable**: ajustar al tramo real que se mide.

| Propiedad | Valores |
|-----------|---------|
| `Vertical` | `False` (mide ancho) / `True` (mide alto) |
| `Side` | `True` / `False` — de qué lado sale el número |
| `Text#17:0` | TEXT — el valor, ej. `"94px"` |

```javascript
const m = R.measure.children.find(c => c.name === 'Vertical=False, Side=True').createInstance();
m.resize(94, m.height);              // el ancho ES la medida
m.setProperties({ 'Text#17:0': '94px' });
```

### `Handoff — Spacing` — espaciados y padding
Barra verde que marca un tramo de espaciado. **Redimensionable.**

| Propiedad | Valores |
|-----------|---------|
| `Vertical` | `False` / `True` |
| `Side text` | `False` / `True` |
| `Size` | `4px` `8px` `16px` `24px` `32px` `40px` `48px` `56px` `64px` `72px` `80px` |

**No existe `12px`.** Para espaciados fuera de esa escala, usar `Element Measure` con el texto
correspondiente.

**`Side text` NO controla dentro/fuera — controla el lado.** En las dos variantes el número
queda por fuera del tramo:

| Valor | Posición del número | Constraint |
|-------|--------------------|------------|
| `True` | a la **derecha** del tramo (x local +108 sobre 100 de ancho) | `MAX` |
| `False` | a la **izquierda** (x local −22) | `MIN` |

Como el constraint es MAX/MIN, al redimensionar la instancia el número sigue el borde
correspondiente. Elegir el valor según hacia dónde haya espacio libre: si el tramo arranca
pegado al componente, `True` mete el número **encima** del componente.

### `Handoff — Arrows` — líneas guía con marcador

| Propiedad | Valores |
|-----------|---------|
| `Type` | `Vertical` / `Horizontal` / `Corner Top` / `Corner Bottom` |
| `Orientation` | `False` / `True` |
| `Marker` | `Arrow` / `Marker` / `Badge` |
| `Label` | `False` / `True` |

**La letra del marcador (A, B, C…) no es una propiedad.** Es un TEXT anidado llamado `Letter`
dentro de la instancia `Handoff — Marker`. Se edita directo:

```javascript
const letra = arrowInstance.findOne(n => n.type === 'TEXT' && n.name === 'Letter');
letra.characters = 'B';
```

La **punta** de la flecha es el borde del que sale la línea. Apuntar al elemento real: si la
nota dice "B — Label", la punta va sobre el label, no sobre el borde del contenedor.

### `Handoff — Note` — línea de texto de anotación
COMPONENT simple, redimensionable en ancho.

| Propiedad | Tipo |
|-----------|------|
| `↪ Text Note#112:10` | TEXT |

---

## Kit de documentación

### `_Design system header`
Encabezado de página. Variantes por `Type` (`Sub` para páginas de componente).

| Propiedad | Tipo |
|-----------|------|
| `Metadata#378:0` | BOOLEAN |
| `Type` | VARIANT |

**Los textos NO están expuestos como propiedades.** Son nodos anidados que se editan directo:

| Nodo | Contenido |
|------|-----------|
| `Heading` | nombre del componente |
| `Supporting text` (el más ancho, ~800px) | descripción |
| `Supporting text` (angostos) | breadcrumb: `/`, `Handoff` |
| `Version` | `v2026` |
| `Link` | CTA |

```javascript
const desc = hdr.findAll(n => n.type === 'TEXT' && n.name === 'Supporting text')
                .sort((a, b) => b.width - a.width)[0];
```

**El nodo de descripción tiene ancho fijo y recorta el excedente.** Mantener el texto en ~2
líneas y verificar por screenshot que no quede cortado con `…`.

### `Section`
Bloque de texto de sección. Dos layouts.

| Propiedad | Tipo |
|-----------|------|
| `Tagline#23:82` | TEXT |
| `Title Text#23:74` | TEXT |
| `Content#23:78` | TEXT |
| `Show Row 2#23:102` | BOOLEAN |
| `Show Grid#23:94` | BOOLEAN |
| `Show Preview#23:90` | BOOLEAN |
| `Show Button#23:86` | BOOLEAN |
| `Show Extra Content#23:98` | BOOLEAN |

**`layout=Hero`** — tagline + título + párrafo. Es el separador estándar entre secciones.

**`layout=Cards`** — título + párrafo + tarjetas.
- Estructura: `Title`, `Content`, `Card 1` (`Icon Row` [`Tag`, `Tip Title`] + `Description`),
  `Card Row 2` > `Card 2` / `Card 3` (misma estructura interna).
- **Trampa: en `layout=Cards` el nodo Content responde a otra clave** (`Content#24:2485`).
  `setProperties({ 'Content#23:78': ... })` no lo modifica y queda el texto default del
  componente. Setear el TEXT hijo directo:
  ```javascript
  sec.children.find(c => c.type === 'TEXT' && c.name === 'Content').characters = '...';
  ```
- Los textos de las tarjetas también son anidados. Convención de `Tag`: `⚠ WARNING`,
  `💡 TIP`, `✅ CHECK`.

### Cierre de página
`Divider Container` (clonar) + `Unlock Lyse Beta` (instanciar).

---

## Kit de QA — observaciones

### `Comment`

| Propiedad | Tipo |
|-----------|------|
| `Number#23:8` | TEXT |
| `Heading#24:0` | TEXT |
| `Comment#23:5` | TEXT |
| `Type` | VARIANT: `Problema mayor` / `Problema menor` / `Nota` |

### `Etiqueta Tipo`
Component set con las categorías. **No está expuesta como propiedad del Comment** — es un nodo
hijo. Cambiar **siempre** con `swapComponent`, nunca con `setProperties`.

```javascript
const etiqueta = obs.children.find(c => c.name === 'Etiqueta Tipo');
const variante = R.etiqueta.children.find(v => v.name.includes('Jerarquía Visual'));
etiqueta.swapComponent(variante);
```

Variantes: `Diseño de Interacción`, `Jerarquía Visual y Consistencia`,
`Navegación e Incorporación`, `Manejo de Errores y Textos`.

---

## Geometría estándar de los paneles

| Elemento | Valores |
|----------|---------|
| Contenedor de documentación | VERTICAL autolayout · padding 40 · gap 40 · fill `#FAFAFA` · sizing AUTO/AUTO · counterAxis MIN |
| Panel de componente | ancho 800 · fill `#F6F7F9` · radius 16 · autolayout centrado |
| Panel de anotación / estados | ancho 1280 · fill `#F6F7F9` · radius 16 · `layoutMode: NONE` · `clipsContent: false` |

`clipsContent: false` es obligatorio en los paneles de anotación: los bordes exteriores y las
líneas guía se salen del box del nodo.
