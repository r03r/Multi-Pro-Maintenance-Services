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

La landing también reutiliza `/email-signature/logo-main.jpg` en la cabecera,
bloque principal, chat, pie, favicon y vista previa social. Se eliminaron las
referencias a `/logo-new.png`, `/favicon.svg` y al logo externo de Emergent.

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
producción por diseño. El build también genera `.vercel/output/static`.

Revisar y confirmar solo los archivos fuente de esta integración:

```bash
git diff --check
git diff
git add public/email-signature/index.html public/email-template/index.html astro.config.mjs package.json pnpm-lock.yaml src/pages/robots.txt.ts src/pages/sitemap.xml.ts src/components/Header.astro src/components/Hero.astro src/components/Chatbot.astro src/components/Footer.astro src/layouts/Layout.astro public/admin/admin.js INSTALL-MULTI-PRO-ADMIN.md INSTALL-MULTI-PRO-EMAIL.md
git commit -m "Fix logos in PDF documents, landing, and emails; add sitemap"
git push origin main
```

El push activa el despliegue si Vercel sigue conectado a `main`. El repositorio ya
versiona parte de `.vercel/output`; no incluir los cambios generados por el build
ni añadir `dist`, `node_modules` o archivos de entorno a este commit.

La compilación actual funciona. El adaptador existente `@astrojs/vercel` 8 declara
compatibilidad con Astro 5 y emite una advertencia de obsolescencia con Astro 7;
su actualización mayor queda fuera de esta integración.
