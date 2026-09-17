# Mapa de enrutamiento de Comsatel Product Orchestrator

Este mapa separa la toma de decisión del trabajo especializado. El orquestador
elige la ruta y conserva la evidencia; no reemplaza al skill elegido ni mezcla
sus permisos.

## Inventario de responsabilidades

| Skill | Responsabilidad exclusiva | Cuándo se invoca | No usar para |
| --- | --- | --- | --- |
| `comsatel-product-orchestrator` | Clasificar la petición, ordenar la secuencia y consolidar el resultado | Peticiones ambiguas, transversales o que requieren más de un dominio | Implementar pantallas, modificar APIs o publicar por cuenta propia |
| `epica-a-plan-desarrollo` | Segmentar una épica ya redactada en módulos, flujos, historias INVEST, criterios y plan de pruebas | La entrada incluye una épica, historias o export legible de GitLab/GitHub antes de construir | Leer enlaces automáticamente, crear épicas desde cero o implementar código |
| `comsatel-angular-product-builder` | Planificar y construir una aplicación Angular que consume el paquete publicado | Pantallas, flujos, formularios, alertas, mapas o una aplicación nueva | Modificar componentes o archivos internos de Comsatel DS |
| `frontend-design-direction` | Definir dirección visual y revisar jerarquía, tono, densidad y consistencia | La petición construye o mejora una interfaz y requiere una decisión visual explícita | Reemplazar investigación de producto, flujos o contratos de componentes |
| `comsatel-design-system` | Auditar o cambiar componentes, tokens, documentación, pruebas y publicación del DS | La petición toca el repositorio del DS o falta/cambia una API pública | Construir una aplicación consumidora como si fuera parte del DS |
| `reference-core` | Guiar cambios al runtime interno de Angular | El destino verificado es `packages/core` de un checkout de Angular | Aplicaciones Angular, librerías de negocio, componentes Comsatel o documentación de producto |

## Árbol de decisión

1. Si la solicitud parte de una épica, historia o export de GitLab/GitHub,
   comprobar que su contenido es legible. Si solo hay URL, pedir texto o export
   y detener esa rama; no se hace fetch automático. Con contenido legible,
   activar `epica-a-plan-desarrollo` y usar su documento de salida como entrada
   del flujo de producto.
2. Identifica el destino real leyendo el manifiesto, las rutas y el estado Git.
   Un directorio que contiene `package.json` no identifica por sí solo un
   proyecto consumidor, Comsatel DS ni Angular.
3. Si el destino es un checkout de Angular y el cambio afecta
   `packages/core/**`, activa `reference-core`. Ese skill es obligatorio para
   ese alcance y el orquestador permanece como coordinador.
4. Si el destino es Comsatel DS o la petición solicita crear, modificar,
   documentar, probar o publicar un componente/tokens/export público, deriva a
   `comsatel-design-system` y no construye producto en ese mismo recorrido.
5. Si el destino es una aplicación consumidora o se pidió iniciar una nueva,
   deriva a `comsatel-angular-product-builder`.
6. Durante una pantalla o flujo consumidor, activa
   `frontend-design-direction` después de que Product Builder haya definido
   actor, tarea, estados y restricciones, y antes de cerrar decisiones de
   jerarquía, densidad, tono y responsive.
7. Si el consumidor necesita una API, token, asset o comportamiento público
   inexistente, detén esa pieza. Produce un handoff para Comsatel DS; no copies
   CSS, assets o archivos internos y no inventes una variante local.

## Secuencia para una característica consumidora

```text
Necesidad del usuario
  -> Épica/historias disponibles: segmentación trazable con Épica a plan de desarrollo
  -> Product Builder: actores, reglas, estados, datos y plan
  -> Frontend Design Direction: dirección visual acorde al dominio
  -> Comsatel DS: solo si debe confirmar una API pública o falta un contrato
  -> Product Builder: implementación con componentes y estilos públicos
  -> Verificación: build, flujo crítico, teclado, foco, responsive y estados
```

No se invierte la secuencia: definir una estética antes de conocer el flujo
convierte la interfaz en decoración; confirmar un componente desde código
interno rompe el contrato de consumo.

## Disponibilidad y recuperación

Antes de nombrar un skill externo como ejecutable, comprueba una de estas rutas:

```powershell
$candidates = @(
  (Join-Path $env:USERPROFILE '.codex\skills\frontend-design-direction'),
  (Join-Path $env:USERPROFILE '.claude\skills\frontend-design-direction')
)
$candidates | Where-Object { Test-Path -LiteralPath (Join-Path $_ 'SKILL.md') }
```

Repite la verificación cambiando el nombre a `reference-core`. Si falta uno,
declara la capacidad pendiente y conserva la ruta que sí puede ejecutarse. No
copies el contenido externo dentro de un proyecto ni lo declares disponible
solo porque el repositorio remoto sea accesible.

Los comandos de referencia para instalar los dos skills evaluados en Codex son:

```powershell
npx skills add https://github.com/angular/angular/tree/main/.agent/skills/reference-core -g -a codex -y
npx skills add https://github.com/affaan-m/ECC/tree/main/docs/ja-JP/skills/frontend-design-direction -g -a codex -y
```

Son operaciones de instalación independientes. Deben ejecutarse solo cuando el
usuario las haya autorizado y requieren una nueva sesión del agente para que el
catálogo se redescubra.
