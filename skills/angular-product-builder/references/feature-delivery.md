# Entrega de una característica Angular

## Arquitectura de producto

Usar la estructura existente. En una base nueva, separar:

```text
src/app/
  core/             sesión, clientes API, guards, interceptores, configuración
  layout/           shells, navegación y áreas compartidas autenticadas
  features/         flujos de negocio y sus rutas
    dominio/feature/ página, estado, validación y componentes locales
  shared/           utilidades exclusivamente de la aplicación
```

Una composición como login, tablero de seguimiento o panel de alertas vive en
`features/`, no en la librería. Un componente local se extrae solo si se repite
en el producto; se propone para el Design System únicamente con evidencia de
reutilización entre plataformas.

## Secuencia de construcción

1. Leer el plan, contrato público y arquitectura destino.
2. Identificar componentes existentes antes de escribir markup o CSS local.
3. Crear ruta, estado y datos simulados o reales claramente etiquetados.
4. Construir primero el flujo principal y luego cada estado acordado.
5. Implementar validación, progreso, recuperación y feedback sin duplicar
   acciones ni perder datos ingresados.
6. Revisar teclado, foco, lectura de mensajes, contraste y tamaños móviles.
7. Ejecutar scripts reales de la aplicación y probar la interacción crítica.

## Decisiones de composición

Elegir componentes por significado y comportamiento público, no por similitud
visual. Si se necesita una variación de layout, componer con HTML semántico y
tokens expuestos por `styles.css`; no alcanzar archivos internos del paquete.

Para una decisión de UX, declarar el propósito del patrón, el tradeoff y su
efecto en operadores, supervisores o administradores. Si una necesidad altera
seguridad, datos, notificaciones persistentes, roles o una integración de mapa,
planificarla antes de codificar y pedir dirección si el requisito no existe.
