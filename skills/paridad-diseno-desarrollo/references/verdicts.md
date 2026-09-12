# Veredictos — de dato crudo a hallazgo

La sonda devuelve tres veredictos de **uso de token**. Cruzados con la pregunta de **coincidencia
con Figma**, dan la matriz que decide qué es hallazgo, contra quién va, y con qué severidad.

---

## Las dos dimensiones

```
eje A — ¿usó el token?        TOKEN · HARDCODED_MATCHES_TOKEN · HARDCODED_OFF_SCALE
eje B — ¿coincide con Figma?  sí · no
```

Ninguna de las dos alcanza sola. `TOKEN` no garantiza que sea el token *correcto*, y "coincide
con Figma" no garantiza que sea mantenible.

---

## Matriz de decisión

| # | Veredicto | ¿Coincide con Figma? | Lectura | ¿Hallazgo? | Tipo |
|---|-----------|---------------------|---------|-----------|------|
| 1 | `TOKEN` | sí | Correcto. Nada que reportar. | No | — |
| 2 | `TOKEN` | no | **Token equivocado.** Usó `--space-2` donde el diseño pide `--space-3`. | Sí | Problema menor |
| 3 | `HARDCODED_MATCHES_TOKEN` | sí | **Deuda invisible.** Se ve perfecto hoy y se rompe cuando cambie el token o el tema. | Sí | Nota |
| 4 | `HARDCODED_MATCHES_TOKEN` | no | Hardcodeó, y además el valor está mal. | Sí | Problema menor |
| 5 | `HARDCODED_OFF_SCALE` | sí | **El diseño también está fuera de escala.** Dev copió bien un Figma que está mal. | Sí — **contra el diseño** | Nota |
| 6 | `HARDCODED_OFF_SCALE` | no | Valor inventado. | Sí | Problema menor |

### El caso 3 es el motivo por el que existe este skill

Es invisible en una revisión visual, invisible en un screenshot, invisible en un diff de píxeles.
Solo aparece leyendo el CSSOM. Y es el que más caro sale: el día que el sistema cambie
`--color-primary`, todos los componentes del caso 3 se quedan en el color viejo, y nadie va a
saber por qué.

### El caso 5 cambia el destinatario

Si dev copió fielmente un valor que en Figma está fuera de escala, **el hallazgo no es contra
desarrollo**. Reportarlo como observación en el archivo de Figma sería culpar al inocente. Va
en una sección aparte del reporte: *"hallazgos que apuntan al diseño, no a dev"*.

Decirlo explícitamente al usuario. Es la diferencia entre un reporte que el equipo de desarrollo
acepta y uno que lo pone a la defensiva.

#### El destinatario y la severidad son ejes independientes

La columna «Tipo» de la matriz dice `Nota` para el caso 5, y eso vale **mientras la desviación sea
solo de consistencia**. No es un techo: quién causó el problema no dice nada sobre cuánto daña.

Verificado el 2026-08-07: los badges de estado de un modal daban **2.44:1** y **1.93:1** de
contraste contra los 4.5:1 exigidos. Dev había copiado exactamente los colores del aprobado —caso 5
puro—, así que la matriz leída al pie de la letra los degradaba a `Nota`. Pero el badge era la única
señal escrita de si una protección de seguridad estaba activa: es un incumplimiento de WCAG con
impacto funcional, y la lista de escalada lo marca como `Problema mayor`.

```
severidad   ← el impacto en quien usa el producto     (lista de escalada)
destinatario ← quién introdujo la desviación          (casos 1-6 de la matriz)
```

**Se resuelven por separado y se combinan.** Un caso 5 puede ser `Problema mayor` dirigido al
diseño; el `Comment` lleva la severidad real y la corrección dice *"del lado del diseño"*. Bajar la
severidad porque el culpable no es dev esconde el problema para todos.

La comprobación barata: antes de asignar `Nota` a un caso 5, pasarlo por la lista de escalada. Si
entra —contraste, área táctil, elemento faltante, foco sin indicador, estado engañoso—, es mayor.

---

## Cuándo escala a Problema mayor

La matriz de arriba nunca produce `Problema mayor` — los estilos computados por sí solos son
inconsistencia visual, no ruptura funcional. Escala solo en estos casos, todos verificables:

| Condición | Por qué es mayor |
|-----------|-----------------|
| **Un control muestra un estado distinto del real** — deshabilitado que se ve activo, o activo que se ve deshabilitado | Engaña sobre qué se puede tocar. `documentacion-handoff/references/classification.md` lista textualmente *"botón activo cuando debe estar inhabilitado"* como Problema mayor; el caso inverso engaña igual. Verificable: comparar el atributo real (`disabled`) contra el estilo que Figma especifica para ese estado. |
| Contraste texto/fondo < 4.5:1 (o < 3:1 en texto ≥ 24px o ≥ 19px bold) | Incumple WCAG 2.2 AA — impacto funcional real |
| ↳ **excepción**: controles deshabilitados o inactivos | WCAG 1.4.3 los exime del mínimo. Un botón `disabled` en 1.47:1 **no es** Problema mayor. Si el texto queda ilegible, es `Nota` con la legibilidad como argumento, no el incumplimiento. |
| Área táctil < 24×24 CSS px | Revisar WCAG 2.2 AA 2.5.8 y sus excepciones (separación, equivalente, inline, control del agente o esencial); no declarar incumplimiento solo por tamaño |
| El elemento no existe en dev pero sí en el nodo de Figma | Componente faltante |
| `focus` sin indicador visible (`outline: none` sin reemplazo) | Bloquea navegación por teclado |

Fuera de esa lista, no inventar severidad alta. `documentacion-handoff` reserva `Problema mayor` para
impacto funcional en el usuario — ver `documentacion-handoff/references/classification.md`.

### El estado que nadie documentó pero que igual es obligatorio

Hay dos casos inversos y el skill los trata distinto:

| Situación | Qué es |
|-----------|--------|
| El diseño **no** documenta un estado y dev **sí** lo implementa | `Nota` — comportamiento no especificado, no defecto |
| El diseño **no** documenta un estado que **la conformidad exige**, y por eso nadie lo implementó | **Hallazgo contra el diseño**, con la severidad de la lista de escalada |

El segundo caso es fácil de descartar mal. El razonamiento que lo tira abajo —*"el aprobado no
define el foco, así que no hay contra qué comparar"*— es correcto para la **fidelidad** y falso para
la **conformidad**: WCAG 2.2 AA pide indicador de foco visible (2.4.7) lo diga o no el archivo de
diseño, igual que pide contraste sin que nadie lo documente.

Verificado el 2026-08-07: los dos botones de un modal de confirmación —uno destructivo— no mostraban
absolutamente nada al recibir el foco por teclado. `:focus-visible` daba `true` y el contorno, la
sombra, el borde y el fondo quedaban idénticos al reposo. El usuario objetó, con razón, que no podía
ir contra desarrollo porque el aprobado no documenta estados de botón.

**El argumento que decide dónde va:** el navegador dibuja un contorno de foco **por defecto**. Si no
está, no es que faltó especificarlo — es que **una hoja de estilos lo quitó** (acá, el
`.btn:focus { outline: 0 }` de Bootstrap, sin reemplazo). Eso reparte la responsabilidad en dos, y
el texto de la observación tiene que decir las dos mitades:

```
El componente no define un estado de foco, y la base del proyecto suprime el que trae el
navegador. Hay que especificarlo en el diseño y reponerlo en la implementación.
```

Va en la sección **contra el diseño** —el origen es la falta de definición— **sin bajar la
severidad**. Y comprobar siempre en el render, no en el CSS: enfocar con `Tab` y confirmar que
`:focus-visible` matchea y que ninguna propiedad visible cambió.

### La sección la decide el origen; la acción decide dónde tiene que aparecer

Ordenar por responsabilidad es correcto y tiene un costo: **cada sección tiene su lector**, y
desarrollo lee la tabla que lleva su nombre. Un hallazgo con acción de desarrollo que vive solo en
«contra el diseño» no se corrige, por bien escrito que esté.

Señalado por el usuario el 2026-08-07: *"al colocar el estado en contra el diseño, el desarrollador
no tomará lo de corregir esto"*. Tenía razón, y el arreglo no es copiar la observación en dos
lugares.

**Casi siempre el hallazgo tiene dos mitades separables, y una es un defecto autónomo.** En el caso
verificado, un enlace no reaccionaba al cursor. Eso se descompone en:

| Mitad | Sección | Por qué es autónoma |
|-------|---------|---------------------|
| La regla de hover asigna el color que el elemento ya tiene, así que no hace nada | **contra desarrollo** | Es un defecto sin importar lo que documente el diseño: alguien escribió una regla sin efecto |
| El aprobado no documenta el estado, y el enlace equivalente de otra pantalla sí lo tiene | **contra el diseño / entre componentes** | El origen es la falta de definición y la inconsistencia del sistema |

Cada mitad va con su propio número, su propio marcador y su propia corrección, y **se referencian
entre sí** en el texto. No es duplicación: es descomponer por acción. Duplicar el mismo texto en dos
secciones divide la responsabilidad en cero y las dos copias se desincronizan al primer cambio.

**La comprobación antes de cerrar:** para cada hallazgo que no esté en la tabla de desarrollo,
preguntarse *¿hay algo que desarrollo tenga que tocar?*. Si la respuesta es sí, esa parte necesita
su propia entrada donde desarrollo la va a leer.

**La lista se alinea con esa taxonomía, no la restringe.** Si `classification.md` clasifica un
síntoma como mayor y acá no figura, manda `classification.md` y hay que agregarlo. La lista existe
para impedir severidad inventada, no para bajar la que el sistema ya definió.

---

## No agrupar hallazgos de distinta naturaleza

Agrupar varios elementos en un hallazgo es correcto **cuando comparten la misma desviación**. Deja
de serlo cuando se agrupa por elemento y se pierde todo lo que no entra en el título.

Falla real (2026-08-03): se emitió *"Grises de la pantalla — no son los del sistema"* cubriendo
cuatro elementos. La sonda había medido además que dos de ellos tenían el **cuerpo tipográfico
equivocado** (11px contra 16, 16px contra 20) y uno estaba en **mayúsculas**. El título del hallazgo
hablaba de color, así que la tipografía se cayó del reporte. El dato estaba medido y a la vista.

**Regla:** agrupar por **tipo de desviación**, nunca por elemento.

```
✓  «Grises que no son del sistema»          → los 4 elementos con color equivocado
✓  «Cuerpos tipográficos por debajo del aprobado» → los 2 elementos con tamaño equivocado
✓  «Texto forzado a mayúsculas»             → el elemento con text-transform
✗  «Problemas de la tarjeta de paso»        → mezcla color, tamaño y transformación
```

Antes de cerrar, recorrer la salida de la sonda **por propiedad** y confirmar que cada desviación
fuera de tolerancia aparece en algún hallazgo. Una propiedad medida que no está en ningún hallazgo
es una omisión, no una decisión.

### El límite: un hallazgo tiene que caber en un área

Agrupar por tipo de desviación choca con que **el marcador es un área espacial**. Un hallazgo que
abarca cuatro elementos repartidos por la pantalla no se puede señalar con un rectángulo: el
marcador termina apuntando a uno y el lector no sabe a cuál de los cuatro se refiere.

Falla real: un hallazgo *"grises que no son del sistema"* cubría el borde de una tarjeta, dos textos
adentro, y un texto a 250px de distancia. Su marcador señalaba la tarjeta. Pregunta inmediata del
usuario: *"¿te referís al contenido, al borde o a los textos?"*.

**Regla:** agrupar por tipo de desviación **dentro de una misma zona señalable**. Si los elementos
afectados no caben en un área, el hallazgo se parte por ubicación.

```
✓  2  Tarjeta de paso — borde y textos en grises ajenos al sistema   → un área, tres elementos
✓  12 Pregunta de reenvío — gris ajeno al sistema                    → su propia área
✗  2  Grises de la pantalla                                          → cuatro lugares, un marcador
```

Y el texto de la observación **nombra cada elemento**, no dice "los grises": *"el borde que la
delimita, la etiqueta y el nombre del paso"*. Si hay que adivinar a qué señala, no está listo.

---

## Inventariar los dos lados y restar los conjuntos

La sonda mide **los selectores que se le pasan**. Eso la deja ciega a lo que **no está**: un
elemento que existe en Figma y no se implementó nunca aparece, porque nadie lo buscó. Comparar
pares que existen en los dos lados no encuentra ausencias.

Falla real (2026-08-03): el diseño aprobado tenía un control de retroceso en el stepper
(`fi-br-angle-small-left`, 28×28) que en dev **no existe**. Se midieron todos los elementos
presentes y ninguno falló; el hallazgo era el que faltaba. Lo detectó el usuario mirando la
captura, no el skill.

**El paso que lo encuentra:** listar los elementos visibles de cada lado y restar los conjuntos.

```javascript
// Figma: hojas visibles del nodo, con nombre y tamaño
const enFigma = nodo.findAll(n => n.visible &&
  (n.type === 'INSTANCE' || n.type === 'TEXT' || n.type === 'VECTOR'))
  .map(n => ({ name: n.name, w: Math.round(n.width), h: Math.round(n.height) }));

// dev: elementos con caja dentro de la raíz del componente
const enDev = [...raiz.querySelectorAll('*')]
  .filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height; });
```

No se comparan por nombre —nunca coinciden— sino **por rol y posición**: para cada elemento del
diseño, preguntarse *¿qué lo representa en dev?*. Si no hay respuesta, es un hallazgo.

Un elemento faltante es **Problema mayor** (ver la lista de escalada). Y el marcador se ancla
**donde debería estar**, no a un elemento existente: el área vacía es justamente lo que se señala.

### "Donde debería estar" es en el layout de dev, no en las coordenadas del aprobado

Trampa fácil: tomar la `y` del nodo aprobado y usarla tal cual. Solo funciona si los dos layouts
están alineados — y si falta un elemento, casi nunca lo están, porque su ausencia ya corrió todo lo
demás.

Verificado el 2026-08-07: la pregunta de reenvío iba en `y` 360 del contenido aprobado. En dev, un
título que se partía en dos líneas había empujado todo 32px hacia abajo, así que el área quedó
**pisando el borde inferior del campo de código** y en la captura parecía señalarlo a él. El
hallazgo era correcto y el marcador mentía.

**La regla:** derivar la posición desde el **vecino estable más cercano en dev**, respetando la
relación que define el aprobado. Ahí la pregunta se apila directamente sobre el botón de reenvío
sin separación, así que:

```
y = rectEnDev(botónDeReenvío).y − altoAprobado(pregunta)
```

y no la `y` del aprobado. El ancho y el alto sí salen del aprobado —es lo que falta, no hay otra
fuente— y el centrado se calcula sobre el ancho del contenido en dev.

Esto **solo se ve verificando** (B13): sobre la captura el área parecía razonable, y recién
dibujada sobre el componente real quedó claro que tocaba el elemento equivocado.

**La pista que lo delata desde el CSS:** si existe una regla para una clase que no aparece en el
DOM de esa pantalla —y sí en otra—, es un componente que se dejó de renderizar, no uno que nunca
se construyó. Eso cambia la corrección de "hay que construirlo" a "hay que incluirlo".

---

## El hallazgo que se repite entre componentes es de sistema, no de pantalla

`SWEEP` detecta la inconsistencia **entre instancias de una misma pantalla**. Falta el eje largo:
el mismo defecto apareciendo en **componentes distintos, auditados en corridas distintas**. Ese no
lo encuentra ninguna sonda, porque cada corrida mira un componente y se olvida del anterior.

Verificado el 2026-08-07: un archivo de ícono con el `viewBox` mal dimensionado —`0 0 24 25` donde
debía ser `24 24`— produjo el mismo hallazgo en dos modales auditados con una hora de diferencia.
Reportado dos veces por separado son dos tickets de un píxel que nadie prioriza. Reportado como
**un archivo compartido que está mal**, es un arreglo que corrige los dos componentes y cualquier
otro que lo use.

**Antes de cerrar, revisar los hallazgos de la corrida contra los de las corridas anteriores de la
sesión**, y marcar los que se repiten. Lo que suele repetirse:

| Origen compartido | Cómo se reconoce |
|-------------------|------------------|
| Un archivo de ícono mal exportado | Mismo `src`, mismo `viewBox` equivocado |
| Una clase de la base del proyecto | Misma regla ganadora en el reporte de los dos |
| Una regla de la librería que suprime algo | Mismo síntoma sin regla propia que lo cause |
| Un color fuera de la paleta | Mismo hexadecimal en componentes que no se conocen entre sí |

Cuando se repite, **decirlo dentro de la observación**: *"es el mismo archivo que ya apareció en
[componente], así que corregirlo una vez arregla los dos"*. Sube la prioridad de algo que aislado
parece trivial, y evita que dos equipos lo arreglen por separado de dos maneras distintas.

Si el usuario audita componentes de a uno, esta comparación **depende de lo que quedó en la sesión**;
cuando la sesión no alcanza, decirlo en vez de afirmar que el hallazgo es local.

## Comparar la disposición, no solo los elementos

La sonda mide elementos **de a uno**. Eso deja ciego al skill frente a una clase entera de
desviación: **cómo están dispuestos entre sí**. Dos elementos pueden tener cada uno su tamaño y su
color correctos, y estar en el lugar equivocado uno respecto del otro.

Falla real (2026-08-03): la pregunta de reenvío y su enlace se reportaron por separado —color y
tamaño— y nadie notó que en dev van **uno al lado del otro** mientras el diseño aprobado los
**apila**. El bloque medía 24 de alto contra 60, y eso corría todo lo de abajo.

```
Figma:  frame VERTICAL 500×60        dev:  contenedor 484×24, display block
        ├─ pregunta   y=400                ├─ pregunta   y=383.4
        └─ enlace     y=430                └─ enlace     y=384.2   ← misma fila
```

**Qué comparar, para cada grupo de hermanos:**

| Señal | En Figma | En el DOM |
|-------|----------|-----------|
| Dirección | `node.layoutMode` → `VERTICAL` / `HORIZONTAL` | `flex-direction`, o comparar las `y` de los hermanos |
| Separación | `node.itemSpacing` | `gap`, o la distancia entre bordes consecutivos |
| Alineación | `counterAxisAlignItems` | `align-items` / `justify-content`, o comparar centros |
| Orden | orden de `children` | orden en el DOM |

La prueba barata que lo detecta: **si dos hermanos comparten la `y` (±4px) son una fila; si comparten
la `x` son una columna.** Comparar eso contra el `layoutMode` del nodo equivalente en Figma.

```javascript
const mismaFila = Math.abs(a.y - b.y) < 4;      // dev
const figmaApila = nodo.layoutMode === 'VERTICAL';
if (mismaFila && figmaApila) → hallazgo de disposición
```

Un cambio de disposición casi nunca viene solo: altera el alto del bloque y desplaza todo lo que
sigue. Reportarlo **antes** que los corrimientos que provoca, o se documentan los síntomas y no la
causa.

---

## Comparar el ritmo, no solo los valores

Un hallazgo aislado casi nunca es la causa. Antes de reportar una medida que no coincide, comparar
**las posiciones verticales de todos los bloques** entre dev y el diseño. Dos errores opuestos se
cancelan y dejan un residuo chico que parece trivial.

Caso real (modal de verificación, 2026-08-03):

```
contenedor:  dev 409px   ·  aprobado 404px   →  +5px, parece nada
pero:
  bloque de textos   dev +24px   (la bajada cae en dos líneas)
  campo → botones    dev −20px   (el tramo está comprimido)
                                 ────────
                                    +5px  ← el residuo visible
```

Reportar solo "+5px de alto" habría mandado a dev a ajustar el contenedor, rompiendo las dos causas
reales. **La suma de las diferencias por bloque tiene que dar la diferencia total**; si no da, falta
un hallazgo.

Cómo se obtiene: medir `getBoundingClientRect()` de cada bloque relativo a la raíz del componente, y
las posiciones equivalentes en Figma con `node.x/y` relativos al frame. Comparar los **tramos entre
bloques**, no solo los tamaños.

---

## Etiqueta Tipo — casi siempre una sola

`paridad-diseno-desarrollo` solo ve estilos computados. De las cuatro categorías de `documentacion-handoff`:

| Etiqueta | ¿La puede determinar paridad-diseno-desarrollo? |
|----------|----------------------------------|
| **Jerarquía Visual y Consistencia** | Sí — medidas, color, tipografía, espaciado. Es el destino del ~95% de los hallazgos. |
| Diseño de Interacción | Parcial — solo si compara estados (hover/focus/disabled) y uno falta o está mal |
| Navegación e Incorporación | No — requiere entender el flujo entre pantallas |
| Manejo de Errores y Textos | No — requiere el copy aprobado, que no está en los estilos |

**No forzar hallazgos en las categorías que no puede ver.** Si el usuario pide QA completa de
una pantalla, decir en una línea qué cubre este skill y qué queda para `documentacion-handoff` en modo
PROACTIVO con screenshot.

---

## Tolerancias — qué NO es hallazgo

Reportar diferencias irrelevantes destruye la señal. Umbrales:

| Propiedad | Tolerancia | Razón |
|-----------|-----------|-------|
| Medidas (padding, gap, radius, tamaños) | ≤ 0.5px | Redondeo de subpíxel y zoom del navegador |
| **Anchos de borde** | Comparar el **declarado**, nunca el computado | Chrome redondea el borde a píxel de dispositivo. Con `devicePixelRatio: 1.25` (Windows al 125%), un borde de `2px` computa `1.6px` y uno de `1px` computa `0.8px`. Verificado en producción: iba a producir 3 hallazgos falsos. Leer `window.devicePixelRatio` y declararlo en el reporte. |
| `line-height` | ≤ 1px | Figma y el navegador redondean distinto |
| Color | 0 — exacto tras normalizar a `rgb()` | Un hex distinto es un hex distinto |
| `font-weight` | 0 — exacto | Pero 400≡`normal` y 700≡`bold` son el mismo valor |
| `font-family` | Comparar solo la **primera** familia declarada | El stack de fallback no es una decisión de diseño |
| `box-shadow` | Comparar offset/blur con ≤1px, color exacto | Figma exporta sombras con más precisión que la útil |

Diferencia dentro de tolerancia → no es hallazgo, no va en la tabla, no se menciona.

---

## Mapeo a `codeSpec` de `figma_check_design_parity`

El schema de `codeSpec` **colapsa los tres veredictos en dos** campos:

```
TOKEN                    → tokens.usedTokens: ['--space-3', ...]
HARDCODED_MATCHES_TOKEN  ┐
HARDCODED_OFF_SCALE      ┴→ tokens.hardcodedValues: [{property, value}]
```

Es decir: **la distinción entre los casos 3 y 5 se pierde dentro de `codeSpec`**. Por eso el
skill mantiene los tres estados en su reporte propio y aplana a dos solo para la llamada.
Nunca al revés.

Resto del mapeo, desde la salida de la sonda:

| `codeSpec` | Origen en la sonda |
|-----------|-------------------|
| `spacing.paddingTop/Right/Bottom/Left` | `computed` de `padding-*`, sin la unidad |
| `spacing.gap` | `computed` de `gap` |
| `spacing.width` / `height` | `rect.width` / `rect.height` |
| `typography.fontSize` / `fontWeight` / `lineHeight` / `letterSpacing` / `fontFamily` | `computed` homónimo |
| `visual.backgroundColor` / `borderColor` | `computed`, convertido a hex |
| `visual.borderRadius` / `borderWidth` / `opacity` | `computed` homónimo |
| `visual.effects` | `box-shadow` parseado a `{type, offset:{x,y}, blur, color}` |
| `accessibility.renderedSize` | `[rect.width, rect.height]` |
| `accessibility.contrastRatio` | Calculado entre `color` y el `background-color` efectivo |
| `tokens.tokenPrefix` | Prefijo común de los tokens detectados, si hay uno |

`canonicalSource` va siempre en `'design'`: **Figma es la fuente de verdad**.

