---
name: epica-a-plan-desarrollo
description: Convierte una épica o historia de usuario ya redactada en un plan de desarrollo accionable — la segmenta en módulos, define los flujos end-to-end de cada módulo, la desglosa en historias de usuario más chicas (INVEST) con criterios de aceptación, y arma el plan de testing y el orden de implementación. Úsalo cuando el usuario ya tiene la épica escrita y necesita saber en qué módulos y flujos se divide antes de construir. No redacta historias de usuario desde cero ni implementa código.
metadata:
  version: "1.0.0"
---

# Épica a plan de desarrollo

Tomas una épica o historia de usuario que el usuario ya escribió y la conviertes en
un plan de desarrollo ejecutable: qué módulos contempla, qué flujos tiene cada uno,
en qué historias más chicas se desglosa cada flujo, y qué hay que testear antes de
dar cada módulo por terminado. El resultado es un archivo autocontenido que un
agente de desarrollo (Claude Code u otro) puede tomar como input para implementar,
sin depender de esta conversación.

## Lo que ES y NO ES

| Hace | No hace |
|---|---|
| Segmenta una épica ya escrita en módulos, flujos e historias | Redacta la épica o el problem statement desde cero |
| Define criterios de aceptación testeables por historia | Implementa o programa el código de ningún módulo |
| Arma el plan de testing por módulo | Ejecuta los tests — solo los enumera como parte del plan |
| Marca explícitamente los supuestos que la épica no cubre | Decide por el usuario un supuesto de negocio sin marcarlo como tal |
| Deja el documento listo para que un agente de desarrollo lo ejecute | Coordina o dispara la ejecución de ese agente |

## Referencias disponibles

- `references/criterios-segmentacion.md` — jerarquía épica→módulo→flujo→historia,
  checklist INVEST, patrones de split, anti-patrones. Leer antes de segmentar.
- `references/plantilla-plan-desarrollo.md` — estructura fija del documento de
  salida con un ejemplo relleno. Leer antes de armar el documento.
- `references/protocolo-analizar.md` — protocolo completo del modo ANALIZAR.
- `references/protocolo-actualizar.md` — protocolo completo del modo ACTUALIZAR.

## GUARD

1. **Entrada legible**: la épica debe llegar como texto (pegado, archivo, o
   export/captura de Notion o Figma). Si el usuario solo trae un link, pedir
   captura o export — no hacer fetch automático de la URL.
2. **Proyecto identificable**: determinar a qué proyecto pertenece esta épica
   (nombre explícito del usuario, o inferible del contexto de trabajo actual).
   Si no es identificable, preguntar solo eso.
3. **Plan previo**: buscar en `Documents\Proyectos\<proyecto>\` un archivo
   `epica-a-plan-desarrollo-<proyecto>-v*.md`. Si existe, el modo es ACTUALIZAR.
   Si no existe, el modo es ANALIZAR.
4. **Repo opcional**: si el proyecto tiene código accesible localmente, se puede
   usar como contexto para no duplicar módulos ya construidos — no es un
   requisito para completar el skill.

## Detección de modo

| Modo | Señal | Acción |
|---|---|---|
| `ANALIZAR` | No hay plan previo para este proyecto/épica | Leer `references/protocolo-analizar.md` completo y seguirlo |
| `ACTUALIZAR` | Ya existe un plan versionado y la épica cambió o se pide ajustar el desglose | Leer `references/protocolo-actualizar.md` completo y seguirlo |

Declarar el modo detectado en la primera línea de la respuesta antes de actuar.

## Comportamientos bloqueantes

- **B1 — Trazabilidad**: todo módulo, flujo o historia debe poder trazarse a un
  fragmento concreto de la épica. Si no hay base textual, se marca `[SUPUESTO]`
  explícito con la opción propuesta y la razón — nunca se presenta como hecho.
- **B2 — Nunca sobreescribir**: cada corrida guarda un archivo nuevo con versión
  incremental. No se edita ni se reemplaza un plan anterior.
- **B3 — Criterio de aceptación obligatorio**: ninguna historia se cierra sin al
  menos un criterio Given/When/Then verificable.
- **B4 — Sin fetch automático**: links de Notion, Figma u otras fuentes se piden
  como captura o export, nunca se intenta leer el link directamente.
- **B5 — Contraste con código existente declarado**: si hay repo accesible, se
  contrasta contra módulos ya construidos antes de proponerlos como nuevos; si no
  hay acceso, el documento declara explícitamente "no verificado contra código
  existente" — nunca se asume que el proyecto está vacío.
- **B6 — Documento autocontenido**: la sección 7 (para el agente de desarrollo)
  debe ser ejecutable sin contexto adicional de esta conversación.
- **B7 — No implementa**: este skill entrega el plan; no escribe código de
  producción ni ejecuta los tests que enumera.

## Racionalizaciones comunes

| Racionalización | Realidad |
|---|---|
| "La épica ya sugiere los roles, puedo asumir cuáles son" | Si no están enumerados explícitamente, es `[SUPUESTO]` marcado, no un hecho (B1) |
| "Es más rápido sobreescribir el archivo anterior" | Cada corrida es una versión nueva; el historial es parte del valor del documento (B2) |
| "El criterio de aceptación se entiende del nombre de la historia" | Cada historia necesita su Given/When/Then explícito antes de cerrarse (B3) |
| "Puedo abrir el link de Figma o Notion directo" | Pedir export o captura — nunca fetch automático (B4) |
| "No tengo acceso al repo, asumo que no hay nada construido todavía" | Declarar "no verificado", nunca asumir que está vacío (B5) |
| "El plan quedó claro en la charla, no hace falta que el archivo lo repita todo" | El documento debe bastarle a un agente que no vio esta conversación (B6) |

## Señales de alerta

- Una historia sin criterio de aceptación al momento de cerrar el documento.
- Un módulo sin flujos definidos.
- Un supuesto mezclado con los hechos de la épica sin la marca `[SUPUESTO]`.
- Un archivo de salida que reemplaza una versión anterior en vez de crear una nueva.
- Un módulo propuesto que ya existe en el código sin que se haya señalado el contraste.

## Formato de respuesta

- Declarar el modo detectado en la primera línea.
- Español neutro latinoamericano, tuteo, sin voseo.
- Sin emojis decorativos.
- El documento de salida completo vive en el archivo, no se pega entero en el chat —
  en la respuesta se resume: módulos encontrados, cantidad de historias, supuestos
  marcados, y la ruta del archivo.
- Cierre con el formato de `references/protocolo-analizar.md` o
  `references/protocolo-actualizar.md` según el modo usado.

## Referencias

- `references/criterios-segmentacion.md`
- `references/plantilla-plan-desarrollo.md`
- `references/protocolo-analizar.md`
- `references/protocolo-actualizar.md`
