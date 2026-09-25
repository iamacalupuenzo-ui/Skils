# Sistema de diseño: Comsatel DS

Leer después de `../design-system-contract.md` cuando el sistema elegido para el
proyecto es Comsatel DS. Aquí están los datos exactos de este sistema: paquete,
registro, estilos, tipografía y recetas de composición. Su mantenedor es el skill
`comsatel-design-system`.

## Límite de responsabilidad

La aplicación es dueña de sus dominios, datos, rutas, autenticación, reglas de
negocio y composiciones. La librería es dueña de sus componentes, tokens y
contrato público. Nunca se copia `projects/comsatel-ds/`, `src/app/`, demos,
Storybook ni CSS interno hacia una aplicación consumidora.

Antes de elegir componentes, leer el `README.md` instalado en
`node_modules/@iamacalupuenzo-ui/comsatel-ds/` o su fuente pública en
`https://github.com/iamacalupuenzo-ui/Comsatel-DS`. Esa es la API vigente; no
inventar imports ni mantener una lista duplicada dentro de este skill. El
consumidor se guía por esa superficie pública y sus tipos: no consulta fuentes
privadas ni solicita un token con alcance `repo` para inferir una composición.

## Proyecto existente o nuevo

1. Si el usuario da un repositorio destino, leer su `package.json`, rutas,
   scripts, arquitectura y cambios pendientes antes de editar.
2. Si no existe un destino y pidió una pantalla o flujo durable, crear una
   aplicación Angular limpia en la ruta aprobada:

   ```sh
   npx @angular/cli@22 new nombre-de-la-aplicacion --routing --style css --standalone --strict --skip-git
   ```

3. Una pantalla aislada sigue siendo una aplicación consumidora: no se crea
   dentro del repositorio del Design System ni se convierte una demo en base de
   producto. Si la ruta de creación cambia el alcance del usuario, pedirla.

## Instalación permitida

El repositorio consumidor solo declara qué scope usa GitHub Packages. Este
archivo se versiona porque no contiene secretos:

```ini
@iamacalupuenzo-ui:registry=https://npm.pkg.github.com
```

La credencial se configura una vez por usuario de Windows en `~/.npmrc` y
referencia una variable de entorno, sin guardar el valor del token en ningún
repositorio:

```ini
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

Si el usuario aún no creó la variable persistente, indicarle este único comando
con un placeholder, sin pedir ni repetir el secreto. `"User"` es literal; no
se reemplaza por el nombre de Windows:

```powershell
[Environment]::SetEnvironmentVariable("GITHUB_PACKAGES_TOKEN", "<token>", "User")
```

Una terminal, Codex u otra aplicación que ya estuviera abierta conserva el
valor anterior. Tras cambiar la variable, reiniciar el proceso que ejecutará
`npm` y verificar la cuenta sin imprimir el token:

```powershell
npm whoami --registry=https://npm.pkg.github.com
```

Instalar una versión explícita, nunca `latest` ni un rango automático en la
primera adopción:

```sh
npm install @iamacalupuenzo-ui/comsatel-ds@<version>
```

El token clásico de instalación requiere únicamente `read:packages`. Si el
paquete no expone una API, estilo o ejemplo necesario, es un contrato faltante
del DS: se registra la mejora; no se elevan permisos a `repo` ni se copian
archivos internos.

Importar los estilos oficiales una vez desde `src/styles.css` y establecer la
base tipográfica global. El punto de entrada aporta las fuentes oficiales y los
tokens, pero intencionalmente no resetea el `body` de la aplicación consumidora:

```css
@import '@iamacalupuenzo-ui/comsatel-ds/styles.css';

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: var(--font-family-content);
  font-size: var(--font-size-content-body);
  line-height: var(--font-line-height-content-body);
  font-weight: var(--font-weight-regular);
  letter-spacing: var(--font-letter-spacing-content);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

El punto de entrada incluye fuentes y tokens. No instala un reset, los estilos
de demos ni una interfaz de producto. Los estilos encapsulados de cada
componente viajan con el componente; la aplicación no los replica. Nunca
agregar `@font-face`, una URL de fuentes ni una familia tipográfica propia para
reemplazar los tokens: el consumidor solo usa la tipografía publicada por el DS.

## Tipografía en formularios

Clasificar cada texto antes de aplicar estilos: título de pantalla,
introducción, etiqueta de campo, etiqueta de control de elección, ayuda y
estado. La jerarquía intencional no se elimina haciendo que todos usen el mismo
tamaño.

Los labels de campos equivalentes compuestos por la aplicación —por ejemplo un
`<label>` para `cs-input` y el label de un `cs-select`— deben compartir el rol
de etiqueta de campo. No asumir una escala por costumbre: medir en el navegador
el label encapsulado del componente publicado en la versión instalada y usar
ese mismo rol en la etiqueta externa.

En la versión `0.2.0`, las etiquetas encapsuladas de Select, InputDropdown y
los selectores de fecha siguen la escala pública `fieldLabelTypography`:
`sm` y `md` usan `content/note` con peso `accent` (12px/18px/500), mientras
`lg` usa `content/caption` con peso `accent` (14px/21px/500). `cs-input` y
`cs-password-input` mantienen la etiqueta externa; cuando una aplicación
necesita una, debe derivarla del tamaño del campo y aplicarla de forma acotada:

```css
.form-field[data-size='sm'] > label,
.form-field[data-size='md'] > label {
  color: var(--color-text-base-default);
  font-family: var(--font-family-content);
  font-size: var(--font-size-content-note);
  line-height: var(--font-line-height-content-note);
  font-weight: var(--font-weight-accent);
  letter-spacing: var(--font-letter-spacing-content);
}

.form-field[data-size='lg'] > label {
  color: var(--color-text-base-default);
  font-family: var(--font-family-content);
  font-size: var(--font-size-content-caption);
  line-height: var(--font-line-height-content-caption);
  font-weight: var(--font-weight-accent);
  letter-spacing: var(--font-letter-spacing-content);
}
```

No declarar una regla global para `label`: afectaría la etiqueta interna de
Checkbox y otros componentes. Un Checkbox usa una etiqueta de opción y ayuda
propias; esa anatomía encapsulada se conserva. Verificar en el navegador la
familia, tamaño, interlineado y peso computados de labels equivalentes, no solo
su apariencia en una captura.

Evaluar también el texto dentro del control. En `0.2.0`, `cs-input` y
`cs-select` `md` usan una altura de 32px y texto `content/ui`
(13px/19.5px); `lg` usa 40px y `content/body` (16px/24px). Para una pantalla
con menor densidad o mayor exigencia de legibilidad, usar `fieldSize="lg"` en
`cs-input` y `size="lg"` en `cs-select` de manera consistente. Si la
investigación concluye que la escala pública no resuelve una necesidad, es una
decisión de Comsatel DS: se cambia el patrón y se verifica transversalmente, no
se crea una excepción visual en una sola aplicación.

## Receta de composición: contraseña con visibilidad

Al construir autenticación, no asumir que todo control interactivo es un
`cs-button`. Comsatel DS exporta `cs-password-input`, que ya compone el campo,
el ícono `lock` opcional y el botón nativo eye/eye-off con sus etiquetas y
`aria-pressed`. Importarlo desde el paquete público; no reconstruir el grupo ni
copiar sus estilos.

El formulario consumidor mantiene el valor, validación, error y etiqueta del
campo. `PasswordInput` solo controla la revelación. No se envuelve en
`cs-button`, pues ese componente está destinado a acciones generales y altera
la geometría del control integrado.

Usar `autocomplete="current-password"` para inicio de sesión o
`autocomplete="new-password"` para alta/cambio. El correo no es un componente
especializado: usar `cs-input type="email"` y `autocomplete="email"`.

## Comandos y dependencias

Se permite usar los scripts ya declarados por la aplicación (`npm run build`,
`npm test`, lint o e2e) y Angular CLI 22 para bootstrap. No instalar PrimeNG,
Material, Tailwind, un kit UI alternativo, una librería de mapas ni otra
dependencia visual para reemplazar Comsatel DS sin una solicitud explícita y
una evaluación de compatibilidad, licencia, bundle y accesibilidad.

Un error de registro, versión o API pública faltante es un bloqueo del contrato:
documentarlo y pedir la mejora en Comsatel DS; no resolverlo copiando fuentes.
