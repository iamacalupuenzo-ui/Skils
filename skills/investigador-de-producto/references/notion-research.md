# Notion research schema

Use this reference only when the user asks to save or update research in Notion.

## Destination

- Hub: `Sistema de Skills` → `Investigaciones`
- Database: [Investigaciones](https://app.notion.com/p/f481a7d063888272bc7f01197d112886)
- Data source: `collection://a6a1a7d0-6388-823a-a499-074ba7226336`
- Template: [Nueva investigación](https://app.notion.com/p/a051a7d063888244a242814a0b68933c)

## Required properties

| Property | Purpose | Allowed values / format |
|---|---|---|
| Investigacion | Title of the object studied | Title |
| Fase | Where the research is in its decision lifecycle | Propuesta, En investigacion, En validacion, Aprobada, Descartada, Archivada |
| Enfoque | Nature of the object studied | Herramienta, Metodo, Producto, Benchmark |
| Prioridad | Attention level | Alta, Media, Baja |
| Capacidades | Capabilities supported by the evidence | Relation; optional until identified |
| Skills derivados | Skills justified by an approved decision | Relation; leave empty during exploration |
| Ultima revision | Freshness of the record | Date |

## Content template

Use the page structure in `Nueva investigación`:

1. Decision that the research must inform
2. Context and problem
3. Hypothesis and scope
4. Evidence and sources table
5. Plain-language explanation of how it works
6. Technical and operational anatomy
7. Comparison and evaluation
8. Executable improvement plan, if the product provides commands or fixes
9. Validation experiment and metrics
10. Recommendation and relationship to capabilities/skills

## Notion rules

- Use `notion_fetch` on the database and on an existing record before editing it.
- If AI search is unavailable, use regular Notion search.
- Preserve page content unrelated to the requested update.
- Include direct links to external sources. Use native relations for Notion capabilities and skills.
