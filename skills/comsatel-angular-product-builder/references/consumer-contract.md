# Contrato de consumo de Comsatel DS

## Límite de responsabilidad

La aplicación es dueña de sus dominios, datos, rutas, autenticación, reglas de
negocio y composiciones. La librería es dueña de sus componentes, tokens y
contrato público. Nunca se copia `projects/comsatel-ds/`, `src/app/`, demos,
Storybook ni CSS interno hacia una aplicación consumidora.

Antes de elegir componentes, leer el `README.md` instalado en
`node_modules/@iamacalupuenzo-ui/comsatel-ds/` o su fuente pública en
`https://github.com/iamacalupuenzo-ui/Comsatel-DS`. Esa es la API vigente; no
inventar imports ni mantener una lista duplicada dentro de este skill.

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

Importar los estilos oficiales una vez desde `src/styles.css`:

```css
@import '@iamacalupuenzo-ui/comsatel-ds/styles.css';
```

El punto de entrada incluye fuentes y tokens. No instala un reset, los estilos
de demos ni una interfaz de producto. Los estilos encapsulados de cada
componente viajan con el componente; la aplicación no los replica.

## Comandos y dependencias

Se permite usar los scripts ya declarados por la aplicación (`npm run build`,
`npm test`, lint o e2e) y Angular CLI 22 para bootstrap. No instalar PrimeNG,
Material, Tailwind, un kit UI alternativo, una librería de mapas ni otra
dependencia visual para reemplazar Comsatel DS sin una solicitud explícita y
una evaluación de compatibilidad, licencia, bundle y accesibilidad.

Un error de registro, versión o API pública faltante es un bloqueo del contrato:
documentarlo y pedir la mejora en Comsatel DS; no resolverlo copiando fuentes.
