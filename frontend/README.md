# Frontend — Cubos Movies

Aplicação Next.js que consome a API do backend para autenticação e gerenciamento de filmes.

Configuração rápida:

1. Variáveis de ambiente (opcional)
- `NEXT_PUBLIC_API_URL` — URL base da API (padrão `http://localhost:3001`)
- `NEXT_PUBLIC_AWS_S3_BUCKET` — usado apenas como fallback em alguns lugares (não obrigatório)

2. Instalar e rodar:
```bash
cd frontend
npm install
npm run dev
# abrir http://localhost:3000
```

Fluxos principais na UI:
- `/auth` — cadastro / login (o login recebe cookie httpOnly do backend)
- `/movies` — listagem dos filmes e modal de criação (upload direto para S3 via presigned URL)

Deploy e cron:
- O cron da Vercel chama `GET /api/cron/send` nesta aplicação.
- Defina `BACKEND_API_URL` apontando para o backend e `CRON_SECRET` com o mesmo valor usado no backend.
- Se preferir, `NEXT_PUBLIC_API_URL` continua funcionando no frontend cliente.
- O backend faz o envio real via Gmail SMTP com senha de app.

Notas de debug:
- Se thumbnails não aparecerem, abra DevTools → Console. A listagem (`GET /movies`) deve retornar `imageUrl` (URL de leitura, assinada pelo backend quando o bucket é privado).
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
