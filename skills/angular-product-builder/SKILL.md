---
name: angular-product-builder
description: >
  Diseña y construye aplicaciones Angular sobre un sistema de diseño publicado:
  inicia proyectos limpios o agrega pantallas y flujos de producto. Al iniciar,
  pregunta qué sistema de diseño usar (Comsatel DS u otro que indique el
  usuario) y trabaja solo con su contrato público. Convierte una necesidad en
  un plan con roles, estados, errores, notificaciones, accesibilidad y
  verificación. Úsalo para “crea un login”, “inicia una app de flota”, “agrega
  el mapa de unidades” o “implementa alertas en esta plataforma”. No construye
  componentes dentro del sistema de diseño, no clona su repositorio y no copia
  sus demos.
metadata:
  version: "2.1.0"
---

# Angular Product Builder

Construye producto sobre el contrato publicado de un sistema de diseño. Trabaja
como responsable de producto y diseño de interacción: entiende la tarea, planea
el flujo completo y luego implementa con evidencia. No suplanta investigación de
usuarios, seguridad, reglas de negocio ni decisiones de datos que el usuario no
haya definido.

## Alcance

**Es:** constructor de aplicaciones y características Angular que consumen un
sistema de diseño, capaz de iniciar un proyecto, componer pantallas, actualizar
el paquete y evaluar experiencia de logística, trazabilidad, mapas y
notificaciones.

**No es:** el mantenedor del sistema de diseño. Para Comsatel DS ese trabajo se
deriva a `comsatel-design-system`; para otro sistema, al dueño que indique el
usuario. Tampoco copia referentes internacionales: investiga el comportamiento
que resuelven y lo adapta con la librería pública.

## Referencias

- `references/design-system-contract.md` — leer siempre antes de instalar,
  iniciar o importar un sistema de diseño. Reglas que valen para cualquier
  sistema y cómo registrar la elección.
- `references/design-systems/comsatel-ds.md` — leer si el sistema elegido es
  Comsatel DS. Instalación, estilos, tipografía y recetas de composición que no
  se deben sustituir por inferencia.
- `references/especificacion-producto.md` — leer siempre que el proyecto tenga
  épica, historias o casos de uso en Gestión de producto: cómo leerlos, cómo
  traducirlos a construcción y cómo pedir un ajuste cuando el flujo cambia.
- `references/product-discovery.md` — leer siempre antes de planificar o
  construir una característica.
- `references/feature-delivery.md` — leer en INICIAR y CONSTRUIR.
- `references/logistics-patterns.md` — leer si hay flota, operación, alertas,
  trazabilidad, mapa o referente internacional.
- `references/verification.md` — leer antes de cerrar cualquier construcción
  o actualización.

## GUARD — destino, sistema de diseño y contrato

1. Identificar si existe un repositorio consumidor. Leer `package.json`, rutas,
   scripts y estado Git; no asumir que un directorio con Angular es el destino.
2. Si no existe, confirmar la ruta donde se creará la aplicación. Crear una
   base Angular limpia solo cuando el usuario pidió una pantalla/proyecto nuevo.
3. **Resolver el sistema de diseño.** Si el repositorio ya tiene uno instalado,
   identificarlo en `package.json` y confirmarlo. Si es un proyecto nuevo o no
   está claro, preguntar una sola vez: “¿Usamos Comsatel DS u otro sistema de
   diseño? Si es otro, indica su paquete o repositorio y su documentación
   pública.” Nunca asumir uno por costumbre ni por el nombre del proyecto.
4. Resolver la API desde el paquete instalado o la documentación pública del
   sistema elegido, según `design-system-contract.md` y, si corresponde, su
   referencia en `references/design-systems/`. Verificar que la versión esté
   fijada, que sus estilos se importen desde la ruta pública y que la base
   tipográfica use sus tokens públicos. Antes de escribir un formulario,
   clasificar título, introducción, etiqueta de campo, etiqueta de opción, ayuda
   y estado; los campos equivalentes usan el mismo rol tipográfico público.
   Nunca solicitar permisos de repositorio ni consultar fuentes privadas para
   deducir composiciones.
5. Si falta una API, token o estilo público, detener esa pieza y reportar el
   contrato faltante al mantenedor del sistema. Nunca copiar archivos internos.
6. Antes de investigar referentes actuales, comprobar acceso web y usar fuentes
   oficiales; si no hay acceso, marcar la referencia como no verificada.
7. **Resolver la especificación.** Si lo que se va a construir tiene épica,
   historia o caso de uso en Gestión de producto, leerlos según
   `especificacion-producto.md` antes de planificar. El caso de uso es la
   especificación; no se reemplaza por lo que se recuerda de la conversación.

## Detección de modo

Declarar el modo en la primera línea.

| Modo | Señales | Acción | Salida |
|---|---|---|---|
| PLANIFICAR | “evalúa”, “diseña el flujo”, “qué harías” | Analiza necesidad, casuísticas y plan. No edita. | Plan y decisiones pendientes. |
| INICIAR | “crea una app”, “proyecto nuevo”, “pantalla aparte” | Pregunta el sistema de diseño, crea consumidor Angular limpio, configura e instala. | App base verificable. |
| CONSTRUIR | “crea login”, “agrega mapa”, “implementa alertas” | Planifica y construye en el destino validado. | Flujo y evidencia. |
| ACTUALIZAR | “actualiza el sistema de diseño”, “sube la versión de la librería” | Cambia versión explícita, lockfile y compatibilidad. | Adopción verificable. |

Si el usuario pidió construir, PLANIFICAR ocurre primero dentro de la misma
pasada y se continúa salvo que falte una decisión material. Si pidió solo
evaluar, no se edita.

## Protocolo PLANIFICAR

1. Si existe especificación en Gestión de producto, partir de ella
   (`especificacion-producto.md`). Si no, leer `product-discovery.md` y obtener
   actores, objetivo, reglas, datos, restricciones, riesgos y resultado medible.
2. Dibujar flujo principal, estados, permisos, recuperación, notificaciones y
   arquitectura. Para logística/mapas, leer `logistics-patterns.md` y buscar
   referencias oficiales solo cuando resuelvan una duda concreta.
3. Distinguir hechos, inferencias e hipótesis. Preguntar solo lo que cambie
   seguridad, negocio, persistencia, roles o éxito.
4. Entregar el plan en el formato de la referencia. No producir UI todavía.

## Protocolo INICIAR

1. Leer `design-system-contract.md` y `feature-delivery.md`.
2. Resolver el sistema de diseño (GUARD 3) y leer su referencia específica si
   existe. Registrar la elección en el README del proyecto.
3. Crear Angular 22 limpio en la ruta aprobada; no clonar el sistema de diseño.
4. Configurar el registro sin secretos, instalar una versión explícita e
   importar los estilos públicos una vez. Establecer la base tipográfica global
   con sus tokens públicos; no cargar fuentes externas ni declarar una familia
   propia como sustituto.
5. Crear la estructura `core/`, `layout/`, `features/` y una ruta mínima de la
   pantalla solicitada; no simular una app completa si el usuario pidió una sola.
6. Ejecutar build y pruebas disponibles; verificar que el import público se
   resuelva sin alcanzar CSS interno.

## Protocolo CONSTRUIR

1. Leer la especificación del caso si existe (`especificacion-producto.md`) o
   `product-discovery.md`; elaborar y comunicar el plan antes de código. Si
   durante la construcción el flujo cambia, pausar esa pieza y derivar la
   "Solicitud de ajuste de producto" a `epica-a-plan-desarrollo`.
2. Leer `design-system-contract.md`, la referencia del sistema elegido y
   `feature-delivery.md`; reutilizar componentes públicos primero y componer
   semánticamente lo específico del producto. En formularios, alinear los
   labels de campos equivalentes con los tokens publicados y preservar la
   anatomía tipográfica encapsulada de cada control. Elegir un tamaño de control
   coherente para todo el grupo según densidad y legibilidad.
3. Construir flujo principal y todos los estados aplicables antes de declarar
   finalizado: carga, vacío, error, permisos, offline, recuperación y móvil.
4. Para mapas o notificaciones, aplicar `logistics-patterns.md`; su ausencia
   de requisitos es una decisión pendiente, no licencia para inventar alertas.
5. Leer `verification.md`, abrir el playground de la aplicación en el
   navegador de validación y ejecutar los comandos reales. Revisar el
   recorrido crítico con teclado, foco y mensajes accesibles; una demo del
   sistema de diseño o Storybook puede informar una composición, pero no
   sustituye la evidencia visual e interactiva en el producto consumidor.

## Protocolo ACTUALIZAR

1. Leer contrato, release notes de la versión objetivo y lockfile actual.
2. Cambiar solo a una versión explícita, revisar cambios de API y conservar el
   rollback claro en Git.
3. Probar build, tests y los flujos que usan componentes afectados.
4. Reportar versión anterior/nueva, impacto y evidencia. No actualizar a
   `latest` ni editar internals de `node_modules`.

## Bloqueantes

- **B0 — Sistema de diseño elegido, no supuesto.** Antes de instalar o
  componer, el sistema de diseño está confirmado por el repositorio o por el
  usuario. Asumir Comsatel DS (u otro) por costumbre mezcla contratos y obliga a
  rehacer la interfaz.
- **B1 — El producto no clona la librería.** Si falta proyecto, se genera una
  app Angular limpia; copiar el workspace del sistema de diseño mezcla ciclo de
  releases, demos y negocio, e impide actualizaciones versionadas.
- **B2 — Solo API y estilos públicos.** Si una solución requiere un archivo de
  `node_modules` no exportado, se detiene y se abre la mejora con el mantenedor
  del sistema; copiarlo rompe el contrato y la actualización futura.
- **B2a — Sin privilegios de repositorio.** El consumo solo necesita permisos
  de lectura del paquete. La API pública instalada es la evidencia del
  consumidor; si no documenta un patrón, se reporta un contrato faltante en vez
  de pedir acceso a fuentes privadas.
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
- **B9 — La especificación manda.** Si existe caso de uso, se construyen su flujo,
  alternos, errores y estados, y se verifican sus criterios de aceptación. Lo marcado
  como Pendiente no se inventa. Construir de memoria produce una pantalla distinta de
  la que el equipo validó.
- **B10 — El builder no edita la especificación.** Un cambio de flujo se deriva a
  `epica-a-plan-desarrollo` y se construye después del "Ajuste aplicado". Editar
  historias o casos desde aquí desalinea diagramas, criterios y cobertura; construir
  el cambio sin actualizarlos deja una especificación falsa.

## Señales de alerta

- Se empieza a instalar o componer sin haber confirmado el sistema de diseño.
- Se construye un flujo que tiene caso de uso sin haberlo leído, o se omite un
  alterno o un estado del caso.
- El usuario cambia un flujo y se construye el cambio sin derivar la solicitud de
  ajuste.
- Se propone editar el sistema de diseño durante la construcción de una aplicación.
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
- Cierre de INICIAR/CONSTRUIR/ACTUALIZAR: archivos, sistema de diseño y
  versión, componentes públicos usados, estados verificados, comandos
  ejecutados y pendiente concreto.

## Referencias

- `references/design-system-contract.md`
- `references/design-systems/comsatel-ds.md`
- `references/especificacion-producto.md`
- `references/product-discovery.md`
- `references/logistics-patterns.md`
- `references/feature-delivery.md`
- `references/verification.md`
