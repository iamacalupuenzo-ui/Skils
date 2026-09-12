# Comsatel Design System — Recursos de proyecto

Mapa de fuentes externas al skill. Usarlo para decidir **qué leer y cuándo**;
no sustituye `token-architecture.md`, `page-pattern.md` ni las demás referencias
internas del skill.

## Rutas de trabajo

| Recurso | Ruta | Cuándo leerlo | Uso permitido |
|---|---|---|---|
| Workspace Angular | `D:/Investigacion/Comsatel-DS-Angular` | Siempre, al validar el GUARD | Proyecto de destino y fuente de tokens, componentes y páginas reales. |
| README del workspace | `D:/Investigacion/Comsatel-DS-Angular/README.md` | Onboarding, comandos o estructura general | Entender el proyecto; no sustituye el schema ni los archivos reales. |
| README de la librería | `D:/Investigacion/Comsatel-DS-Angular/projects/comsatel-ds/README.md` | Cambios de API, publicación o consumo de la librería | Contexto de la librería Angular. |
| Decisión PrimeNG | `D:/Investigacion/Comsatel-DS-Angular/PRIMENG_PLAN.md` | Cualquier decisión sobre PrimeNG, otra librería UI o el motor de Modal/Menu/Toast/Table | Historial y límite de decisión: las librerías UI de terceros no se instalan. |
| Código Angular | `D:/Investigacion/Comsatel-DS-Angular/projects/comsatel-ds/src/lib/` | Auditoría o reconstrucción de un componente | Fuente de verdad de implementación Angular. |
| Páginas Angular | `D:/Investigacion/Comsatel-DS-Angular/src/app/pages/` | Cuando se modifica una demo o documentación | Verificar el patrón real de página y las composiciones ya existentes. |
| Navegación y rutas Angular | `D:/Investigacion/Comsatel-DS-Angular/src/app/lib/nav.ts` y `src/app/app.routes.ts` | Alta de componente o página | Confirmar que el catálogo y la ruta se actualizan de forma coherente. |
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
