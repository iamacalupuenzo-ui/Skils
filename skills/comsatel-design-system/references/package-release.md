# Publicación verificable de Comsatel DS

Este protocolo aplica solo al mantenedor que publica
`@iamacalupuenzo-ui/comsatel-ds`. No se usa para instalar o consumir la
librería en una aplicación Angular.

## Separación de responsabilidades

Un `git push` publica código fuente; `npm publish` crea un artefacto en GitHub
Packages. Son servicios, credenciales y evidencias distintos. No afirmar que
una versión está disponible para consumidores hasta que el registro responda
con esa versión exacta.

- **Consumidor:** necesita un token clásico con `read:packages` y su propia
  autorización de lectura. No recibe ni reutiliza una credencial de publicación.
- **Publicador local:** necesita `write:packages` y acceso al repositorio que
  posee el paquete. No guardar ese token en Git, documentos ni logs.
- **Publicador recomendado:** GitHub Actions con `permissions: packages: write`.
  Centraliza el release y evita compartir un token personal de escritura.

## Preflight local

1. Confirmar la versión objetivo en
   `projects/comsatel-ds/package.json` y que existe su nota de release.
2. Ejecutar `npm run check:release-notes`, los tests y `npm run build:lib`.
3. Verificar autenticación sin mostrar secretos:

   ```powershell
   npm whoami --registry=https://npm.pkg.github.com
   ```

4. Confirmar que la versión aún no existe. Una versión publicada es inmutable;
   nunca intentar sobrescribirla:

   ```powershell
   npm view @iamacalupuenzo-ui/comsatel-ds@<version> version --registry=https://npm.pkg.github.com
   ```

   Un `404` para `<version>` permite continuar; un valor existente exige subir
   una versión nueva o detener el release.

## Publicación y evidencia

Desde `dist/comsatel-ds`, ejecutar:

```powershell
npm publish --access public
```

Luego verificar el artefacto y el tag de distribución:

```powershell
npm view @iamacalupuenzo-ui/comsatel-ds@<version> version --registry=https://npm.pkg.github.com
npm dist-tag ls @iamacalupuenzo-ui/comsatel-ds --registry=https://npm.pkg.github.com
```

Solo después de que ambos comandos muestren la versión esperada se crea y sube
el tag Git `ds-v<version>`. Reportar por separado el commit, el paquete, el tag
y cualquier despliegue de documentación.

## Diagnóstico de bloqueos

| Evidencia | Causa probable | Acción |
| --- | --- | --- |
| `401 unauthenticated` | La variable de entorno no llegó al proceso o el token no es válido. | Comparar presencia, no valor, de la variable de usuario y del proceso; reiniciar la aplicación que ejecuta npm. |
| `403 ... expected scopes` | El token tiene lectura pero no `write:packages`. | Crear un token clásico de publicación con el scope faltante o usar GitHub Actions. |
| La fuente dice una versión, `npm view` no la encuentra | El commit se subió, pero el artefacto no se publicó. | No recomendar esa versión a consumidores; resolver el publish primero. |
| La versión ya existe | Los paquetes no se sobrescriben. | Incrementar versión, actualizar nota de release y repetir gates. |
