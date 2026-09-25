---
name: epica-a-plan-desarrollo
description: Convierte una épica o historia de usuario ya redactada en un plan de desarrollo accionable — la segmenta en módulos, define los flujos end-to-end de cada módulo, la desglosa en historias de usuario más chicas (INVEST) con criterios de aceptación, y arma el plan de testing y el orden de implementación. Úsalo cuando el usuario ya tiene la épica escrita y necesita saber en qué módulos y flujos se divide antes de construir. No redacta historias de usuario desde cero ni implementa código.
metadata:
  version: "1.5.0"
---

# Épica a plan de desarrollo

Tomas una épica o historia de usuario que el usuario ya escribió y la conviertes en
un plan de desarrollo ejecutable: qué módulos contempla, qué flujos tiene cada uno,
en qué historias más chicas se desglosa cada flujo, y qué hay que testear antes de
dar cada módulo por terminado. El resultado es un archivo autocontenido que un
agente de desarrollo (Claude Code u otro) puede tomar como input para implementar,
sin depender de esta conversación. Cuando el usuario autoriza un mapeo en Notion,
conserva además la trazabilidad entre la épica, cada historia de usuario y sus casos
de uso; lee esa cadena completa antes de concluir que el alcance está cubierto.

## Lo que ES y NO ES

| Hace | No hace |
|---|---|
| Segmenta una épica ya escrita en módulos, flujos e historias | Redacta la épica o el problem statement desde cero |
| Define criterios de aceptación testeables por historia | Implementa o programa el código de ningún módulo |
| Arma el plan de testing por módulo | Ejecuta los tests — solo los enumera como parte del plan |
| Marca explícitamente los supuestos que la épica no cubre | Decide por el usuario un supuesto de negocio sin marcarlo como tal |
| Deja el documento listo para que un agente de desarrollo lo ejecute | Coordina o dispara la ejecución de ese agente |
| Mapea Épica → historia de usuario → casos de uso en Notion y audita su cobertura cuando ese destino fue solicitado | Modifica GitLab |

## Referencias disponibles

- `references/criterios-segmentacion.md` — jerarquía épica→módulo→flujo→historia,
  checklist INVEST, patrones de split, anti-patrones. Leer antes de segmentar.
- `references/plantilla-plan-desarrollo.md` — estructura fija del documento de
  salida con un ejemplo relleno. Leer antes de armar el documento.
- `references/protocolo-analizar.md` — protocolo completo del modo ANALIZAR.
- `references/protocolo-actualizar.md` — protocolo completo del modo ACTUALIZAR.
- `references/trazabilidad-notion.md` — protocolo condicional para leer, relacionar,
  auditar y mejorar la cadena Épica → historia de usuario → casos de uso en Notion.

## GUARD

1. **Entrada legible**: la épica debe llegar como texto, archivo, export/captura o
   contenido leído desde Notion cuando el usuario autorizó esa consulta y el conector
   está disponible. GitLab es una fuente opcional: se consulta solo si la API
   corporativa ya está disponible en ese equipo, normalmente mediante VPN. Su ausencia
   no bloquea un plan basado en Notion. Si no hay ninguna fuente legible, pedir
   captura o export; no solicitar credenciales ni acceso VPN.
2. **Proyecto identificable**: determinar a qué proyecto pertenece esta épica
   (nombre explícito del usuario, o inferible del contexto de trabajo actual).
   Si no es identificable, preguntar solo eso.
3. **Plan previo**: buscar en `Documents\Proyectos\<proyecto>\` un archivo
   `epica-a-plan-desarrollo-<proyecto>-v*.md`. Si existe, el modo es ACTUALIZAR.
   Si no existe, el modo es ANALIZAR.
4. **Repo opcional**: si el proyecto tiene código accesible localmente, se puede
   usar como contexto para no duplicar módulos ya construidos — no es un
   requisito para completar el skill.
5. **Destino Notion opcional**: solo si el usuario pidió registrar, mapear o revisar
   el plan en Notion, leer `references/trazabilidad-notion.md`, consultar el schema
   vivo y, por cada historia afectada, leer su contenido y todos los casos de uso
   asociados antes de proponer una mejora. La ausencia de Notion no bloquea el plan local.

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
- **B4 — Fuente autorizada y verificable**: Notion puede leerse mediante su conector
  cuando el usuario lo autorizó. Un enlace de GitLab puede leerse por API solo cuando
  la capacidad corporativa ya está disponible en ese equipo; nunca pedir credenciales,
  VPN ni usar esa excepción para modificar GitLab.
- **B5 — Contraste con código existente declarado**: si hay repo accesible, se
  contrasta contra módulos ya construidos antes de proponerlos como nuevos; si no
  hay acceso, el documento declara explícitamente "no verificado contra código
  existente" — nunca se asume que el proyecto está vacío.
- **B6 — Documento autocontenido**: la sección 7 (para el agente de desarrollo)
  debe ser ejecutable sin contexto adicional de esta conversación.
- **B7 — No implementa**: este skill entrega el plan; no escribe código de
  producción ni ejecuta los tests que enumera.
- **B8 — Fuente no equivale a desglose**: cuando una historia fuente contiene más de
  un flujo de valor independiente, se conserva como fuente y se crean historias
  derivadas INVEST relacionadas. Omitir esta relación pierde trazabilidad y mezcla
  alcances.
- **B9 — GitLab solo lectura**: aun cuando el token permita escritura, este skill
  nunca modifica issues, labels, estados, comentarios, relaciones, responsables ni fechas.
- **B10 — Cobertura antes de completar**: no declarar una historia lista ni crear una
  casuística por intuición. Debe contrastar cada flujo, regla y criterio de la historia
  contra sus casos de uso vinculados; un hueco queda como propuesta o decisión pendiente.

## Racionalizaciones comunes

| Racionalización | Realidad |
|---|---|
| "La épica ya sugiere los roles, puedo asumir cuáles son" | Si no están enumerados explícitamente, es `[SUPUESTO]` marcado, no un hecho (B1) |
| "Es más rápido sobreescribir el archivo anterior" | Cada corrida es una versión nueva; el historial es parte del valor del documento (B2) |
| "El criterio de aceptación se entiende del nombre de la historia" | Cada historia necesita su Given/When/Then explícito antes de cerrarse (B3) |
| "Sin GitLab no puedo continuar" | Si Notion contiene la épica, historia y casos autorizados, se planifica y audita desde esa cadena; GitLab es evidencia opcional (B4). |
| "Hay un token GitLab, entonces puedo editar la issue." | El token solo habilita obtener evidencia para este plan; cambios en GitLab requieren una solicitud separada. |
| "No tengo acceso al repo, asumo que no hay nada construido todavía" | Declarar "no verificado", nunca asumir que está vacío (B5) |
| "El plan quedó claro en la charla, no hace falta que el archivo lo repita todo" | El documento debe bastarle a un agente que no vio esta conversación (B6) |
| "Los casos existentes cubren la historia porque sus títulos se parecen" | Hay que leer el contenido de la historia y de cada caso, contrastar cobertura y registrar huecos o contradicciones (B10). |

## Señales de alerta

- Una historia sin criterio de aceptación al momento de cerrar el documento.
- Un módulo sin flujos definidos.
- Un supuesto mezclado con los hechos de la épica sin la marca `[SUPUESTO]`.
- Un archivo de salida que reemplaza una versión anterior en vez de crear una nueva.
- Un módulo propuesto que ya existe en el código sin que se haya señalado el contraste.
- Una historia fuente amplia con varios flujos pero sin historias derivadas vinculadas.
- Una historia sin casos de uso asociados, un caso sin historia padre o un flujo de la historia sin caso que lo cubra.

## Formato de respuesta

- Declarar el modo detectado en la primera línea.
- Español neutro latinoamericano, tuteo, sin voseo.
- Sin emojis decorativos.
- El documento de salida completo vive en el archivo, no se pega entero en el chat —
  en la respuesta se resume: módulos encontrados, cantidad de historias, supuestos
  marcados, y la ruta del archivo.
- Si hubo mapeo en Notion, informar historias revisadas, casos asociados, cobertura,
  mejoras propuestas o aplicadas, relaciones y decisiones pendientes; no afirmar que
  GitLab fue actualizado.
- Cierre con el formato de `references/protocolo-analizar.md` o
  `references/protocolo-actualizar.md` según el modo usado.

## Referencias

- `references/criterios-segmentacion.md`
- `references/plantilla-plan-desarrollo.md`
- `references/protocolo-analizar.md`
- `references/protocolo-actualizar.md`
- `references/trazabilidad-notion.md`
