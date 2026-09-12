# Investigación: CLI para instalación directa de skills

**Fecha:** 2026-09-12  
**Decisión que informa:** si el catálogo compartido de skills debe instalarse mediante
una CLI determinista en lugar de depender de que un agente de IA copie y configure
archivos por conversación.  
**Lector:** quien mantiene el catálogo de skills y quien prepara un equipo nuevo con
Codex y Claude Code.

## 1. El punto de partida: una capacidad útil, pero repartida

El sistema ya tenía skills activos en dos ambientes locales y una base de Notion para
describirlos. El problema no era crear otro skill: era que instalar el mismo conjunto en
un equipo requería pedirle a un agente que interpretara una instrucción, localizara
carpetas, decidiera qué copiar y modificara los dos destinos.

Ese camino funciona una vez, pero no define una instalación reproducible. Dos sesiones
pueden interpretar “instala los skills” de forma distinta, dejar un skill fuera o usar
una fuente local desactualizada. El riesgo más importante no es que el agente falle por
mala intención: es que el resultado dependa de razonamiento conversacional para una
operación que en realidad es mecánica.

**Hecho verificado:** la base `Skills` de Notion tenía siete registros activos. Los
directorios actuales publicados son `comsatel-design-system`, `design-handoff`,
`design-qa`, `gestion-proyectos`, `investigador-de-producto`, `notion-workspace` y
`skill-builder`. Tres registros históricos se mapearon explícitamente a sus nombres
vigentes en `notion-registry.md` del repositorio.

## 2. Hipótesis y alcance

**Hipótesis a validar:** una CLI que instale el catálogo desde una única fuente reducirá
instalaciones incompletas y dependencia operativa de agentes, sin impedir que los
agentes sigan aportando valor donde sí se necesita criterio.

El alcance es la distribución e instalación de instrucciones y referencias. No cubre:

- La ejecución de un skill una vez instalado.
- La configuración de credenciales, MCPs o permisos externos que un skill pudiera
  requerir.
- La actualización automática al publicar un commit: cada equipo decide cuándo adoptar
  `main` mediante un comando explícito.

## 3. Qué se construyó

Se creó el repositorio central [`Skils`](https://github.com/iamacalupuenzo-ui/Skils),
con un catálogo declarativo en `skills-manifest.json` y una CLI Node llamada `skils`.

Clasificación técnica:

| Parte | Tipo de activo | ¿Necesita modelo de IA? | Rol |
| --- | --- | --- | --- |
| `bin/skils.js` | Programa / CLI determinista | No | Valida y copia skills. |
| `skills-manifest.json` | Configuración declarativa | No | Define el conjunto aprobado. |
| `skills/*` | Instrucciones y referencias | No al instalar; sí al ser interpretadas por un agente | Guían el trabajo posterior. |
| Codex o Claude Code | Consumidor de skills | Sí, cuando ejecuta un skill | Interpreta las instrucciones. |
| GitHub | Servicio de distribución | No | Entrega una versión del catálogo. |

**Hecho verificado:** la CLI se publica como paquete Node con el binario `skils`. Sus
comandos son `install`, `update`, `list` y `doctor`; requiere Node.js 20 o superior y
Git para resolver el repositorio desde GitHub.

## 4. Cómo funciona, contado desde un equipo nuevo

Un equipo nuevo no necesita explicar su intención a un agente. Ejecuta:

```powershell
npx --yes github:iamacalupuenzo-ui/Skils#main install --target all
```

La CLI resuelve el catálogo en la rama indicada, lee los siete nombres aprobados y
verifica que cada fuente contenga `SKILL.md`. Después crea, si hace falta, los destinos:

| Sistema | Codex | Claude Code |
| --- | --- | --- |
| Windows | `%USERPROFILE%\\.codex\\skills` | `%USERPROFILE%\\.claude\\skills` |
| macOS / Linux | `~/.codex/skills` | `~/.claude/skills` |

Para cada skill, la CLI copia primero a un directorio temporal. Solo cuando esa copia
está completa reemplaza la carpeta de destino. Si el reemplazo falla, intenta restaurar
el directorio anterior. El directorio previo es transitorio: no se conserva como un
respaldo que pueda confundir al descubrimiento de skills. Git es el historial de
versiones.

También permite `--target codex`, `--target claude`, `--skill nombre1,nombre2`,
`--dry-run` y rutas alternativas mediante `--codex-dir` o `--claude-dir`.

## 5. La comparación: dónde debe vivir el criterio

| Aspecto | Instalación por agente | Instalación con CLI `skils` |
| --- | --- | --- |
| Entrada | Lenguaje natural | Comando con opciones explícitas |
| Selección de skills | El agente interpreta el pedido | Manifiesto versionado |
| Repetibilidad | Depende de la sesión, contexto y modelo | Mismo manifiesto + mismo comando |
| Necesidad de IA | Sí | No |
| Escritura en disco | Decidida durante la conversación | Limitada a los destinos y skills declarados |
| Auditoría | Historial conversacional | Commit Git + salida de terminal |
| Actualización | Hay que volver a pedirla | `skils update --target all` |
| Criterio humano | Puede mezclarse con la tarea mecánica | Se concentra antes: revisión y publicación del commit |

**Inferencia:** la CLI no reemplaza a los agentes; desplaza el uso de agentes hacia
donde agregan valor. Un agente sirve para investigar, diseñar un skill, revisar una
adaptación o explicar un error. Copiar un catálogo aprobado a dos rutas no requiere ese
criterio y conviene que sea determinista.

## 6. Evidencia de la primera validación

| Prueba | Resultado | Etiqueta |
| --- | --- | --- |
| Validación sintáctica `npm test` | `node --check bin/skils.js` terminó correctamente | Hecho verificado |
| Catálogo | `skils list` devolvió los siete skills publicados | Hecho verificado |
| Instalación aislada | Se instalaron 7 skills en un destino temporal de Codex y 7 en otro de Claude Code | Hecho verificado |
| Verificación aislada | `skils doctor` encontró los 7 `SKILL.md` en ambos destinos | Hecho verificado |
| Actualización selectiva | `update --target codex --skill investigador-de-producto` terminó correctamente | Hecho verificado |
| Ejecución desde GitHub | `npx --yes github:iamacalupuenzo-ui/Skils#main list` devolvió los 7 skills | Hecho verificado |

La validación ejercitó **14 operaciones de instalación** en total, siete por destino.
No se invocó ningún modelo de IA durante esas pruebas.

## 7. Límites, seguridad y lo que todavía no sabemos

La CLI no vuelve seguro un skill por sí sola. Instalar desde `main` significa confiar en
el contenido de ese commit. Por eso la revisión debe ocurrir antes del merge y la
instalación debe usar el repositorio central, no copias de carpetas personales.

**Hecho verificado:** la CLI valida la presencia de `SKILL.md`, limita la selección a
`skills-manifest.json` y usa rutas de destino explícitas.  
**No verificado:** todavía no se ejecutó `skils install --target all` sobre los dos
directorios activos de un equipo de uso cotidiano. La prueba fue deliberadamente aislada
para evitar modificar entornos de trabajo durante la validación inicial.  
**Hipótesis a validar:** que el flujo reduzca efectivamente el tiempo de preparación y
los errores de instalación en equipos reales.

Hay un límite conceptual importante: una CLI instala instrucciones, pero no garantiza
que las herramientas o MCPs citados dentro de todos los skills estén configurados en el
equipo. La instalación es reproducible; la compatibilidad operacional de cada integración
se verifica por separado.

## 8. Métricas y siguiente experimento

El éxito no debe medirse por “skills copiados”, que es una métrica de actividad. La
métrica propia propuesta es:

> Un equipo nuevo llega a tener el catálogo aprobado y operativo en Codex y Claude Code
> sin intervención de un agente, sin omisiones y con una salida verificable.

Experimento mínimo:

1. En un perfil o equipo sin los skills, ejecutar primero `install --dry-run` y luego
   `install --target all`.
2. Ejecutar `doctor --target all` y comprobar siete resultados `OK` por ambiente.
3. Abrir una sesión nueva de cada agente y verificar que aparecen los skills esperados.
4. Medir tiempo total, número de pasos manuales y errores o correcciones necesarias.
5. Repetir después de un cambio publicado con `update --target all`.

Criterio de éxito: 14 verificaciones `OK`, cero archivos instalados fuera de los destinos
declarados y cero intervención de un agente durante instalación o actualización.

## 9. Recomendación

**Adoptar con validación en equipo real.** La CLI ya demostró que puede distribuir el
catálogo de manera reproducible en pruebas aisladas y que puede ejecutarse desde GitHub.
Debe convertirse en el camino estándar para instalar y actualizar skills.

La política resultante es simple:

1. El repositorio `Skils` es la fuente única de verdad.
2. Los cambios se revisan y publican allí.
3. Cada equipo adopta la versión aprobada con `skils install` o `skils update`.
4. Un agente no instala por conversación un catálogo completo; se usa para investigación,
   construcción, diagnóstico y revisión.

El siguiente paso verificable es realizar la primera instalación real con el modo
`--dry-run`, revisar la lista y después ejecutar `install --target all` en los dos
ambientes activos.
