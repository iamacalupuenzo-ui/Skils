# Auditoría de Componente

Correr esto antes de documentar. Documentar un componente con defectos congela la
inconsistencia en el handoff y el equipo la construye tal cual.

Todos los hallazgos salen de leer el nodo. Ninguno de mirar el diseño.

---

## Lectura base

Por cada variante del set, extraer: `width`, `height`, `layoutMode`, sizing, padding,
`itemSpacing`, `cornerRadius`, `fills` + `boundVariables`, `strokes` + `strokeWeight` +
`strokeAlign`, `opacity`, `effects`, y del texto: `characters`, `fontName`, `fontSize`,
`lineHeight`, `fills` + token.

---

## 1 · Cobertura de combinaciones

Comparar `componentPropertyDefinitions` contra las variantes que existen.

```javascript
const dims = set.variantGroupProperties;           // ej. variant: 3, state: 6 → 18
const esperado = Object.values(dims).reduce((a, d) => a * d.values.length, 1);
const faltan = esperado - set.children.length;
```

Un set que declara 3 × 6 y tiene 16 hijos tiene **2 combinaciones faltantes**. Al hacer swap
hacia una combinación inexistente, Figma cae en un estado arbitrario. Listar cuáles faltan por
nombre.

## 2 · Estados distinguibles entre sí

Comparar las variantes de a pares dentro de cada variante. **Dos estados con la misma
apariencia son un defecto funcional**, no una decisión.

Caso típico: `Focus` idéntico a `Hover`. El usuario de teclado pierde la referencia de dónde
está parado — WCAG 2.4.11.

## 3 · Mecanismo de foco

- ¿Existe un indicador de foco en **todas** las variantes, o solo en algunas?
- ¿Es el mismo mecanismo en las tres, o cada una resuelve distinto?
- ¿El indicador **contrasta contra el relleno** que tiene al lado? Un anillo azul oscuro sobre
  un relleno azul es invisible. Verificar por screenshot, no por lectura de valores.

## 4 · Mecanismo de disabled

- ¿Opacidad, tokens, o los dos a la vez?
- Si es opacidad: ¿el mismo valor en todas las variantes? (0.5 en una y 0.4 en otra es
  inconsistencia)
- **Doble atenuado**: bajar la opacidad del contenedor *y además* aclarar el color del texto
  atenúa dos veces y suele dejar el texto ilegible.
- Un único mecanismo aplicado una sola vez.

## 5 · Estados que no comunican

`Loading` sin spinner ni cambio de label es indistinguible de `Default`. `Error` sin señal
visual. Un estado que no se ve no existe para el usuario.

## 6 · Propiedades de contenido

- ¿El texto es una **propiedad TEXT** del set o un nodo hardcodeado por variante?
  Si es hardcodeado, al cambiar de variante se pierde el label escrito.
- ¿Hay `itemSpacing` > 0 con un solo hijo? Señal de un slot de ícono previsto y nunca hecho.
- ¿Los anchos difieren entre variantes solo porque el texto de ejemplo es distinto?

## 7 · Cobertura de tokens

**El hallazgo más valioso y el más invisible.** Contar cuántas variantes tienen
`boundVariables` y cuántas tienen hex crudo.

```javascript
const sinToken = set.children.filter(v => {
  const f = (v.fills || [])[0];
  return f && !(f.boundVariables && f.boundVariables.color);
}).map(v => v.name);
```

Patrón habitual: las variantes originales están tokenizadas y los estados agregados después
quedaron en hex crudo. **Antes de reportarlo, verificar si el token existe** — muchas veces
está en crudo porque el sistema no tiene ese token, y entonces el hallazgo cambia de "atarlo al
token" a "falta el token en la librería". → `references/figma-gotchas.md`, sección variables.

## 8 · Geometría determinista

- `lineHeight: AUTO` hace que el alto dependa de la métrica de la fuente. Fijarlo en px vuelve
  el alto predecible y verificable en handoff.
- Verificar el alto resultante contra el mínimo táctil (44px).
- `strokeWeight` que cambia entre estados sin razón (1.5 en unos, 2 en otros).
- Colores de borde distintos por estado sin sistema detrás.

## 9 · Coherencia de familia de color

Los estados de una misma variante deben progresar dentro de la misma familia. Un `Hover` azul y
un `Active` gris cálido es un salto que rompe la lectura de progresión.

---

## 10 · Contraste — calculado, no estimado

"Se ve poco contrastado" no es un hallazgo verificable. Calcular el ratio:

```javascript
function lum(hex){
  const c = [0,1,2].map(i => parseInt(hex.slice(1 + i*2, 3 + i*2), 16) / 255)
    .map(v => v <= 0.03928 ? v/12.92 : Math.pow((v + 0.055)/1.055, 2.4));
  return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2];
}
function ratio(a, b){
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}
```

| Umbral | Aplica a |
|--------|----------|
| `4.5:1` | texto normal (WCAG 1.4.3) |
| `3:1` | texto grande ≥24px, o ≥18.66px bold |
| `3:1` | componentes e indicadores no textuales — bordes, íconos (1.4.11) |
| `3:1` | contraste no textual del indicador de foco, cuando aplique (1.4.11); evaluar además que el foco no quede totalmente oculto según 2.4.11 |

**El indicador de foco se evalúa contra los dos lados**: el relleno del componente por dentro y
el fondo de la página por fuera. Un anillo puede pasar contra uno y fallar contra el otro —
`#0E3D99` sobre `#1257CC` da `1.5:1`, invisible, mientras que contra blanco da `8.6:1`.

Disabled está exento de 1.4.3, pero un disabled ilegible sigue siendo un problema de producto.

---

## 11 · Impacto en instancias — antes y después de tocar nada

**Modificar un component set cambia cada instancia del archivo.** Hay que saber quiénes son
*antes* de corregir, no enterarse después.

```javascript
const variantIds = new Set(set.children.map(c => c.id));
const hits = [];
for (const page of figma.root.children) {          // scopear por página: el barrido total tira timeout
  for (const i of page.findAllWithCriteria({ types:['INSTANCE'] })) {
    const mc = await i.getMainComponentAsync();
    if (!mc || !variantIds.has(mc.id)) continue;
    let p = i.parent, cadena = [];
    while (p && p.type !== 'PAGE') { cadena.push(p.name); p = p.parent; }
    hits.push({ page: page.name, variante: mc.name, w: i.width, h: i.height,
                ruta: cadena.reverse().join(' › ') });
  }
}
```

Separar los resultados en tres grupos, porque el riesgo es distinto:

| Dónde vive la instancia | Qué significa |
|-------------------------|---------------|
| **Pantallas / flujos** | riesgo real de layout — revisar esos frames por screenshot después de corregir |
| **Documentación existente** | se actualiza sola y queda contradiciendo sus propias anotaciones |
| **Suelta en el canvas** | huérfano — ver limpieza |

Si un cambio altera el alto o el ancho, **decir cuántas instancias y en qué frames** antes de
pedir confirmación. "Las instancias heredan los cambios" sin números no es información.

Después de corregir, volver a mirar los frames del primer grupo. `findAllWithCriteria` es mucho
más rápido que `findAll` y hay que scopearlo por página.

---

## 12 · Limpieza de los propios huérfanos

Los swaps de variante, los clones y los reintentos dejan nodos sueltos a nivel de página.
**Son responsabilidad de quien los generó**, no un pendiente que le queda al usuario.

```javascript
const sueltos = page.children.filter(c =>
  (c.type === 'INSTANCE' || c.type === 'FRAME') && !c.name.startsWith('_'));
```

Al cerrar cualquier sesión de escritura: listar lo que quedó suelto, distinguir lo preexistente
de lo generado en la sesión, y **proponer borrar solo lo propio**. Borrar es irreversible —
se propone, no se ejecuta sin confirmación.

---

## Antes de proponer correcciones

- Separar lo que se puede corregir **en el archivo** de lo que necesita **decisión del dueño de
  la librería** (tokens faltantes, cambios de paleta, forkear una colección remota).
- Marcar explícitamente las correcciones que **cambian la apariencia** de instancias ya usadas
  en pantallas.
- Presentar la lista y esperar confirmación. Modificar un component set impacta cada instancia
  del archivo.

## Después de corregir

- Screenshot del set completo, no solo lectura de valores.
- Si una corrección reintroduce el problema que resolvía, **decirlo y rehacerla**. Ocurrió en
  esta sesión: el primer anillo de foco tenía el mismo defecto de contraste que estaba
  corrigiendo.
- Releer todas las variantes y armar la tabla final de specs para la documentación.
