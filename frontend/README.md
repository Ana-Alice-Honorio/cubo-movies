# Frontend — Cubos Movies

Aplicação Next.js que consome a API do backend para autenticação e gerenciamento de filmes.

Configuração rápida:

1. Variáveis de ambiente (opcional)
- `NEXT_PUBLIC_API_URL` — URL base da API (padrão `http://localhost:3001`)

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

Cron:
- Defina `BACKEND_API_URL` apontando para o backend e `CRON_SECRET` com o mesmo valor usado no backend.
- Se preferir, `NEXT_PUBLIC_API_URL` continua funcionando no frontend cliente.
- O backend faz o envio real via Gmail SMTP com senha de app.

Notas de debug:
- Se thumbnails não aparecerem, abra DevTools → Console. A listagem (`GET /movies`) deve retornar `imageUrl` (URL de leitura, assinada pelo backend quando o bucket é privado).
