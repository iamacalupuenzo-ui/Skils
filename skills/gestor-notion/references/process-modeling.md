# Modelado de procesos y flujos — cómo mapear, relacionar y evaluar

Referencia para cualquier trabajo sobre Process OS o sobre cualquier sistema de procesos
en Notion. Escrito tras la reestructuración del 2026-08-02, que desarmó un modelo que
llevaba meses generando duplicación silenciosa.

Léelo **antes** de crear una BD de procesos, agregar un flujo nuevo o "limpiar duplicados".

---

## 1. El error de modelado más común

**Flujo y Proceso no son niveles de una jerarquía. Son dos ejes distintos.**

La jerarquía formal de procesos ([APQC PCF](https://www.apqc.org/process-frameworks), el
marco de referencia estándar) tiene cinco niveles:

```
Categoría → Grupo de procesos → Proceso → Actividad → Tarea
```

La palabra *flujo* no aparece. En BPM el flujo (workflow) no es un nivel de detalle sino
la **coordinación** del trabajo: un proceso *tiene* un flujo. El flujo no contiene
procesos ni cuelga de ellos.

Cuando alguien intenta meter "Flujo" en la jerarquía —da igual si lo pone arriba o
abajo de "Proceso"— el modelo empieza a producir duplicación. Es inevitable, y es la
señal de diagnóstico más confiable que existe.

### El modelo correcto

```
EJE 1 — Qué trabajo existe (jerárquico)
   Proceso  →  Paso

EJE 2 — Cómo se ejecuta según el encargo (ruta)
   Flujo  →  ordena y agrupa pasos en fases
```

- **Flujo** = la ruta que se recorre según el tipo de encargo. Es el **padre real de los pasos**.
- **Proceso** = clasificador transversal. Responde "¿de qué tipo de trabajo es este paso?".
  NO es el padre.
- **Fase** = la subdivisión interna de un flujo. Agrupa pasos dentro de la ruta.
- **Paso** = la unidad de trabajo. Lleva `Flujo`, `Proceso`, `Fase` y `Orden`.

Con este modelo puedes preguntar *"muéstrame todo el Handoff en todas las rutas"*
filtrando por `Proceso`, sin romper el orden de ningún flujo.

---

## 2. Cómo diagnosticar un modelo existente

Aplica esta secuencia antes de tocar nada. Cada síntoma tiene una causa estructural
concreta — no los trates como datos sucios.

| Síntoma observado | Qué significa realmente |
|---|---|
| El mismo paso existe 2+ veces con nombre idéntico | La relación real es muchos-a-muchos y se la forzó a 1-a-N |
| El mismo skill/recurso cargado 2+ veces | Igual: se necesita en dos rutas y solo se podía vincular a una |
| Un select con "Fase 1" repetido con distintos significados | Falta el nivel que da contexto; el número pertenece a la ruta, no al paso |
| Órdenes duplicados (dos "3") o con saltos (10, 15, 40) | Nadie es dueño de la secuencia; el orden se editó a mano sin criterio |
| Un campo select y una relación con el mismo nombre | Migración a medias: el dato vive en dos lados |
| Pasos colgados de un padre que no les corresponde | Nada valida la coherencia padre-hijo; ya hay corrupción real |
| Un mismo nivel usado de dos maneras en distintas ramas | La inconsistencia raíz. Ver abajo |

### La inconsistencia raíz

El caso más difícil de ver: **el mismo nivel jerárquico usado de dos maneras opuestas**.

En Process OS, el flujo FDPY tenía 3 "procesos" (Discovery, Sprint de Diseño, Handoff)
que en realidad eran sus fases. En cambio FED tenía 1 solo proceso con fases internas.
Misma estructura, dos usos distintos. Eso es lo que hace que el dueño del sistema sienta
que "algo no encaja" sin poder nombrarlo.

Cuando lo detectes, no lo resuelvas eligiendo un uso: resuélvelo separando los ejes.

---

## 3. Cómo mapear un flujo nuevo

1. **Crea el flujo primero**, con `Abreviatura`, `Descripción` y —lo más importante—
   **`Cuándo usarlo`**. Ese campo es el que responde la pregunta operativa real:
   *"¿corro el flujo completo o solo un proceso suelto?"*. Un flujo sin ese campo escrito
   es un flujo que nadie va a saber cuándo usar.
2. **Define las fases** de ese flujo. Si el flujo tiene una sola fase continua, está bien
   — no la fuerces a subdividirse.
3. **Crea los pasos** con `Orden` global dentro del flujo (1..N corrido, sin saltos ni
   repetidos). El orden es del flujo, no del proceso.
4. **Clasifica cada paso** con su `Proceso`. Un paso puede tocar más de uno.
5. **Vincula skills y herramientas** al paso, no al proceso — el paso es donde ocurre
   el trabajo.

### Duplicación intencional vs. basura

**No toda duplicación es un error.** Distinguirlas es crítico:

- **Intencional**: el mismo trabajo con distinta profundidad en dos rutas. En Process OS,
  `Brief de Dirección Visual — FDPY` y `— FDR` son pasos distintos: la versión PRO es más
  profunda que la Rápida. **Se marcan con sufijo de flujo en el nombre y se conservan.**
- **Basura**: dos copias donde **ambas** están sin vincular a nada, o una copia idéntica
  colgada del padre equivocado. Producto de doble carga (típicamente, trabajar desde dos
  máquinas). Se archivan.

Antes de "limpiar duplicados", verifica a qué apunta cada copia. Si apuntan a rutas
distintas, son legítimas.

### Huérfanos legítimos

Un skill o recurso **sin proceso asociado es válido**. Se usa bajo necesidad puntual y
no pertenece a ninguna ruta. No los limpies por el solo hecho de estar sueltos.

---

## 4. Cómo evaluar una BD de procesos

Checklist de auditoría. Consigue estos datos en **una sola query** — ver límites abajo.

```sql
SELECT "Paso", "Flujo", "Proceso", "Fase", "Orden", "Skills & Marcos", url
FROM "collection://..." ORDER BY "Flujo", "Orden"
```

Luego verifica:

- [ ] ¿Cada paso tiene flujo? Los que no lo tienen son los sospechosos.
- [ ] ¿El `Orden` es corrido dentro de cada flujo, sin repetidos ni saltos?
- [ ] ¿Hay pasos con nombre idéntico? Revisa a qué flujo apunta cada uno.
- [ ] ¿Algún paso cuelga de un proceso de otro flujo? Corrupción real.
- [ ] ¿Hay flujos sin pasos, o procesos sin pasos? Hueco a llenar o resto a archivar.
- [ ] ¿Las relaciones opcionales (Herramientas, Templates) están vacías en toda la BD?
      Un campo vacío al 100% es un campo que nadie usa: o se llena o se quita.
- [ ] ¿El campo `Status` tiene un solo valor en todas las filas? Entonces no informa nada.
- [ ] ¿La nomenclatura es consistente? (sufijo de flujo en unos sí y en otros no)

---

## 5. Límites técnicos de la API de Notion

Descubiertos en producción. Ahorran horas.

### Queries SQL — funcionan, pero con cuota

`notion-query-data-sources` **sí funciona** en workspaces sin plan Business, contra lo que
decía una nota vieja. Acepta SELECT, GROUP BY, COUNT, HAVING y WHERE con parámetros sobre
un único data source.

**Pero hay una cuota mensual** y se agota rápido (~8 queries en una sesión de trabajo
intenso). Cuando se agota devuelve *"Your workspace has reached the usage limit for Query
Data Source"*.

→ **Pide todas las columnas que vas a necesitar de una sola vez.** No hagas queries
exploratorias incrementales. Cuando la cuota se acabe, el único fallback es `notion-fetch`
página por página.

Consultas que cruzan varios data sources requieren Enterprise.

### Vistas — el DSL tiene agujeros importantes

- **No se puede filtrar por una propiedad de tipo relación.** `FILTER "Flujo" = "..."` se
  acepta sin error pero **no se aplica** — ni con el nombre de la página ni con su URL.
  → Workaround: filtra por un `select` que codifique la misma información. Por eso las
  fases de Process OS llevan prefijo de flujo (`FDPY · Discovery`): existe para que los
  filtros de vista sean posibles.
- **`CLEAR FILTER` no borra los `simpleFilters` preexistentes.** El filtro nuevo se agrega
  como `advancedFilter` y ambos se combinan con AND. Una vista con filtro viejo por
  relación es, en la práctica, irreparable por API.
- **No existe forma de eliminar una vista por API.** Si una vista quedó inservible, hay que
  crear una nueva y **pedirle al usuario que borre la vieja a mano**. Avísale con los
  nombres exactos, y usa un prefijo distintivo en las nuevas para que no se confunda.
- Filtros con OR sobre `select` sí funcionan: `FILTER "F" = "a" OR "F" = "b"`.

### Cambios de schema

- `ALTER COLUMN "X" SET SELECT(...)` **conserva los valores de las filas si los nombres de
  opción coinciden exactamente**. Si renombras una opción, todas las filas que la tenían
  quedan vacías. Para agregar una opción, repite las existentes idénticas + la nueva.
- `DROP COLUMN` sobre un select cuyo dato ya migró a una relación es seguro.
- `RENAME COLUMN` es reversible y no toca datos. Úsalo para reflejar cambios de rol
  (`Proceso padre` → `Proceso` cuando deja de ser el padre).

### Archivar páginas

No hay operación de papelera. Para sacar filas de una BD sin borrarlas:
`notion-move-pages` hacia una página de archivo. Salen de la base y de todas sus vistas,
conservando el contenido. Crea la página de archivo con una nota de qué se retiró y por qué.

### Otros

- `notion-create-pages` falla si el JSON trae saltos de línea sin escapar en `content`.
  Arma el contenido en una sola cadena con `\n`.
- Al crear relaciones con `RELATION('ds_id', DUAL 'nombre_inverso')`, la propiedad inversa
  se crea sola en la otra BD. Verifica que el nombre inverso no colisione con uno existente
  (`Flujo` singular vs `Flujos` plural convivieron sin problema).
- Actualizar una relación desde el lado que tiene menos filas es mucho más barato: 5
  llamadas seteando arrays completos en vez de 35 llamadas una por fila.

---

## 5b. Decisión abierta — ¿sobrevive la BD Procesos? (2026-08-02)

**No ejecutar sin decisión explícita de Enzo.** Está en observación deliberada.

Enzo planteó que la BD `Procesos & SOPs` podría ser innecesaria, y el análisis le da
buena parte de la razón:

| Flujo | Procesos | Fases | ¿1 a 1? |
|---|---|---|---|
| FDPY | 3 | 3 | sí |
| GP | 1 | 1 | sí |
| FDR | 2 | 4 | no |
| FDER | 1 | 4 | no |
| FED | 1 | 4 | no |

Lo único que `Proceso` aporta y `Fase` no: es **transversal entre rutas**. "Handoff Dev"
significa lo mismo en FDPY y FDR, mientras que `FDPY · Handoff` y `FDR · Handoff` son
opciones de select sin relación entre sí.

Pero esa separación existe **solo porque las fases llevan prefijo de flujo**, y el prefijo
existe para sortear que el DSL de vistas no filtra por relación. Si el prefijo se quitara,
`Proceso` sería genuinamente redundante.

**Por qué no se tocó:** eliminarlo implica reubicar ~47 vínculos de skills y las
descripciones con el output de cada proceso, y el modelo nuevo todavía no se usó.

**Criterio de decisión acordado:** usar el sistema unas semanas. Si Enzo nunca filtra por
`Proceso` en ese tiempo, se elimina con evidencia. Si lo usa, se queda y conviene renombrar
la BD — "SOP" describe un procedimiento ejecutable, y eso ahora son los Flujos; lo que
queda ahí son categorías de trabajo.

---

## 6. Orden de trabajo recomendado

Cuando toque reestructurar un sistema de procesos:

1. **Diagnostica con datos**, no con impresiones. Una query, la tabla completa.
2. **Declara el modelo antes de tocar nada** y consíguelo aprobado. Es la decisión que
   condiciona todo lo demás.
3. **Crea la estructura nueva** (BDs y relaciones) antes de migrar datos.
4. **Migra vinculando**, no borrando.
5. **Renumera el orden** al final, cuando todo está en su flujo.
6. **Repara lo corrupto** y archiva, con confirmación explícita del usuario.
7. **Rehaz las vistas** — y cuenta cuáles tiene que borrar él a mano.
8. **Deja constancia** de los huecos que quedaron abiertos. No inventes contenido de
   proceso que no conoces: si un proceso quedó sin pasos porque retiraste los que estaban
   mal, dilo y pide que los defina el dueño del sistema.
