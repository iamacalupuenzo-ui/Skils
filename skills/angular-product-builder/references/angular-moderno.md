# Angular moderno: guía de framework

Este skill decide **qué se construye y cómo se organiza** (producto, sistema de
diseño, arquitectura del repositorio). No es una guía del framework. Para
cómo se escribe Angular actual (señales, formularios, DI, rutas, pruebas), la
autoridad es el **skill oficial del equipo de Angular**, que se mantiene al día
con el framework. Este archivo dice cuándo consultarlo, qué contiene y qué
reglas suyas ceden ante las del repositorio.

## Referente oficial

- Repositorio: `https://github.com/angular/skills` (licencia MIT; documentación
  CC BY 4.0; autoría Google).
- Página oficial: `https://angular.dev/ai/agent-skills`.
- Instalación: `npx skills add https://github.com/angular/skills`.
- Skills que publica (verificado el 2026-09-25):
  - `angular-developer`: genera código Angular y da guía de arquitectura.
  - `angular-new-app`: crea una aplicación nueva con el CLI.
- Regla de mantenimiento: **no se copia su contenido a este skill.** Se
  actualiza con cada versión de Angular y una copia envejece sin aviso. Se
  consulta en el momento (instalado, o leyendo el `SKILL.md` y la referencia
  puntual en el repositorio) y se registra en el cierre qué se consultó.

## Regla previa: conocer la versión

Antes de escribir código, confirmar la versión de Angular del proyecto
(`package.json` y, si hace falta, `ng version`). Las recomendaciones cambian
entre versiones. Un proyecto nuevo usa la versión estable más reciente salvo
que el usuario indique otra. Nunca aplicar de memoria una práctica de otra
versión.

## Qué tema consultar y dónde

Referencias del skill oficial `angular-developer` (nombres de archivo tal como
las publica; verificados el 2026-09-25):

| Tema | Referencia oficial |
|---|---|
| Componentes | `components.md`, `inputs.md`, `outputs.md`, `host-elements.md` |
| Nombres | `naming-conventions.md` |
| Reactividad | `signals-overview.md`, `linked-signal.md`, `resource.md`, `effects.md` |
| HTTP | `http-client.md` |
| Formularios | `signal-forms.md`, `template-driven-forms.md`, `reactive-forms.md` |
| Inyección de dependencias | `di-fundamentals.md`, `creating-services.md`, `defining-providers.md`, `injection-context.md`, `hierarchical-injectors.md` |
| Pipes | `pipes.md` |
| Accesibilidad | `angular-aria.md` |
| Rutas | `define-routes.md`, `loading-strategies.md`, `route-guards.md`, `data-resolvers.md`, `router-lifecycle.md`, `rendering-strategies.md`, `route-animations.md` |
| Estilos | `component-styling.md`, `angular-animations.md`, `tailwind-css.md` |
| Pruebas | `testing-fundamentals.md`, `component-harnesses.md`, `router-testing.md`, `e2e-testing.md` |
| Herramientas | `cli.md`, `migrations.md`, `mcp.md`, `environment-configuration.md` |

Uso: al construir una pieza, leer la referencia del tema que toca (por
ejemplo `signals-overview.md` y `effects.md` antes de un servicio de estado; la
de formularios antes de un formulario), no todo el conjunto.

## Reglas que declara el skill oficial (resumen)

- Señales como base del estado (`signal`, `computed`, `linkedSignal`,
  `resource`, `effect`).
- Inyección con `inject()` y servicios `providedIn: 'root'`.
- Control de flujo de plantilla con `@if`, `@for`, `@switch`.
- Entradas y salidas basadas en funciones (`input()`, `input.required()`,
  `output()`, `model()`).
- Formularios: en aplicaciones nuevas de la versión 22 o posterior, preferir
  Signal Forms; en aplicaciones existentes, respetar la estrategia que ya usan.
  Plantillas para formularios simples y reactivos para complejos.
- Accesibilidad de componentes propios con Angular Aria.
- Pruebas unitarias con Vitest, arneses de componentes para interacción y
  `RouterTestingHarness` para navegación.
- Usar el CLI para generar código.

## Qué reglas ceden ante el repositorio

Estas recomendaciones del skill oficial **no se aplican** si el repositorio
declara lo contrario (ver `arquitectura-proyecto.md`, sección 1):

| Recomendación oficial | Cuándo cede |
|---|---|
| Ejecutar `ng build` después de generar código | Si el repositorio prohíbe ejecutar build, `tsc` o pruebas sin pedido del usuario |
| Escribir pruebas con Vitest al construir | Si el usuario ejecuta las pruebas y no quiere que se corran; se escriben, no se ejecutan |
| Plantilla y estilos en archivos separados del componente | Si el repositorio exige plantilla y estilos inline |
| Signal Forms en proyectos nuevos v22+ | Si el proyecto ya usa otra estrategia de formularios o el Design System expone sus propios controles con otro contrato; se decide y se registra |

## Convenciones observadas en el repositorio de referencia

Ya presentes y coherentes con la guía oficial (Angular 22): componentes
standalone con `imports` propios, señales (`signal`, `computed`, `effect`),
`inject()`, control de flujo `@if`/`@for`, entradas `input()` e
`input.required()`. Un componente nuevo sigue lo que hacen sus vecinos; no
mezcla el estilo decorador (`@Input`) y el de funciones dentro de un mismo
componente sin motivo. Cuando el repositorio mezcla ambos por historia,
usar el de funciones en código nuevo y no reescribir código ajeno sin pedido.

## Estado de esta integración

- El skill oficial **no está instalado** como dependencia de este skill; esta
  referencia lo enlaza y ordena su uso. Decidir su instalación global (Claude
  Code y Codex) queda a cargo del usuario.
- No se auditó el contenido completo de cada referencia oficial; el resumen de
  arriba proviene de su `SKILL.md`. Antes de apoyarse en una regla concreta
  para una decisión importante, leer la referencia puntual.
- Alternativas comunitarias revisadas solo por título en la búsqueda (por
  ejemplo colecciones de terceros para Angular 22) no se adoptan: el referente
  es el del equipo de Angular.
