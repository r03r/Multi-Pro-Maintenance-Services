# Revisión de producción — 23 de septiembre de 2026

## Fallos comprobados y correcciones

- Vercel desplegaba `bee2bed` con el mensaje «Using prebuilt build artifacts from .vercel/output». Esa carpeta versionada contenía HTML antiguo, incluidas referencias a `/logo-new.png`. Se elimina del índice de Git, se ignora `.vercel/` y `vercel.json` obliga a instalar y compilar desde fuentes hacia `dist`.
- El botón flotante fallaba en producción con `ReferenceError: toggleFabMenu is not defined`. Se sustituyen las referencias inline a funciones de módulo por listeners y se mantiene el estado accesible del menú.
- La landing usa el logo transparente ya preparado en EVERTH. Conserva proporción y deja intactos el JPG y los iconos de correo/PDF.
- Menú móvil con cierre visible, Escape, control de foco e idioma disponible. Se normalizan márgenes y tamaños de caja; se reduce el titular móvil.
- El formulario de consulta inserta texto como texto, valida teléfono y prepara el enlace de WhatsApp sin afirmar que la consulta ya se envió.
- El correo de contacto usa `multi.pro2026@gmail.com`; se elimina la licencia de ejemplo `#000000`.
- El panel abre clientes desde el resumen, permite cancelar formularios incompletos, desactiva campos ocultos y valida documentos. La numeración usa el mayor número existente del año en vez de la longitud de la lista.

## Comprobación y límites

La instalación con lockfile, compilación Astro, sintaxis de admin y referencias locales del HTML generado pasan. El sitemap contiene la landing y excluye las herramientas de correo y admin. Los cuatro logos de la landing cargaron con tamaño natural 612 × 408 y la consola inicial no mostró errores.

El navegador de revisión dejó de permitir capturas y acciones durante la comprobación interactiva. No se da por completada la revisión visual integral en móvil/escritorio ni la impresión PDF de extremo a extremo en esta revisión. Los flujos críticos se verifican también con pruebas de código y DOM simulado.
`node scripts/check-interactions.mjs` pasa y cubre menú, FAB, recorrido completo,
respuestas duplicadas, teléfono, texto literal, enlace WhatsApp y temporizadores.

Antes de considerar publicado el arreglo, los registros del nuevo despliegue deben mostrar una compilación desde fuentes. Revisar en el dominio estable: logo, selector de idioma, apertura/cierre de menú y chat, enlace preparado de WhatsApp y logo al imprimir un documento. No enviar consultas de prueba a la empresa.

El panel continúa guardando datos en el navegador actual; no añade sincronización ni autenticación. La numeración no conserva un contador histórico después de borrar el documento de número más alto.

No se ha incorporado «JEV»: falta identificar a qué producto, versión o diseño se refiere.
