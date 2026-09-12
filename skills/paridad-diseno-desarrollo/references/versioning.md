# Versioning — contrato para una QA con versión histórica

Se activa dentro del modo `DOCUMENTAR` cuando existe una versión histórica de la misma QA
(mismo componente, mismo estado, mismo viewport) y el usuario pide una nueva versión, una
actualización, o el mapeo de correcciones. Leer este archivo completo antes de escribir nada.

Si no existe versión histórica que mapear, este archivo no aplica: seguir el protocolo
estándar de `DOCUMENTAR` en `SKILL.md` con `references/figma-build.md`.

---

## Contrato de versiones dentro de una QA existente

Cuando el usuario entregue una página QA con una versión histórica y pida una nueva versión,
esa página es el **patrón visual obligatorio**. Antes de escribir:

1. Leer y capturar la versión histórica completa; inventariar header, secciones, paneles de
   desarrollo, clon aprobado, marcadores, leyendas, observaciones, divisor y footer.
2. Mapear cada observación histórica a `RESUELTA`, `PERSISTE`, `REGRESIÓN`,
   `NO REPRODUCIBLE` o `CONTRA DISEÑO`.
3. Medir la composición de referencia de la página QA y conservar su patrón espacial. Salvo que
   el usuario indique expresamente otra disposición, es obligatorio: versión histórica a la
   **izquierda**, checklist de seguimiento en el **espacio central**, y nueva versión a la
   **derecha**. Las cabeceras de ambas versiones deben compartir el mismo `y`; la checklist no
   va debajo de ninguna versión. Ejemplo validado: `V1 x=0, w=1520` → `checklist x=1640, w=516`
   → `V2 x=2200, w=1520`, todas en `y=0`.
4. Crear la checklist con instancias del kit en ese espacio central. `RESUELTA` se marca;
   `PERSISTE` y `CONTRA DISEÑO` quedan desmarcadas y nombradas. Debe representar el mapeo
   de V1 a VN, no una lista genérica ni una copia desconectada.
5. Crear `[Componente] Observaciones Versión N (YYYY-MM-DD)` como un nuevo frame a la derecha,
   dentro de la misma página QA. Nunca mover, renombrar, editar ni reutilizar la versión histórica.

## Contrato de contenido para una versión posterior (`N ≥ 2`)

Una Versión 1 documenta una inspección inicial: qué se midió y qué se encontró contra el diseño.
Una Versión 2 o posterior documenta un **seguimiento**: qué ocurrió con los hallazgos de la versión
anterior y qué diferencias nuevas aparecieron. No reutilizar el relato, los títulos ni los resúmenes
de V1 en una versión posterior; hacerlo oculta el progreso y vuelve inservible la checklist central.

### Cuándo aplicar este contrato

Aplicarlo siempre que exista una versión histórica del mismo componente, estado y viewport y el
usuario pida una nueva versión, una actualización o el mapeo de correcciones. Antes de escribir,
leer del ejemplo de referencia de la misma QA o del estándar entregado por el usuario, en este orden:
header, las tres `Section`, paneles de evidencia, observaciones, enlace, divisor y footer. No inferir
la estructura desde V1 ni inspeccionar solo las coordenadas: leer también títulos y textos.

### Estructura obligatoria de texto

Mantener el header del componente y usar estas tres secciones, en este orden, adaptando solo datos
medidos. Los títulos no son opcionales:

| Orden | Tagline | Título obligatorio | Debe explicar |
|---|---|---|---|
| 1 | `CONTEXTO` | `Revisión histórica y estado actual` | Cuántas observaciones de V(N-1) se revalidaron; `devicePixelRatio`, cobertura de tokens y hojas sin auditar actuales. |
| 2 | `1 · COMPARACIÓN` | `Versión N-1 contra Versión N` | Conteos: resueltas, persisten, regresiones, no reproducibles, contra diseño y hallazgos nuevos. |
| 3 | `2 · OBSERVACIONES` | `Qué queda pendiente` | Solo pendientes de desarrollo, pendientes de diseño y hallazgos nuevos; declarar que la numeración coincide con Marker y Comment. |

Usar los conteos de la matriz histórica, nunca estimarlos. Ejemplo válido:
`De 10 observaciones históricas, 9 persisten en desarrollo y 1 corresponde a una corrección pendiente
en diseño. La Versión 2 añade 1 hallazgo nuevo: [diferencia medida].`

En V2 quedan prohibidos los títulos de inspección inicial: `Qué se revisó y cómo`, `Desarrollo contra
diseño aprobado` y `Qué corregir en desarrollo`. Solo son correctos cuando no existe una versión
histórica que mapear.

### Evidencia, checklist y observaciones

- En los paneles de desarrollo conservar solo markers de diferencias vigentes o nuevas, medidos en
  la corrida actual. `RESUELTA` se representa en la checklist, no como defecto repetido en VN.
- Dividir paneles por tipo de desviación solo para resolver colisiones de markers; cada rótulo debe
  declarar el tipo. Esta división no reemplaza la sección `Versión N-1 contra Versión N`.
- La lista `Observaciones` contiene solo puntos vigentes y nuevos. Cada Comment conserva el número
  de su Marker y Note; un punto `CONTRA DISEÑO` debe indicar que desarrollo no debe cambiarse.
- La checklist central enumera todos los puntos de V(N-1), marca solo `RESUELTA` y nombra el estado
  de los demás. Identificar hallazgos nuevos como nuevos, no como puntos heredados.

Para este modo de versionado se permite duplicar la **estructura de la versión anterior** solo
dentro de la misma página QA, siempre que se reemplacen en la misma corrida la captura, el clon,
los rects, markers, leyendas, observaciones y enlaces de la medición actual. Nunca reutilizar una
captura, marcador, comentario o offset de la versión anterior.

### Bloqueantes de calidad para DOCUMENTAR

No crear una versión parcial ni usar texto o frames improvisados cuando el kit contiene el
componente correspondiente. Antes de cerrar deben existir todos estos elementos:

- Captura actual de desarrollo por HTTP+CORS en un panel `Desarrollo`; si el servidor de captura
  o `fetch` de Figma falla, detenerse antes de crear la nueva versión y declarar el bloqueo.
- Un clon vectorial del nodo aprobado en `Diseño aprobado`.
- Un `Marker` al ras de cada rect medido y una `Handoff — Note` con el mismo número.
- Un `Comment` con el mismo número, variante de severidad y `Etiqueta Tipo` correctas.
- Paneles de desarrollo divididos por tipo de desviación cuando los badges sigan colisionando
  después de reanclarlos. No ocultar markers ni sustituirlos por una lista.
- Header, Section, Divider, Footer y enlaces como instancias del kit QA. Si falta una definición,
  detenerse y declararla; no fabricar un reemplazo visual.

La verificación final requiere tres capturas: composición completa `V1 | checklist | VN`, versión
nueva completa y un overlay del navegador con los rects de los markers. Confirmar con coordenadas
que `V1.x < checklist.x < VN.x`, que `abs(V1.y - VN.y)` sea como máximo 8 px, que la checklist no
invada ninguno de los dos frames, que cada marker señale su elemento, que no haya recortes ni
solapamientos y que la numeración sea 1:1:1. Una composición vertical `V1 → checklist → VN` queda
prohibida salvo instrucción explícita del usuario. Para `N ≥ 2`, verificar además que las tres
secciones tengan los taglines y títulos del contrato de contenido, que sus conteos coincidan con la
checklist y que no queden títulos de inspección inicial.
Sin esas tres verificaciones, la salida es incompleta y no se puede declarar DOCUMENTAR terminado.
