# Plantilla del documento de salida

Estructura fija que arma `protocolo-analizar.md` y actualiza `protocolo-actualizar.md`.
Copiar esta estructura completa; no omitir secciones aunque queden cortas — declarar
"no aplica" o "sin hallazgos" en vez de eliminarlas, para que el agente que ejecute
el plan sepa que esa sección fue considerada.

```markdown
# Plan de desarrollo — [Proyecto] — [Nombre de la épica]

**Versión:** v[N] — [YYYY-MM-DD]
**Estado:** Nuevo / Actualización de v[N-1]
**Épica original:** [resumen fiel de una línea, o referencia a dónde vive completa]
**Verificado contra código existente:** Sí, en [ruta del repo] / No — sin acceso al repo del proyecto

## 1. Épica original

[Texto de la épica tal como la trajo el usuario, o resumen fiel si es muy larga.
Nunca parafrasear al punto de perder alcance o condiciones originales.]

## 2. Supuestos

- [SUPUESTO] [qué se asumió] — [por qué, y qué pasa si la asunción es incorrecta]
- (vacío → escribir "Sin supuestos: la épica cubrió todo lo necesario para este plan.")

## 3. Mapa de módulos

| Módulo | Descripción | Flujos que contempla | Orden sugerido |
|---|---|---|---|
| [nombre] | [una línea] | [lista de flujos] | [1, 2, 3...] |

## 4. Detalle por módulo

### Módulo: [nombre]

**Flujos:**

- **Flujo: [nombre]**
  - Actor: [quién dispara el flujo]
  - Disparador: [qué lo inicia]
  - Pasos: [secuencia numerada]
  - Sistemas involucrados: [frontend / backend / servicios externos / base de datos]
  - Resultado esperado: [qué queda verdadero al terminar]

**Historias de usuario:**

- **HU-[módulo]-01**: Como [rol], quiero [acción], para [beneficio]
  - Criterios de aceptación:
    - Given [contexto], When [acción], Then [resultado]
  - INVEST: [ok / observación puntual si algo quedó débil]

**Plan de testing del módulo:**

- Casos funcionales: [lista]
- Casos borde: [lista]
- No funcionales (si la épica los sugiere): [lista, o "no aplica"]
- Datos/mocks necesarios para probar: [lista]

## 5. Orden y dependencias de desarrollo

| Módulo | Depende de | Razón |
|---|---|---|
| [nombre] | [módulo o "ninguno"] | [una línea] |

## 6. Riesgos y preguntas abiertas

- [riesgo o pregunta] — [a quién o qué afecta si no se resuelve antes de implementar]

## 7. Para el agente de desarrollo

[Instrucciones directas y ejecutables, sin depender del chat original: orden de
implementación, qué historia usar como unidad de trabajo, qué correr para validar
cada módulo antes de darlo por cerrado. Ejemplo:]

> Implementar en el orden de la sección 5. Cada HU-* es una unidad de trabajo
> independiente. Antes de cerrar un módulo, correr los casos de la sección 4
> (plan de testing) para ese módulo. No avanzar al siguiente módulo si el
> anterior tiene HU sin criterios de aceptación cumplidos.
```

## Ejemplo relleno (fragmento corto, para calibrar nivel de detalle)

```markdown
### Módulo: Autenticación

**Flujos:**

- **Flujo: Recuperar contraseña**
  - Actor: usuario registrado que olvidó su contraseña
  - Disparador: clic en "Olvidé mi contraseña" en la pantalla de login
  - Pasos: 1) ingresa email → 2) sistema envía link de reseteo → 3) usuario abre
    link → 4) define nueva contraseña → 5) sistema confirma y redirige a login
  - Sistemas involucrados: frontend (formulario), backend (validación + token),
    servicio de email
  - Resultado esperado: usuario puede iniciar sesión con la nueva contraseña

**Historias de usuario:**

- **HU-auth-01**: Como usuario registrado, quiero solicitar un link de reseteo
  de contraseña con mi email, para poder recuperar el acceso sin contactar soporte.
  - Criterios de aceptación:
    - Given un email registrado, When lo envío en el formulario, Then recibo un
      correo con el link de reseteo en menos de 2 minutos.
    - Given un email no registrado, When lo envío, Then el sistema muestra un
      mensaje genérico sin confirmar si el email existe (evita enumeración de usuarios).
  - INVEST: ok

- **HU-auth-02**: Como usuario con un link de reseteo válido, quiero definir una
  nueva contraseña, para volver a acceder a mi cuenta.
  - Criterios de aceptación:
    - Given un link válido y no expirado, When defino una contraseña que cumple
      la política, Then la contraseña se actualiza y el link deja de ser válido.
    - Given un link expirado, When intento usarlo, Then el sistema lo rechaza y
      ofrece solicitar uno nuevo.
  - INVEST: ok

**Plan de testing del módulo:**

- Casos funcionales: solicitud de reseteo con email válido, definición de nueva
  contraseña con link válido.
- Casos borde: email no registrado, link expirado, link ya usado, contraseña que
  no cumple política.
- No funcionales: expiración del link — [SUPUESTO] 30 minutos, la épica no
  especificó el tiempo; confirmar con el usuario antes de implementar.
- Datos/mocks necesarios: cuenta de prueba registrada, servicio de email mockeado
  en ambiente de testing.
```
