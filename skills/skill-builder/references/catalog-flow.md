# Flujo canónico del catálogo de skills

Este documento define cómo se crea, actualiza, publica e instala un skill reutilizable.
El repositorio [Skils](https://github.com/iamacalupuenzo-ui/Skils) es la fuente única de
verdad. Las carpetas de `~/.codex/skills` y `~/.claude/skills` son destinos instalados,
no lugares donde se mantiene la versión canónica.

## Resolver la fuente

1. Si existe `SKILS_REPOSITORY`, usar esa ruta.
2. En otro caso, localizar el repositorio Git que contiene `skills-manifest.json` y cuyo
   remoto `origin` es `https://github.com/iamacalupuenzo-ui/Skils.git`.
3. Si no se puede resolver, detener la edición reutilizable e informar la ruta que falta.

Estructura esperada:

```text
Skils/
  skills/
    nombre-del-skill/
      SKILL.md
      references/
  skills-manifest.json
  bin/skils.js
```

## Ciclo de creación o actualización

1. Leer el skill y referencias afectadas; para uno nuevo, diseñar su arquitectura.
2. Escribir o editar exclusivamente en `Skils/skills/<nombre>/`.
3. Para un skill nuevo, agregar su nombre exacto a `skills-manifest.json`.
4. Validar el contenido y ejecutar `npm test` desde la raíz de `Skils`.
5. Probar el instalador sin escribir destinos reales:

   ```powershell
   node bin/skils.js install --target all --skill <nombre> --dry-run
   ```

6. Sincronizar la fila correspondiente de la base **Skills** de Notion con estado,
   descripción, disparadores, entornos y ruta fuente cuando el alcance autorice el
   registro. Usar la fila existente si el skill ya está registrado.
7. Informar el cambio validado. No publicar ni instalar todavía si el usuario no lo pidió.

## Publicación e instalación

Son operaciones independientes y requieren alcance explícito:

| Operación | Comando o acción | Resultado verificable |
| --- | --- | --- |
| Publicar | `git add`, `git commit`, `git push origin main` | Commit visible en `origin/main` |
| Instalar por primera vez | `npx --yes github:iamacalupuenzo-ui/Skils#main install --target all` | `doctor` informa `OK` |
| Actualizar instalaciones | `npx --yes github:iamacalupuenzo-ui/Skils#main update --target all` | `doctor` informa `OK` |
| Validar sin escribir | Agregar `--dry-run` a install o update | Lista de cambios previstos |

Después de instalar, ejecutar:

```powershell
npx --yes github:iamacalupuenzo-ui/Skils#main doctor --target all
```

Codex puede requerir reinicio si no redescubre el skill; Claude Code lo leerá al iniciar
una sesión nueva.

## Registro en Notion

Destino: base [Skills](https://app.notion.com/p/baa1a7d0638883f3b83d81e8697cc2b7).

Propiedades que se mantienen para un skill reutilizable:

- `Skill`: nombre exacto en kebab-case.
- `Estado del skill`: usar `Activo` solo tras validar su disponibilidad.
- `Descripción`, `Cuándo usarlo` y `Disparadores`.
- `Entornos compatibles`: declarar únicamente ambientes verificados.
- `Tipo`, `Prioridad de construcción`, `Capacidades` si corresponde.
- `Repositorio fuente`: `agent-skills` para este catálogo compartido.
- `Ruta local`: ruta fuente del directorio dentro de `Skils/skills/`.
- `Última revisión`.

No registrar una instalación como si fuera una creación y no crear una fila duplicada por
cambiar de computador. El repositorio conserva el historial; Notion conserva el índice
operativo y las relaciones.
