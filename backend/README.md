# Backend — Cubos Movies

Passos para rodar o backend localmente e preparar o ambiente de testes.

Pré-requisitos:
- Node.js 18+ (ou compatível)
- Docker (para Postgres)
- AWS credentials com permissão S3 (para uploads)

Exemplo de `.env` (crie em `backend/.env`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cubos_movies?schema=public"
JWT_SECRET="change-me"
PORT=3001
CRON_SECRET="um-segredo-compartilhado-com-o-frontend"

SMTP_USER="seu-email@gmail.com"
SMTP_APP_PASSWORD="senha-de-app-de-16-digitos"
MAIL_FROM='"Filmes Desafio" <seu-email@gmail.com>'

AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=cubos-movies-files-bucket
```

Instalação e migrações:
```bash
cd backend
npm install
# desenvolvimento
npx prisma migrate dev --name init
npx prisma generate

# ou, se for aplicar migrações já commitadas
npx prisma migrate deploy
npx prisma generate
```

Scripts úteis:
- `npm run dev` — inicia backend com `tsx` (modo dev)
- `npm run build` — compila TypeScript
- `npm run prisma:generate` — gerar client prisma

Configurar CORS no bucket S3 (apenas se necessário):
```bash
# gera configuração de CORS no bucket conforme .env
npx tsx setup-s3-cors.ts
```

Notas importantes sobre S3 e segurança:
- O bucket deve ficar privado; o backend gera URLs assinadas para upload (PUT) e leitura (GET).
- Uploads são prefixados por `movies/{userId}/...` para organização.
- O backend valida ownership antes de aceitar updates/deletes e valida `imageKey` para evitar que usuário aponte um arquivo de outra conta.

Endpoints principais (resumido):
- `POST /auth/register` — registrar
- `POST /auth/login` — login (cookie httpOnly)
- `GET /auth/me` — usuário atual
- `POST /movies` — criar filme
- `POST /movies/upload-url` — gerar presigned PUT (recebe `fileName`/`mimeType`)
- `PATCH /movies/:id` — atualizar (valida ownership e imageKey)
- `GET /movies` — listar filmes do usuário
- `POST /cron/release-reminders` — dispara os lembretes de estreia do dia (protegido por `CRON_SECRET`)
