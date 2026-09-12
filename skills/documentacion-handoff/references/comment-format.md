# Formato del Comentario — Redacción de Observaciones

## Estructura del campo Comment

```
Problema: [qué está mal en desarrollo, descripto con precisión y qué impacto tiene]
Corrección: [qué debe quedar — con valores exactos integrados naturalmente si aplica]
```

El campo **Heading** (título) sigue el patrón:
```
[Componente o elemento] — [descripción corta del problema]
```
Ejemplos: `Stepper — botón atrás inhabilitado`, `Header — flecha de regreso faltante`, `Copy — título de sección incorrecto`

---

## Reglas de Redacción

### ✓ Hacer
- **Contexto claro**: describir qué está mal y por qué importa al usuario
- **Corrección natural**: integrar medidas y colores dentro de la frase, no como lista separada
- **Estados explícitos**: mencionar `estado inhabilitado`, `estado activo`, `estado hover` cuando aplica
- **Valores exactos**: solo los confirmados desde el nodo Figma (ancho, alto, color hex, cornerRadius)
- **Lenguaje de diseño**: hablar de componentes, estados, espaciado — no de API ni de nodos

### ✗ No hacer
- Incluir IDs de nodo en el texto (`nodo 7:22946`)
- Usar el label `Especificación aprobada:` — es redundante, Corrección ya cumple esa función
- Lenguaje técnico de API (`fills[0].color`, `componentProperties`, `getNodeByIdAsync`)
- Inventar o estimar medidas que no se leyeron del nodo
- Bloques separados de "specs" fuera de la sección Corrección
- Redacción pasiva o vaga ("podría ser mejor", "parece incorrecto")

---

## Ejemplos

### Correcto
```
Heading: Stepper — botón atrás inhabilitado

Problema: El botón de regreso del stepper aparece en rojo y tiene funcionalidad activa en el Paso 1. El usuario podría volver al flujo anterior sin completar la acción.
Corrección: Debe estar inhabilitado en el Paso 1. Contenedor 24×48px, ícono en gris #cbced5, sin acción al tap.
```

```
Heading: Íconos canal — tamaño excesivo

Problema: Los íconos dentro del contenedor de canal de verificación son más grandes que el diseño aprobado.
Corrección: El contenedor del ícono debe ser 40×40px con fondo #ffffff. El ícono interno debe medir 20×20px.
```

```
Heading: Copy — título de sección incorrecto

Problema: El título muestra "Ingresa el código" cuando debería mostrar "Te enviamos un código por [canal]". El texto no refleja el canal seleccionado por el usuario.
Corrección: El título debe ser dinámico según el canal: SMS o correo. Solo mostrar el número/correo parcial debajo, no el texto "Ingresa el código de verificación".
```

### Incorrecto
```
❌ Especificación aprobada (nodo 7:22946): contenedor 24×48px, vector del ícono en #cbced5 (gris — estado disabled).
```
```
❌ fills[0].color devuelve #cbced5 según nodo 7:22946, el tamaño es width=24 height=48.
```
```
❌ El botón parece ser más pequeño que el aprobado, aproximadamente 28×28px.
```

---

## Tipo de Observación — Texto según severidad

| Tipo | Tono en Problema |
|------|-----------------|
| Problema mayor | Directo: impacto funcional o de flujo explícito |
| Problema menor | Preciso: inconsistencia visual concreta |
| Nota | Informativo: validación pendiente, consulta al equipo, aclaración |

Para **Nota**, la estructura puede ser solo un párrafo sin Corrección si no hay acción de diseño requerida:
```
Heading: Validación — componente de actualización de número

El componente de validación que aparece al actualizar el número telefónico debe ser idéntico al componente de verificación en desarrollo. Validar con el equipo de desarrollo que se usa el mismo componente.
```
