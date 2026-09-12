# Clasificación de Observaciones

## Tipo — Severidad del problema

| Tipo | Cuándo usar | Ejemplos |
|------|------------|---------|
| **Problema mayor** | Rompe el flujo, incumple spec crítica, impacto funcional en el usuario | Botón activo cuando debe estar inhabilitado, flujo de regreso incorrecto, componente faltante |
| **Problema menor** | Inconsistencia visual, medida o color incorrecto, no impacta función | Ícono más grande que el diseño aprobado, espaciado incorrecto, color de fondo inexacto |
| **Nota** | Validación pendiente, consulta al equipo, observación informativa sin corrección inmediata | Verificar si el componente X es el mismo que Y, confirmar comportamiento con desarrollo |

---

## Etiqueta Tipo — Categoría del problema

### Diseño de Interacción
Problemas de **comportamiento y estado** de componentes.

Usar cuando:
- Un componente muestra el estado incorrecto (activo cuando debe estar disabled, hover sin interacción)
- Falta feedback visual de interacción (tap state, loading, success/error)
- Un componente tiene funcionalidad que no debería tener (botón disabled que responde al tap)
- El comportamiento al interactuar no coincide con el diseño aprobado

Ejemplos: botón de regreso rojo y activo (debe ser gris y disabled), stepper sin estado de paso actual marcado

---

### Jerarquía Visual y Consistencia
Problemas de **tamaño, tipografía, color, espaciado y coherencia con el Design System**.

Usar cuando:
- Medidas incorrectas (ancho, alto, cornerRadius, padding)
- Color de fondo, ícono o texto distinto al aprobado
- Tipografía incorrecta (tamaño, peso, alineación)
- Espaciado entre elementos no coincide
- Inconsistencia con otros componentes del mismo tipo en la misma pantalla

Ejemplos: ícono 40×40px en dev vs 20×20px aprobado, título 18px en dev vs 16px aprobado, fondo #f6f7f8 en lugar de #ffffff

---

### Navegación e Incorporación
Problemas de **flujo entre pantallas, acceso a funcionalidades y onboarding**.

Usar cuando:
- Falta el botón o gesto de regreso
- La navegación lleva a una pantalla incorrecta
- Un elemento de acceso a funcionalidad no está visible o está en el lugar equivocado
- El flujo de incorporación no sigue la secuencia del diseño aprobado

Ejemplos: flecha de regreso faltante en el header, stepper sin indicación del paso actual, componente de validación en posición incorrecta

---

### Manejo de Errores y Textos
Problemas de **copy, mensajes de error, contenido visible/oculto y textos dinámicos**.

Usar cuando:
- El texto no coincide con el copy aprobado
- Se muestra más información de la necesaria (número completo en lugar de parcial)
- Falta un mensaje de error o estado vacío
- El copy no es dinámico cuando debería serlo (texto fijo en lugar de personalizarse por canal/usuario)
- Texto truncado o cortado incorrectamente

Ejemplos: "Ingresa el código" en lugar de "Te enviamos un código por SMS", número de teléfono completo visible en lugar de `*** *** 987`

---

## Árbol de Decisión

```
¿El problema es de comportamiento o estado del componente?
  → SÍ → Diseño de Interacción

¿El problema es de medida, color, tipografía o espaciado?
  → SÍ → Jerarquía Visual y Consistencia

¿El problema es que falta un elemento de navegación o el flujo es incorrecto?
  → SÍ → Navegación e Incorporación

¿El problema es el texto, copy, contenido visible o mensajes?
  → SÍ → Manejo de Errores y Textos

¿No hay corrección inmediata, es una validación o consulta?
  → Tipo: Nota → categoría según el tema de la consulta
```
