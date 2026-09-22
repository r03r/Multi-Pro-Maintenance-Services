# Instalar el panel MULTI-PRO

Este paquete añade un panel administrativo a un proyecto Astro sin cambiar las páginas existentes ni instalar dependencias.

## Instalación

Descomprime el ZIP sobre la raíz de `Multi-Pro`:

```bash
cd "/Users/Edward/Documents/Claude Cowork /EVERTH/Multi-Pro"
unzip -o "$HOME/Downloads/MULTI-PRO_Admin_Panel.zip" -d .
pnpm dev
```

Abre `http://localhost:4321/admin/`.

## Funciones incluidas

- Clientes, presupuestos y facturas.
- Numeración automática `EST-año-0001` e `INV-año-0001`.
- Conversión de presupuesto a factura.
- Estados y totales.
- Impresión o guardado como PDF desde el navegador con el logo oficial.
- Espera a que cargue el logo antes de habilitar la impresión; permite reintentar si falla.
- Si el navegador bloquea la ventana del documento, muestra un aviso para permitirla.
- Diseño adaptable a teléfono y computadora.
- Datos locales mediante `localStorage`.

## Importante

Los datos de esta versión se guardan solamente en el navegador utilizado. No publiques la ruta `/admin/` como si tuviera autenticación real. El archivo `supabase/schema.sql` prepara la siguiente etapa: cuenta privada y datos sincronizados entre Android, Mac y computadora.

## Publicar los archivos

```bash
git add src/pages/admin public/admin supabase INSTALL-MULTI-PRO-ADMIN.md
git commit -m "Add MULTI-PRO admin panel"
git push origin main
```
