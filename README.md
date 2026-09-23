# MULTI-PRO Maintenance Services

Sitio Astro estático, firma y plantilla de correo, y panel local de presupuestos y facturas.
Repositorio: `r03r/Multi-Pro-Maintenance-Services`.

## Desarrollo y validación

Requiere Node >=22.12 y pnpm 10.

```bash
pnpm install --frozen-lockfile
node scripts/check-interactions.mjs
pnpm build
pnpm preview
```

## Despliegue

Vercel compila desde el código fuente mediante `vercel.json` y publica `dist`.
No versionar `.vercel/output`: los artefactos antiguos hacían que Vercel omitiera
la compilación y sirviera una versión desactualizada.

Dominio: https://multi-pro-maintenance-services.vercel.app

- [Firma, correo, PDF y sitemap](INSTALL-MULTI-PRO-EMAIL.md)
- [Panel administrativo y almacenamiento local](INSTALL-MULTI-PRO-ADMIN.md)

El panel almacena los registros en el navegador actual. No sincroniza entre
dispositivos ni incorpora autenticación. El chat prepara una consulta para que
el visitante la envíe por WhatsApp.
