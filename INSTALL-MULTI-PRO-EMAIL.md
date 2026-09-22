# MULTI-PRO email files

This package is prepared for the Astro repository shown by the project tree.

## Installation

1. Extract the ZIP at the root of the `Multi-Pro` repository.
2. Confirm that `public/email-template/index.html` exists.
3. Run `pnpm dev` and open `/email-template/` for a local preview.
4. Commit and deploy:

```bash
git add public/email-template public/email-signature INSTALL-MULTI-PRO-EMAIL.md
git commit -m "Add branded introduction email and signature assets"
git push origin main
```

## Public URLs after deployment

- `/email-template/` - introduction email preview
- `/email-template/logo-main.jpg` - official logo
- `/email-template/whatsapp.png` - WhatsApp icon
- `/email-template/facebook.png` - Facebook icon
- `/email-signature/` - signature preview

## Pending items

- Facebook and WhatsApp links are configured.
- Add the selected gallery photographs later under `public/email-template/`.
- The current Vercel preview is protected by login. Images in sent emails must be hosted on a public deployment or custom domain.

Do not commit `node_modules`, `.astro`, `.git`, `.gemini`, `.idea`, or `.vscode` as part of this package.
