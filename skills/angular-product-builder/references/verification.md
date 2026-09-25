# Verificación de aplicaciones consumidoras

## Antes de cerrar

### Playground del producto

Para todo cambio que afecte una interfaz, abrir la ruta real de la aplicación
en el navegador de validación local. No cerrar solo con build, pruebas o
inspección de código.

- Revisar el estado en reposo y el estado que cambia con la interacción
  (por ejemplo: foco, menú abierto, selección, error, carga o cierre).
- Cuando dos controles deban ser equivalentes, comparar su altura, bordes,
  tipografía y alineación del ícono directamente en el navegador. Para una
  discrepancia visual sutil, medir estilos computados y
  `getBoundingClientRect()` antes de declarar que comparten tamaño.
- Ejecutar el recorrido real con mouse y teclado, y revisar el árbol de
  accesibilidad tras la acción. Una captura de estado base no prueba un
  overlay ni una selección.
- El playground del producto es el navegador que sirve la aplicación que se
  está construyendo. Storybook, una página de documentación del DS o una
  referencia externa pueden usarse como contraste, pero no reemplazan esta
  evidencia.
- Si la ruta local no puede abrirse, declarar la verificación pendiente con
  la causa concreta; no afirmar conformidad visual.

- El sistema de diseño está confirmado y registrado en el README del proyecto.
- La aplicación usa una versión explícita de la librería y el lockfile refleja
  esa adopción; no hay fuentes internas copiadas.
- Los estilos públicos se importan una sola vez y los componentes se importan
  desde la API pública.
- El `body` usa los tokens tipográficos públicos del sistema (en Comsatel DS,
  `--font-family-content`); se comprueba en el navegador la familia computada de
  texto fuera de componentes. No hay `@font-face`, URL de fuentes ni familias
  propias agregadas por la app.
- En formularios, los labels de campos equivalentes tienen la misma familia,
  tamaño, interlineado y peso computados. La diferencia entre etiqueta de campo,
  etiqueta de opción y ayuda solo se conserva cuando responde a la anatomía del
  componente publicado; no se imponen reglas globales sobre `label`.
- La auditoría diferencia el label del texto escrito o placeholder dentro del
  control. En Comsatel DS, el tamaño de `cs-input` y `cs-select` es consistente en el mismo
  formulario; si `md` no aporta legibilidad suficiente para el contexto, se
  adopta `lg` en ambos. Un cambio del tamaño estándar de labels se deriva al DS,
  nunca se resuelve con una excepción de una sola pantalla.
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
| “Crea un login” sin repo ni sistema indicado | Pregunta qué sistema de diseño usar antes de instalar nada. | Instalar Comsatel DS (u otro) por costumbre. |
| “Crea un login con Comsatel DS” sin repo | Plan + bootstrap limpio, librería versionada y estilos públicos. | Clonar o modificar Comsatel DS. |
| “Usa mi sistema de diseño personal” | Pide paquete y documentación, lo registra en el README y trabaja con su API pública. | Suponer que funciona como Comsatel DS o copiar sus recetas. |
| “Agrega alertas de flota” en repo existente | Plan de severidad, audiencia, estado y recuperación antes de UI. | Toast genérico sin acción o duplicado. |
| “Haz un mapa de unidades” | Lista equivalente, dato fresco/obsoleto y estados de mapa. | Mapa visual sin alternativa ni error. |
| “Actualiza la librería” | Cambio explícito de versión y lockfile, pruebas de regresión. | `latest` o CSS copiado. |
| API pública insuficiente | Bloqueo documentado y propuesta para DS. | Acceder a `node_modules` interno. |
| Pantalla con texto propio | Base tipográfica desde tokens públicos y familia computada verificada. | Heredar la serif del navegador o cargar una fuente ajena. |
| Formulario con Input y Select | Labels de campos equivalentes comparten tokens y valores computados. | Dejar un label nativo heredando el cuerpo o sobrescribir Checkbox globalmente. |
| Formulario con baja densidad | Labels y texto interno se miden por separado; Input y Select usan `lg` de forma consistente si el contexto requiere más legibilidad. | Aumentar solo un label local o mezclar `md` y `lg` sin jerarquía. |
