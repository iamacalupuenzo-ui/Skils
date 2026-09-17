# Matriz de verificación por ruta

La compilación es necesaria, pero no basta para declarar que un flujo de
producto, una API del DS o un cambio de Angular está terminado.

| Ruta | Evidencia mínima antes de cerrar | Declarar pendiente si |
| --- | --- | --- |
| Orientación sin edición | Destino identificado, skill recomendado y límite explícito | Falta acceso al repositorio o hay dos destinos plausibles |
| Épica o historias como origen | Plan versionado con módulos, flujos, historias INVEST, Given/When/Then, dependencias y supuestos marcados por `epica-a-plan-desarrollo` | Solo existe una URL o falta el texto/export legible de la épica; no se hace fetch automático |
| Aplicación consumidora | Build real, flujo crítico, control por teclado/foco, estado de error relevante, responsive y uso exclusivo de API pública | No hay runtime o datos para observar una interacción |
| Dirección visual | Propósito, audiencia, tono, jerarquía del primer viewport, contraste y ajuste de texto en tamaños relevantes | No existe actor, tarea o contenido real para evaluar |
| Comsatel DS | Validación que exige `comsatel-design-system`: contrato de API, pruebas afectadas, documentación y publicación solo si se autorizó | Cambiaría una API pública sin versión o sin evidencia de consumidores |
| Angular `packages/core` | Validaciones y pruebas exigidas por `reference-core` y el repositorio Angular | El checkout no es Angular o no se puede ejecutar su herramienta de pruebas |

## Cierre consolidado

```text
Coordinación cerrada
Destino: [repositorio y área verificada]
Ruta aplicada: [skills y orden]
Resultado: [plan, derivación o implementación validada]
Evidencia: [comandos, observaciones y estados]
No realizado: [límites o pendientes reales]
Siguiente responsable: [usuario, equipo consumidor o mantenedor del DS]
```

No atribuir al orquestador una prueba ejecutada por otro skill si no se recibió
su evidencia. Lo no observado se conserva como pendiente.
