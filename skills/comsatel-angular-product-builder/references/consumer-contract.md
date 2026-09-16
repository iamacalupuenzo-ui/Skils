# Contrato de consumo de Comsatel DS

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

Crear o actualizar `.npmrc` solo en el repositorio consumidor, sin escribir ni
mostrar tokens:

```ini
@iamacalupuenzo-ui:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
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
