# Gates de verificación antes del cierre

Esta referencia evita dos errores recurrentes: declarar terminado un
componente que solo fue compilado, y reconstruir una apariencia sin cubrir el
comportamiento, los estados o la estructura real. Se aplica a cada componente
o patrón que se audita o reconstruye.

## 1. Matriz de referencia funcional

Antes de editar, identifica la fuente de capacidades:

- **PrimeNG oficial actual**, cuando hay equivalente público. Es obligatorio
  revisar su sección de ejemplos y accesibilidad; sirve para detectar estados,
  ARIA y teclado que el componente propio debe cubrir. Por ejemplo, el Select
  documenta selección múltiple, chips, filtro, estados disabled/invalid/loading
  y relaciones combobox/listbox.
- **React de Comsatel**, para estructura, variantes documentadas y edge cases
  propios del sistema. Nunca aporta tokens ni implementación Angular.
- **WAI-ARIA APG**, cuando PrimeNG no ofrece equivalente o el patrón es más
  específico que un componente de PrimeNG.

Deja en la auditoría una matriz breve con las capacidades aplicables y su
evidencia Angular: prop/estado, ARIA, teclado, overlay, formularios/carga y
la ruta de documentación. Una capacidad ausente se registra como hallazgo o
como exclusión razonada; nunca se omite silenciosamente.

No instalar ni copiar PrimeNG: es una referencia funcional externa, no una
dependencia ni fuente de estilos.

## 2. Gate estructural

Revisar el componente y su página de documentación con código y DOM real:

1. El elemento anfitrión usa semántica nativa cuando existe (`button`,
   `input`, `label`, `a`, `table`) y no inventa roles redundantes.
2. Cada subpieza existente en `comsatel-ds` se reutiliza o se extrae como
   primitivo compartido; no se recrea con markup local.
3. Los controles tienen nombre accesible, foco visible y relaciones ARIA
   completas (`aria-controls`, `aria-expanded`, `aria-activedescendant`,
   `aria-describedby`) cuando el patrón las requiere.
4. El orden de foco coincide con el orden visual. Un overlay tiene su estrategia
   de portal, cierre, retorno de foco y z-index semántico definida.
5. La página conserva el patrón real: breadcrumb, DemoShell/CodeBlock,
   accesibilidad, propiedades y lineamientos en dos columnas, sin `<select>`
   nativo para controles del playground.

La inspección del árbol de accesibilidad o DOM debe acompañar esta revisión;
leer solo el template no cuenta como evidencia.

## 3. Gate visual por estados

En un tab limpio, construir una matriz proporcional al componente. Revisar y
capturar evidencia de los estados que existan, no una lista artificial:

| Familia | Estados mínimos cuando aplican |
|---|---|
| Control | reposo, hover, foco visible, presionado, disabled, error/invalid, loading, seleccionado |
| Selección/lista | abierto, navegación de teclado, selección, vacía, filtro, lista larga y cierre/retorno de foco |
| Overlay | apertura, posición extrema, colisión/borde de viewport, Escape, clic afuera si corresponde, contenido completo sin recorte |
| Tamaños/contenido | cada tamaño, texto solo, ícono+texto, contenido largo y composición agrupada |
| Tema y movimiento | claro/oscuro, reducción de movimiento si anima, contraste de estados semánticos |

Para alineación fina, medir con `getBoundingClientRect()` los bordes, centros
o alturas que deben ser iguales. Para overlays, comprobar visualmente el panel
completo abierto y que no tape indebidamente controles o documentación. Para
lineamientos de uso, interactuar el demo independiente del Playground.

## Regla de cierre

`npm run build` y la compilación de Storybook validan la integridad técnica;
no sustituyen la evidencia de los tres gates. El informe final solo dice
`Finalizado` cuando enumera las interacciones y estados realmente revisados.
Si el navegador, la referencia o un estado necesario no estuvo disponible, el
componente queda `Pendiente de verificación` con la causa concreta.
