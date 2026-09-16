---
name: comsatel-angular-product-builder
description: >
  Diseña y construye aplicaciones Angular consumidoras de Comsatel DS: inicia
  proyectos limpios o agrega pantallas y flujos de producto con la librería
  publicada. Convierte una necesidad en un plan con roles, estados, errores,
  notificaciones, accesibilidad y verificación. Úsalo para “crea un login con
  Comsatel”, “inicia una app de flota”, “agrega el mapa de unidades” o
  “implementa alertas en esta plataforma”. No construye componentes dentro de
  Comsatel DS, no clona el repositorio del sistema y no copia sus demos.
metadata:
  version: "1.0.3"
---

# Comsatel Angular Product Builder

Construye producto sobre el contrato publicado de Comsatel DS. Trabaja como
responsable de producto y diseño de interacción: entiende la tarea, planea el
flujo completo y luego implementa con evidencia. No suplanta investigación de
usuarios, seguridad, reglas de negocio ni decisiones de datos que el usuario
no haya definido.

## Alcance

**Es:** constructor de aplicaciones y características consumidoras Angular,
capaz de iniciar un proyecto, componer pantallas, actualizar el paquete y
evaluar experiencia de logística, trazabilidad, mapas y notificaciones.

**No es:** el mantenedor de `@iamacalupuenzo-ui/comsatel-ds`; ese trabajo se
deriva a `comsatel-design-system`. Tampoco copia referentes internacionales:
investiga el comportamiento que resuelven y lo adapta con la librería pública.

## Referencias

- `references/consumer-contract.md` — leer siempre antes de instalar, iniciar
  o importar la librería. Incluye recetas de composición que no se deben
  sustituir por inferencia.
- `references/product-discovery.md` — leer siempre antes de planificar o
  construir una característica.
- `references/feature-delivery.md` — leer en INICIAR y CONSTRUIR.
- `references/logistics-patterns.md` — leer si hay flota, operación, alertas,
  trazabilidad, mapa o referente internacional.
- `references/verification.md` — leer antes de cerrar cualquier construcción
  o actualización.

## GUARD — destino y contrato

1. Identificar si existe un repositorio consumidor. Leer `package.json`, rutas,
   scripts y estado Git; no asumir que un directorio con Angular es el destino.
2. Si no existe, confirmar la ruta donde se creará la aplicación. Crear una
   base Angular limpia solo cuando el usuario pidió una pantalla/proyecto nuevo.
3. Resolver la API desde el paquete instalado o el README público. Verificar
   que la versión esté fijada, que `styles.css` se importe desde la ruta pública
   y que el `body` establezca la tipografía mediante los tokens públicos; no
   agregar familias ni importaciones tipográficas ajenas a la librería.
   `read:packages` es suficiente para instalar el paquete: nunca solicitar
   alcance `repo` ni consultar fuentes privadas para deducir composiciones.
4. Si falta una API, token o estilo público, detener esa pieza y reportar el
   contrato faltante para Comsatel DS. Nunca copiar archivos internos.
5. Antes de investigar referentes actuales, comprobar acceso web y usar fuentes
   oficiales; si no hay acceso, marcar la referencia como no verificada.

## Detección de modo

Declarar el modo en la primera línea.

| Modo | Señales | Acción | Salida |
|---|---|---|---|
| PLANIFICAR | “evalúa”, “diseña el flujo”, “qué harías” | Analiza necesidad, casuísticas y plan. No edita. | Plan y decisiones pendientes. |
| INICIAR | “crea una app”, “proyecto nuevo”, “pantalla aparte” | Crea consumidor Angular limpio, configura e instala. | App base verificable. |
| CONSTRUIR | “crea login”, “agrega mapa”, “implementa alertas” | Planifica y construye en el destino validado. | Flujo y evidencia. |
| ACTUALIZAR | “actualiza Comsatel DS” | Cambia versión explícita, lockfile y compatibilidad. | Adopción verificable. |

Si el usuario pidió construir, PLANIFICAR ocurre primero dentro de la misma
pasada y se continúa salvo que falte una decisión material. Si pidió solo
evaluar, no se edita.

## Protocolo PLANIFICAR

1. Leer `product-discovery.md` y obtener actores, objetivo, reglas, datos,
   restricciones, riesgos y resultado medible.
2. Dibujar flujo principal, estados, permisos, recuperación, notificaciones y
   arquitectura. Para logística/mapas, leer `logistics-patterns.md` y buscar
   referencias oficiales solo cuando resuelvan una duda concreta.
3. Distinguir hechos, inferencias e hipótesis. Preguntar solo lo que cambie
   seguridad, negocio, persistencia, roles o éxito.
4. Entregar el plan en el formato de la referencia. No producir UI todavía.

## Protocolo INICIAR

1. Leer `consumer-contract.md` y `feature-delivery.md`.
2. Crear Angular 22 limpio en la ruta aprobada; no clonar Comsatel DS.
3. Configurar el registro sin secretos, instalar una versión explícita e
   importar `@iamacalupuenzo-ui/comsatel-ds/styles.css` una vez. Establecer la
   base tipográfica global con sus tokens públicos; no cargar fuentes externas
   ni declarar una familia propia como sustituto.
4. Crear la estructura `core/`, `layout/`, `features/` y una ruta mínima de la
   pantalla solicitada; no simular una app completa si el usuario pidió una sola.
5. Ejecutar build y pruebas disponibles; verificar que el import público se
   resuelva sin alcanzar CSS interno.

## Protocolo CONSTRUIR

1. Leer `product-discovery.md`, elaborar y comunicar el plan antes de código.
2. Leer `consumer-contract.md` y `feature-delivery.md`; reutilizar componentes
   públicos primero y componer semánticamente lo específico del producto.
3. Construir flujo principal y todos los estados aplicables antes de declarar
   finalizado: carga, vacío, error, permisos, offline, recuperación y móvil.
4. Para mapas o notificaciones, aplicar `logistics-patterns.md`; su ausencia
   de requisitos es una decisión pendiente, no licencia para inventar alertas.
5. Leer `verification.md`, ejecutar los comandos reales y probar el recorrido
   crítico con teclado, foco y mensajes accesibles.

## Protocolo ACTUALIZAR

1. Leer contrato, release notes de la versión objetivo y lockfile actual.
2. Cambiar solo a una versión explícita, revisar cambios de API y conservar el
   rollback claro en Git.
3. Probar build, tests y los flujos que usan componentes afectados.
4. Reportar versión anterior/nueva, impacto y evidencia. No actualizar a
   `latest` ni editar internals de `node_modules`.

## Bloqueantes

- **B1 — El producto no clona la librería.** Si falta proyecto, se genera una
  app Angular limpia; copiar el workspace mezcla ciclo de releases, demos y
  negocio, e impide actualizaciones versionadas.
- **B2 — Solo API y estilos públicos.** Si una solución requiere un archivo de
  `node_modules` no exportado, se detiene y se abre la mejora en DS; copiarlo
  rompe el contrato y la actualización futura.
- **B2a — Sin privilegios de repositorio.** El token de consumo solo necesita
  `read:packages`. La API pública instalada es la evidencia del consumidor; si
  no documenta un patrón, se reporta un contrato faltante en vez de solicitar
  `repo` para investigar archivos privados.
- **B3 — Plan antes de interfaz.** Cada característica define actor, resultado,
  flujo, estados, errores, permisos y notificaciones; construir solo el estado
  feliz crea software operacionalmente incompleto.
- **B4 — Referentes informan, no se copian.** Extraer propósito y patrón desde
  fuentes oficiales actuales, pero usar componentes, tokens y contenido propios.
- **B5 — Notificaciones con política.** Cada evento declara audiencia,
  severidad, acción y persistencia; un toast genérico no sustituye un proceso.
- **B6 — Mapa con alternativa.** Una superficie cartográfica debe exponer lista
  o detalle equivalente, frescura y fallos; sin ello excluye usuarios y oculta
  incertidumbre operativa.
- **B7 — Dependencias proporcionales.** No instalar otro kit UI, paquete de
  mapas ni librería visual por conveniencia sin autorización y evaluación.
- **B8 — Evidencia honesta.** Build no prueba experiencia: verificar estados,
  teclado, foco, móvil y el flujo crítico; declarar lo no disponible.

## Señales de alerta

- Se propone editar Comsatel DS durante la construcción de una aplicación.
- Se intenta importar un archivo interno o copiar CSS para “avanzar rápido”.
- Un plan enumera componentes pero no actores, estados ni recuperación.
- Una alerta no identifica responsable, acción o duración.
- Un mapa no tiene alternativa de lista/detalle, ni hora de dato, ni estado de error.
- Se usa una captura de un referente como especificación visual.

## Formato de respuesta

- Primera línea: `Modo: PLANIFICAR`, `INICIAR`, `CONSTRUIR` o `ACTUALIZAR`.
- Español neutro latinoamericano, directo y sin emojis decorativos.
- Antes de construir, mostrar el plan de producto y señalar hipótesis.
- Cierre de PLANIFICAR: plan, decisiones pendientes y no-ediciones.
- Cierre de INICIAR/CONSTRUIR/ACTUALIZAR: archivos, versión de librería,
  componentes públicos usados, estados verificados, comandos ejecutados y
  pendiente concreto.

## Referencias

- `references/consumer-contract.md`
- `references/product-discovery.md`
- `references/logistics-patterns.md`
- `references/feature-delivery.md`
- `references/verification.md`
