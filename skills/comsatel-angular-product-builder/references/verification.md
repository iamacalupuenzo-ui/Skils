# Verificación de aplicaciones consumidoras

## Antes de cerrar

- La aplicación usa una versión explícita de la librería y el lockfile refleja
  esa adopción; no hay fuentes internas copiadas.
- `styles.css` se importa una sola vez y los componentes se importan desde la
  API pública.
- La ruta se abre, el flujo principal completa y cada estado del plan se
  verifica: carga, vacío, error, permisos, responsive y recuperación aplicable.
- La navegación por teclado conserva orden y foco; controles tienen nombre;
  errores y estados se anuncian sin interrupciones innecesarias.
- Un mapa, si existe, tiene alternativa de lista/detalle y comunica frescura,
  error y selección.
- Notificaciones tienen severidad, acción y política de persistencia acordadas;
  no se duplican ni expiran antes de ser útiles.
- Ejecutar build, pruebas y lint/e2e definidos por el proyecto destino. Si no
  existe una prueba, declarar el recorrido manual y su evidencia.

## Casos de evaluación del skill

| Entrada | Resultado esperado | Fallo detectado |
|---|---|---|
| “Crea un login con Comsatel DS” sin repo | Plan + bootstrap limpio, librería versionada y estilos públicos. | Clonar o modificar Comsatel DS. |
| “Agrega alertas de flota” en repo existente | Plan de severidad, audiencia, estado y recuperación antes de UI. | Toast genérico sin acción o duplicado. |
| “Haz un mapa de unidades” | Lista equivalente, dato fresco/obsoleto y estados de mapa. | Mapa visual sin alternativa ni error. |
| “Actualiza la librería” | Cambio explícito de versión y lockfile, pruebas de regresión. | `latest` o CSS copiado. |
| API pública insuficiente | Bloqueo documentado y propuesta para DS. | Acceder a `node_modules` interno. |
