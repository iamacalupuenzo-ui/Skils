# Decisiones — Por Qué la Skill Hace lo Que Hace

Registro de las decisiones tomadas con el usuario y validadas contra componentes
reales. Cada una lleva **qué la disparó**, para poder revisarla si el contexto cambia.

Leer al iniciar cuando haya que resolver algo que las reglas no cubren: el criterio
de fondo está acá, no en los procedimientos.

---

## D1 · El nodo es la única fuente de verdad

Todo valor sale de la API de Figma. Ni de un screenshot, ni de una sesión anterior, ni
de conocimiento general de otro design system.

**Disparador:** el objetivo declarado es que dev construya sin abrir Figma y sin
preguntar. Un valor estimado rompe eso sin que nadie lo note.

**Costo aceptado:** si el nodo no se puede leer, no se documenta. Un documento
incompleto es recuperable; uno con un valor falso, no.

---

## D2 · Verificar por cálculo antes de afirmar un defecto

Una coordenada rara no es un defecto. Obtener el valor esperado y comparar.

**Disparador:** reporté "vector descentrado, `x: 4`". El centro ideal era `3.83` —
desvío de `0.17px`. **Estaba centrado.** También sospeché desalineación entre dos
textos que centraban ambos en `171` por mecanismos distintos.

**Consecuencia:** un falso positivo hace que dev "arregle" algo que funciona. En ese
caso concreto lo habría llevado a usar `position: absolute` sin necesidad.

Umbrales en `extraction.md`. La regla vale para cualquier afirmación de defecto, no
solo centrado: **si se puede calcular, se calcula.**

---

## D3 · Valores en crudo, no tokens

**Disparador:** el usuario lo dijo explícito — *"el DS no se respeta en desarrollo, ese
es el problema"*.

Un token describe una intención que el código no cumple. El hex describe lo que hay
que construir. Escribir `color/accent/default` cuando dev no tiene ese token lo obliga
a traducir, y traduce mal o pregunta.

**Importante:** no depende de si el archivo tiene variables. Un componente de librería
externa puede tener tokens en su origen y la política no cambia.

**Revisar si:** el equipo empieza a implementar contra el DS. Ahí el crudo pasa a ser
el problema.

---

## D4 · Dos modos: NORMAL y AVANZADO

NORMAL omite los contenedores sin expresión visual. AVANZADO documenta todo y suma
Reconstrucción.

**Disparador:** el usuario señaló que `D — Header · 238x48 · fill container · gap 16`
no le aportaba nada a quien construye la pantalla.

**Efecto lateral que no se anticipó:** al sacar contenedores, los textos suben a
primer nivel y **se pueden anclar con línea guía**. Un problema de anotación que
arrastrábamos hacía tres iteraciones se resolvió por reducción, no por más flechas.

**Lección general:** cuando un elemento no se puede anclar, revisar la jerarquía antes
de buscarle lugar. Suele ser que no es hermano de los otros.

---

## D5 · Unidad gráfica ≠ caja negra

Un frame cuyos hijos son solo vectores se documenta como hoja — pero **sus parámetros
de render se extraen igual**.

**Disparador:** escribí un SVG del anillo de progreso con `r=28`, `stroke-width=2` y
`4`. Los valores reales eran `28.69`, `2.21` y `6.62`. **Los tres inventados.** El arco
era 65% más grueso de lo documentado.

El grosor no estaba en ninguna propiedad visible: el `INTERSECT` reporta su propio
`fill` y tapa el de sus hijos. Había que bajar un nivel más.

**Consecuencia:** "no listar capas" se había convertido en permiso para no extraer.
Ahora la regla es explícita y prohíbe redondear a enteros prolijos.

---

## D6 · Una alerta solo si cambia lo que dev escribe

**Disparador:** el usuario preguntó *"¿esto es realmente necesario?"* sobre 4 alertas.
Al revisarlas, **3 sobraban**. Las había escrito porque las descubrí, no porque dev
las necesitara.

| Alerta | Prueba | Destino |
|---|---|---|
| Área táctil `24×48` → `44×48` | Sí, es instrucción | A la fila de esa capa |
| Texto 20px fuera del centro | No — flex ya lo produce | Reconstrucción |
| "En Figma el arco se recorta con 2 rectángulos" | No | Nunca |
| Faltan estados | Sí — dice qué no construir | `TODO` |

La segunda era la peligrosa: dev habría metido un margin de compensación que rompe el
layout.

**Criterio de fondo:** estaba mezclando dos audiencias en un mismo bloque. El diseñador
necesita saber que está mal armado; dev necesita saber cuánto mide. Ese corte **es** la
diferencia entre los modos.

---

## D7 · Cada dato tiene un solo dueño

| Dato | Único lugar |
|---|---|
| Medidas, spacing, colores, tipografía | La anotación |
| Anatomía por capa | La leyenda de la anotación |
| Pendientes y su estado | Observaciones |
| Qué es y cuándo se usa | Apertura |
| Tokens, API, cobertura detallada | El markdown |

**Disparador:** el mismo `TODO` apareció en la leyenda del redline y en la tarjeta de
Observaciones de la misma página.

**Por eso también se rechazó "ambos idiomas"**: `deshabilitado (disabled)` es el mismo
dato dos veces. A la tercera regeneración alguien actualiza uno solo.

Excepción: un valor puede repetirse si **es el tema** de la observación —
"tokenizar `#D41117`" necesita nombrar el color.

---

## D8 · Español para leer, inglés para tipear

**Disparador:** escribí `deshabilitado, hover, foco y activo` — traduje dos de cuatro.
Arbitrario, y obliga a dev a adivinar si `deshabilitado` es `disabled` o `readonly`.

**Prueba:** ¿esta palabra va a aparecer tal cual en el código? Si sí, no se traduce.

Los estados son el caso que más se equivoca: se sienten descripciones pero terminan
siendo props y pseudo-clases.

---

## D9 · Nunca escalar una anotación

`rescale()` cambia la geometría pero no el significado de las etiquetas.

**Disparador:** escalé la anotación `1.22×` para que se leyera dentro de la página.
Quedó diciendo `342px` mientras dibujaba `419px`.

**Por qué es grave:** no se detecta leyendo. El número sigue ahí y se ve prolijo. Lo
detectó el usuario porque conoce el componente; dev nunca lo habría notado.

Si no se lee, se rehace más grande. Y se mide el componente después de cualquier
operación de layout.

---

## D10 · La librería no se toca

| Página | Rol |
|---|---|
| `Componentes` | Librería. De acá se **toman** instancias |
| `Handoff` | Todo lo que se produce |

**Disparador:** creé la primera página de documentación en `Componentes` porque usé
`figma.currentPage` sin verificar.

**Corolario:** si aparecen artefactos de trabajo en la librería, **moverlos, no
borrarlos**. Pueden ser del usuario.

---

## D11 · Los entregables no compiten

| Artefacto | Responde | Para |
|---|---|---|
| Anotación | cuánto mide | Construir |
| Página de documentación | qué es, cómo se compone, qué falta | Entender |
| Markdown | tokens, API, cobertura | Versionar con el código |

**Disparador:** el usuario mostró que la anotación debía ir **dentro** de la página, no
en una sección aparte. Un solo artefacto: dev abre una página y tiene todo.

Mi versión tenía un botón "Ver anotación" que no llevaba a ningún lado. **Un enlace
que apunta a lo que ya está abajo enseña a desconfiar de los enlaces.**

---

## D12 · Componentizar la composición, no documentarla

Cuando un frame mezcla un componente real con armado de pantalla, se separa: se crean
los componentes que faltan y el envoltorio queda como composición.

**Disparador:** `Verificación — contenido` tenía adentro un component set de librería
con 7 estados y, al lado, frames sueltos con nombres automáticos.

**Método seguro:** clonar el layout, `createComponentFromNode`, insertar la instancia
en el índice original, mover el componente al área de staging. **Verificar por captura
que el render no cambió.**

Los componentes nuevos van a un área aparte, no directo a la librería: la decisión de
publicarlos es del usuario.

---

## D13 · Corregir en Figma, con evidencia

La skill puede arreglar defectos de construcción **medibles**. No puede tomar
decisiones de diseño.

| Se corrige solo | Requiere al usuario |
|---|---|
| Valor muerto (`itemSpacing` bajo `SPACE_BETWEEN`) | Cambiar una medida visible |
| Relleno gris por defecto de Figma tapado | Redistribuir el layout |
| Ancho fijo donde debe ser `fill` | Reservar espacio para centrar |
| Nombres automáticos y ajenos | Borrar capas |

**Disparador:** el track del anillo tenía `#D9D9D9` (gris por defecto de Figma) tapado
por el arco. Invisible en `2/2`, un disco gris en `1/2`.

Toda corrección se reporta con el valor anterior y el nuevo.

---

## D14 · Los estados se renderizan, no se listan

Si un componente tiene variantes de estado, la página lleva un bloque con **cada
estado instanciado y etiquetado**. La lista de texto no alcanza.

**Disparador:** documenté los 7 estados de `Verification code` como filas de leyenda.
El usuario señaló que faltaban. Al instanciarlos aparecieron **dos defectos que la API
no mostraba**:

| Hallazgo | Por qué no se veía leyendo propiedades |
|---|---|
| Los estados de error renderizan **dos** notificaciones | `Error notification` y `Help notification` figuran ambas con `visible: true`. Leído como dato parece correcto; renderizado se ven dos líneas |
| El copy es `Information text` en los 7 estados | Un placeholder se lee como cualquier otro string |

**Regla:** instanciar cada variante desde el component set — no clonar una instancia
existente, que puede traer overrides del uso en pantalla.

```javascript
const set = await figma.getNodeByIdAsync('SET_ID');
for (const v of set.children) {
  const inst = v.createInstance();   // renderizado canónico de la variante
}
```

**Principio de fondo:** extraer propiedades responde *cuánto mide*. Solo renderizar
responde *qué se ve*. Un componente con variantes necesita las dos preguntas.

Vale también para el sub-componente: si una variante contiene otro component set
(`Help notification`, 8 variantes), ese se muestra aparte. Sin eso, dev construye dos
componentes donde hay uno.

---

---

## D15 · Todo componente en página de handoff va dentro de un contenedor

Cuando se muestra un componente como referencia visual en una página de documentación
(no en el apartado de anotación), debe colocarse dentro de un Frame contenedor que:

| Propiedad | Valor |
|---|---|
| Ancho | `800px` (ancho estándar de página) o el del layout contenedor |
| Alto | `auto` — suficiente para centrar verticalmente |
| Fill | transparente |
| Layout | `NONE` (posicionamiento absoluto) |

El componente se centra dentro del contenedor:

```javascript
const contenedor = figma.createFrame();
contenedor.name = 'Componente — [nombre]';
contenedor.resize(800, alturaDelComponente + paddingVertical * 2);
contenedor.fills = [];

const comp = componenteOriginal.clone();
// o: const comp = variant.createInstance();
contenedor.appendChild(comp);
comp.x = (contenedor.width - comp.width) / 2;
comp.y = paddingVertical;   // ej. 62px de margen superior
```

**Disparador:** el componente `Encabezado de verificación` (342×56) se colocó sin
contenedor a `(0,0)` dentro del Frame y quedó descolocado. Al ponerlo dentro de un
Frame `800×180` centrado en `(229, 62)` se visualizó correctamente.

| Sin contenedor | Con contenedor |
|---|---|
| El componente queda pegado al borde | Centrado, se ve como una unidad |
| Difícil de distinguir del fondo | Tiene un "aire" visual propio |
| La anotación no tiene referencia de layout | La anotación se posiciona relativa al contenedor |

**Regla general:** la altura del contenedor se define como `alturaDelComponente + 124`
(62px arriba + 62px abajo) como valor base. Si el componente es muy grande (ej.
mayor a 300px de alto), se puede reducir el padding vertical manteniendo el centrado.

```
alturaContenedor = max(180, alturaComponente + 124)
```

**Excepción:** el contenedor se omite si el componente ya ocupa todo el ancho de la
página (ej. un frame de 800px que ya tiene su propio padding). En ese caso no se
gana nada envolviéndolo.

---

## Errores Cometidos — No Repetir

| # | Qué pasó | Regla que lo evita |
|---|---|---|
| 1 | Reporté un desvío de `0.17px` como defecto | D2 |
| 2 | Inventé `r=28`, `stroke-width=2` y `4` en un SVG | D5 |
| 3 | Escalé una anotación y las etiquetas quedaron mintiendo | D9 |
| 4 | Creé documentación dentro de la librería | D10 |
| 5 | Duplicé el mismo `TODO` en dos bloques de una página | D7 |
| 6 | Traduje 2 de 4 nombres de estado | D8 |
| 7 | Oculté un botón y el título se fue al centro | Captura obligatoria |
| 8 | Coloqué componente suelto en la página sin contenedor | D15 |

Los tres primeros tienen algo en común: **el artefacto se veía correcto.** Por eso la
verificación no es opcional y la captura va después de cada cambio.
