# Esquema de Investigaciones en Notion

Leer esta referencia solo cuando el usuario pide guardar o actualizar una investigación en Notion.

## Destino

- Espacio: `Herramientas de IA` → pestaña `Investigaciones` (antes se llamaba "Sistema de Skills")
- Base: [Investigaciones](https://app.notion.com/p/f481a7d063888272bc7f01197d112886)
- Data source: `collection://a6a1a7d0-6388-823a-a499-074ba7226336`
- Plantilla: [Nueva investigación](https://app.notion.com/p/a051a7d063888244a242814a0b68933c)

## Propiedades

| Propiedad | Para qué | Valores / formato |
|---|---|---|
| Investigación | Título del objeto estudiado | Título |
| Fase | Dónde está la investigación en su ciclo de decisión | Propuesta, En investigación, En validación, Aprobada, Descartada, Archivada |
| Enfoque | Naturaleza del objeto estudiado | Herramienta, Método, Producto, Benchmark |
| Prioridad | Nivel de atención | Alta, Media, Baja |
| Capacidades | Capacidades que la evidencia sostiene | Relación; opcional hasta identificarla |
| Skills derivados | Skills justificados por una decisión aprobada | Relación; vacía durante la exploración |
| Última revisión | Frescura del registro | Fecha; actualizarla cada vez que se reescribe la capa de lectura |

## Contenido de la página

Seguir las dos capas de `estructura-de-informe.md`:

1. **Capa de lectura** arriba: pregunta previa, `## Recursos`, `## En 30 segundos`,
   `## La historia`, `## Lo que todavía no sabemos`, `## Qué sigue`, `## Comprueba`.
2. Divisor `---` y `## Detalle técnico y registro completo`, con las nueve secciones del
   método como `## 1. …` a `## 9. …` y sus subsecciones en encabezado 3.

Las guías paso a paso se crean como **subpáginas** de la investigación y el bloque de la
subpágina se ubica bajo `## Recursos` (al crearse queda al final: moverlo con
`update_content`, quitando la línea `<page …>` del final y agregándola bajo Recursos en la
misma operación).

## Reglas de Notion

- Hacer `fetch` de la base y del registro existente antes de editarlo.
- Si la búsqueda con IA no está disponible, usar la búsqueda normal.
- Conservar el contenido de la página que no forma parte del cambio pedido.
- Íconos nativos de Notion (`icons/drafts_blue` para investigaciones), nunca emojis.
- Encabezado 2 y 3; nunca encabezado 1.
- Enlaces directos a las fuentes externas. Relaciones nativas para capacidades y skills.
