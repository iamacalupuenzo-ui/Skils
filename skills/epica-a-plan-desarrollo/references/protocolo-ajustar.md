# Protocolo AJUSTAR — cambios pedidos durante el desarrollo

Se activa cuando, durante la construcción, el usuario pide que un flujo funcione de
otra manera o el builder detecta que un caso de uso no se puede construir tal como
está escrito. Normalmente llega como una **Solicitud de ajuste de producto** derivada
por el builder (`angular-product-builder`); también puede pedirla el usuario
directamente. Este skill es el único que modifica épicas, historias y casos de uso:
el builder nunca los edita.

## Entrada esperada

```text
Solicitud de ajuste de producto
Caso afectado: [CU-… o "nuevo flujo"]
Historia / épica: [US… / EP-…]
Qué cambia: [comportamiento actual → comportamiento pedido]
Por qué: [motivo]
Quién lo pidió y cuándo: [persona, fecha]
Impacto en desarrollo: [qué está construido, qué se pausó]
Evidencia: [mensaje, captura o decisión]
```

Si falta "qué cambia" o "quién lo pidió", pedir solo ese dato antes de editar.

## Fase 0 — Leer la cadena completa

Leer la épica, la historia padre, su ficha técnica y **todos** los casos de uso de
esa historia, no solo el afectado: un cambio de flujo suele tocar estados o reglas
que otros casos también usan.

## Fase 1 — Clasificar el impacto

| Nivel | Señal | Qué se actualiza |
|---|---|---|
| Caso | Cambia un paso, un alterno, un error, un estado, un campo o un mensaje | El caso de uso |
| Regla | Cambia una regla de negocio (R-xx) que aplica a varios casos | La ficha técnica, su mapa de cobertura y cada caso que aplica la regla |
| Alcance | Aparece un flujo nuevo, se elimina uno o cambia lo que la historia promete | La historia (relato y ficha), la épica si cambia su alcance, y los casos |

Si el cambio contradice la fuente oficial (por ejemplo, una issue de GitLab), no se
modifica la fuente: se registra en la ficha técnica como **decisión** con quién la
tomó y cuándo, y se avisa al usuario de la diferencia.

## Fase 2 — Actualizar

Según el nivel, y respetando la estructura de `trazabilidad-notion.md`:

1. **Caso de uso:** flujo principal, alternos, errores, estados de pantalla, campos,
   mensajes, criterios de aceptación y **diagrama** (se regenera desde el texto con
   sus reglas). Un flujo nuevo independiente es un caso nuevo de la misma historia
   (B8), nunca una historia nueva.
2. **Ficha técnica:** la regla afectada y el mapa de cobertura.
3. **Historia:** el relato, solo si cambia lo que el actor puede hacer.
4. **Épica:** "Qué se construye" y "Alcance", solo si cambia el alcance.
5. **Historial de cambios** al final de cada caso modificado: fecha, qué cambió, por
   qué y quién lo pidió. Es la evidencia de que el cambio fue decidido y no inventado.
6. Si existe un plan local, guardar una versión nueva según `protocolo-actualizar.md`
   (B2).

Releer cada registro modificado y los extremos de sus relaciones.

## Fase 3 — Devolver al builder

Entregar una respuesta que el builder pueda usar sin releer toda la conversación:

```text
Ajuste aplicado
Casos actualizados: [CU-… con enlace]
Qué cambió en cada uno: [pasos, estados, criterios]
Criterios de aceptación vigentes: [CA-… nuevos o modificados]
Pendientes que siguen abiertos: [decisiones]
Puede continuar: [sí / no, y qué falta]
```

## Cierre

```
Resultado: ajuste de producto aplicado — [caso o historia]
Nivel:     caso / regla / alcance
Cambios:   [registros modificados con enlace]
Plan local: [nueva versión / no existe]
Siguiente: el builder retoma la pieza pausada
```
