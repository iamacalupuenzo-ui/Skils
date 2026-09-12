# Madurez del Sistema de Diseño

No todos los archivos están al mismo nivel. Algunos traen una librería publicada completa;
otros son un Figma en blanco donde las foundations, los tokens y los componentes se van
creando de a uno. **El skill se adapta al estado real del archivo, no al revés.**

El error a evitar es imponer las convenciones de un sistema maduro (nombres de token, kit de
anotación, estructura de páginas) sobre un archivo que todavía no los tiene — o peor, asumir
que existen y reportar como hallazgo algo que simplemente no fue creado todavía.

---

## Diagnóstico — antes de auditar o documentar

```javascript
await figma.loadAllPagesAsync();
const locales = await figma.variables.getLocalVariableCollectionsAsync();
const paint   = await figma.getLocalPaintStylesAsync();
const text    = await figma.getLocalTextStylesAsync();
const effect  = await figma.getLocalEffectStylesAsync();

// tokens remotos realmente en uso (ver figma-gotchas.md para el escaneo completo)
// kit de anotación disponible (ver components.md, Paso 0)

return {
  coleccionesLocales: locales.map(c => ({ nombre: c.name, modos: c.modes.length, vars: c.variableIds.length })),
  estilos: { color: paint.length, texto: text.length, efecto: effect.length },
  componentes: figma.root.children.reduce((n, p) =>
    n + p.children.filter(c => c.type === 'COMPONENT' || c.type === 'COMPONENT_SET').length, 0)
};
```

---

## Los cuatro niveles

### Nivel 0 — sin sistema
Sin variables, sin estilos, colores en hex crudo, componentes sueltos o inexistentes.

- **No reportar "falta el token" como hallazgo.** No hay sistema de tokens; el hallazgo real es
  que conviene crearlo.
- Documentar con valores literales. Son la única verdad disponible.
- Si el usuario quiere arrancar el sistema: proponer el orden **color → tipografía → espaciado
  → radio → efectos**, y crear una colección **local**.

### Nivel 1 — estilos sin variables
Hay paint/text styles pero no variables. Común en archivos anteriores a las variables de Figma.

- **Usar los estilos que existen**, no crear variables en paralelo: duplicar el sistema es peor
  que un sistema viejo.
- Reportar valores como **estilo + valor**, igual que se haría con token + hex.
- Migrar estilos a variables es una decisión del dueño del sistema, no un arreglo de paso.

### Nivel 2 — colección local parcial
Hay variables locales, pero no cubren todos los casos.

- **Acá sí se pueden crear los tokens faltantes**, porque la colección es local y editable.
- Respetar la convención de nombres que ya exista (`color/brand/default` vs `background/brand/medium`
  son sistemas distintos — no mezclar).
- Antes de crear: verificar que el token no exista con otro nombre. Un hex repetido en dos
  variables es deuda nueva.

### Nivel 3 — librería remota publicada
Los tokens vienen de un archivo publicado. `getLocalVariableCollectionsAsync()` devuelve `[]`
aunque todo esté tokenizado.

- **No se pueden crear variables ahí desde el archivo consumidor.** Crear una colección local
  para "completar" forkea el sistema: dos fuentes de verdad para el mismo color.
- Los tokens faltantes se documentan como **pendiente del dueño de la librería**.
- Distinguir siempre dos casos que parecen iguales y no lo son:

| Síntoma | Diagnóstico | Acción |
|---------|-------------|--------|
| hex crudo y **no existe** token con ese valor | falta el token | pendiente para la librería |
| hex crudo y **sí existe** un token con ese valor exacto | falta el vínculo | atarlo acá mismo |

El segundo caso solo aparece si se comparan los hex contra el catálogo de tokens. Es un arreglo
inmediato que se pierde si no se busca.

---

## Cuando el kit de anotación no está

`references/components.md` describe el kit de Lyse. En otro proyecto puede no existir.

1. Resolver por nombre (Paso 0) y **declarar qué falta**. No inventar reemplazos silenciosos.
2. Si falta todo el kit, preguntar antes de construir: puede haber uno propio con otros nombres,
   o el usuario puede querer importarlo.
3. Si no hay kit y hay que seguir, **construir nativo** — frames con autolayout y texto, como la
   tabla de specs. Renderiza siempre y no depende de librerías.
4. Dejar registrado en la documentación qué se usó, para que el próximo no adivine.

**Las claves de propiedad (`Tagline#23:82`, `↪ Text Note#112:10`) son de la librería de Lyse.**
En otro sistema no aplican: leer `componentPropertyDefinitions` del componente real.

---

## Regla general

Antes de reportar una carencia, ubicar el nivel. El mismo síntoma cambia de significado según
el nivel del archivo:

> *"Hover está en hex crudo"*
> — Nivel 0: irrelevante, no hay sistema todavía
> — Nivel 2: corregible acá, crear el token
> — Nivel 3: pendiente de la librería… **salvo que el token ya exista y solo falte atarlo**

Un hallazgo sin nivel de contexto manda al equipo a resolver el problema equivocado.
