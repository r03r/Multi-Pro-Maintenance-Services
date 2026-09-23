# Firma, plantilla y documentos MULTI-PRO

Repositorio: `r03r/Multi-Pro-Maintenance-Services`.

## Dirección pública

La dirección estable es **https://multi-pro-maintenance-services.vercel.app**.
La web y las imágenes responden sin iniciar sesión. No usar el despliegue antiguo
`multi-pro-maintenance-services-60b6druky-r03rs-projects.vercel.app`: redirige al
inicio de sesión de Vercel y no recibe los siguientes despliegues.

Los HTML mantienen URLs absolutas HTTPS para que las imágenes funcionen al copiar
la firma o enviar el correo. Se conservan los originales `logo-main.jpg`,
`facebook.png` y `whatsapp.png` de cada carpeta.

La landing usa `/brand/logo.png`, una copia sin modificaciones del logo transparente
preparado en EVERTH, en cabecera, bloque principal, chat, pie y favicon. Los correos,
PDF y vista previa social conservan el JPG existente. Las imágenes mantienen su
proporción; se eliminaron las referencias al logo externo y a `/logo-new.png`.

Facebook oficial: https://www.facebook.com/people/Multi-Pro-Maintenance-Services/61588758281593/?sfnsn=wa&mibextid=RUbZ1f

## Rutas

- `/email-signature/`: firma para copiar desde el navegador al editor de firmas.
- `/email-template/`: correo de presentación; sustituir `[Contact Name]` antes de enviarlo.
- `/email-signature/logo-main.jpg`, `/email-signature/facebook.png`, `/email-signature/whatsapp.png`.
- `/email-template/logo-main.jpg`, `/email-template/facebook.png`, `/email-template/whatsapp.png`.
- `/sitemap-index.xml`: índice generado por `@astrojs/sitemap` en cada compilación.
- `/sitemap.xml`: ruta compatible que apunta al sitemap generado `/sitemap-0.xml`.
- `/robots.txt`: anuncia el índice y excluye `/admin/` del rastreo.

La firma y la plantilla incluyen `noindex,follow` porque son herramientas de correo.
Estas rutas y `/admin/` se excluyen del sitemap. Esto no constituye autenticación.

## PDF de presupuestos y facturas

El panel `/admin/` genera los documentos al pulsar **Imprimir**. No necesita un
PDF estático en `public/documents`. La ventana de impresión incluye el logo
oficial de `/email-signature/logo-main.jpg` mediante una URL absoluta del sitio
actual; funciona tanto en local como en Vercel.

El botón **Imprimir / Guardar como PDF** se habilita después de cargar y decodificar
el logo. Si falla la carga, aparece un mensaje con un botón para reintentar. El
logo se imprime como imagen, sin depender de activar los fondos de impresión.

## Validación y despliegue

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm preview
```

Abrir `/email-signature/`, `/email-template/`, `/sitemap.xml` y `/robots.txt` en la
dirección local indicada por Astro. Las imágenes de los correos se cargan desde
producción por diseño.

`vercel.json` instala con el lockfile y compila el código fuente a `dist`.
`.vercel/`, `dist/` y `node_modules/` no se versionan. Se retiró el adaptador Vercel
porque todas las rutas son estáticas. No publicar con `--prebuilt` ni volver a
subir `.vercel/output`: Vercel priorizaba esos archivos antiguos y omitía el build,
por lo que los cambios de código no aparecían en producción.

Después de revisar y confirmar los cambios, un push a `main` activa Vercel si
la integración Git sigue conectada. Verificar en los registros que se ejecuta
`pnpm build`, y comprobar logos, contacto y PDF en el dominio estable.
