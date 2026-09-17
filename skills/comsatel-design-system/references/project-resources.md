# Comsatel Design System — Recursos de proyecto

Mapa de fuentes externas al skill. Usarlo para decidir **qué leer y cuándo**;
no sustituye `token-architecture.md`, `page-pattern.md` ni las demás referencias
internas del skill.

## Rutas de trabajo

| Recurso | Ruta | Cuándo leerlo | Uso permitido |
|---|---|---|---|
| Workspace Angular | Actual: `C:/Users/emacalupu/Documents/Boveda/Monday/Comsatel-DS`; alternativa: `D:/Investigacion/Comsatel-DS-Angular` | Siempre, al validar el GUARD | Buscar en ambas rutas, validar identidad y usar la que indique el usuario o exista. Es el proyecto de destino y fuente de tokens, componentes y páginas reales. |
| README del workspace | `[workspace]/README.md` | Onboarding, comandos o estructura general | `[workspace]` es la ruta validada entre las dos ubicaciones conocidas; entender el proyecto no sustituye el schema ni los archivos reales. |
| README de la librería | `[workspace]/projects/comsatel-ds/README.md` | Cambios de API, publicación o consumo de la librería | Contexto de la librería Angular. |
| Notas de versión | `[workspace]/docs/releases/<versión>.md` | Cambios de API, versión, paquete o publicación | Evidencia breve obligatoria de resumen, impacto para consumidores y verificación; la versión coincide con `projects/comsatel-ds/package.json` y se valida con `npm run check:release-notes`. |
| Registro de paquetes | `https://npm.pkg.github.com` y `references/package-release.md` | Antes de publicar o declarar instalable una versión | El registro, no solo el repositorio Git, confirma que el artefacto existe. Las credenciales viven por usuario o en CI, nunca en Git. |
| Guía de aplicación consumidora | `[workspace]/docs/consumer-angular.md` | Construir una pantalla de producto o iniciar una plataforma Angular | Define el límite librería/aplicación, bootstrap limpio, instalación y estructura `core`/`layout`/`features`; no copiar demos ni fuentes de Comsatel DS. |
| Decisión PrimeNG | `[workspace]/PRIMENG_PLAN.md` | Cualquier decisión sobre PrimeNG, otra librería UI o el motor de Modal/Menu/Toast/Table | Historial y límite de decisión: las librerías UI de terceros no se instalan. |
| Código Angular | `[workspace]/projects/comsatel-ds/src/lib/` | Auditoría o reconstrucción de un componente | Fuente de verdad de implementación Angular. |
| Páginas Angular | `[workspace]/src/app/pages/` | Cuando se modifica una demo o documentación | Verificar el patrón real de página y las composiciones ya existentes. |
| Navegación y rutas Angular | `[workspace]/src/app/lib/nav.ts` y `src/app/app.routes.ts` | Alta de componente o página | Confirmar que el catálogo y la ruta se actualizan de forma coherente. |
| Referencia React | `D:/Investigacion/Sistema-de-dise-o-Comsatel` | Portar o comparar paridad | Solo estructura, API, comportamiento y edge cases; nunca tokens, valores ni sintaxis literal. |
| Gaps y prioridad React | `D:/Investigacion/Sistema-de-dise-o-Comsatel/COMPONENT_GAPS.md` | Elegir el siguiente componente o revisar paridad | Inventario de brechas y priorización basada en uso real. |
| Componente y guía React | `src/components/ui/<componente>.tsx` y `src/components/docs/<Componente>PageContent.tsx` dentro de la referencia React | PORTAR un componente concreto | Extraer estructura, props, estados y secciones de documentación. |
| Producto C-Locater | `D:/Investigacion/C-Locater` | Solo en modo EXTRAER | Referencia de uso real, layout y comportamiento; nunca tokens ni implementación copiada. |

## Regla de lectura

No existe actualmente un archivo independiente llamado “Component Guides”. Para este
skill, su función la cumplen tres niveles: `component-inventory.md` para el estado de
Angular, `COMPONENT_GAPS.md` para paridad y prioridad entre proyectos, y el archivo
real del componente o de su página de documentación para el detalle concreto.

Antes de una tarea, leer solo los recursos que correspondan al modo y componente. Si
una ruta no existe, detener esa parte del trabajo e informarlo; no sustituirla por una
referencia parecida ni deducir su contenido.
