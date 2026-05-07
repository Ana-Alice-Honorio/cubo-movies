# Backend — Cubos Movies

Passos para rodar o backend localmente e preparar o ambiente de testes.

Pré-requisitos:
- Node.js 18+ (ou compatível)
- Docker (para Postgres)
- AWS credentials com permissão S3 (para uploads)

Exemplo de `.env` (crie em `backend/.env`):


```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cubos_movies?schema=public"
JWT_SECRET="um hash qualquer para ser usado como segredo na geração dos tokens JWT"
PORT=3001
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=cubos-movies-files-bucket
ENABLE_RELEASE_REMINDER_CRON=true
SMTP_USER=seu-email
SMTP_APP_PASSWORD=senha-de-aplicativo
MAIL_FROM=seu-email
CRON_SECRET=um hash (o mesmo do .env do frontend)
```

1. Como gerar o hash do cron secret:
```bash
openssl rand -hex 32
```
Ou pode gerar de outras formas, fica a seu critério.

2. Como gerar senha SMTP:
- Entre na sua conta Google
- Vá em Configurações
- Segurança e login 
Obs: A verificação em duas etapas deve estar ativa.
- Na barra de buscas digite "apps senha" e selecione a opção: Senhas de app
- Ele vai pedir pra confirmar sua senha (a usada no Google). Após a confirmação, ele abrirá uma tela de cadastro de novo app como imagem abaixo:
![alt text](images-readme/image.png)
- Após criar, ele irá gerar uma senha. Copie e guarde essa senha, pois ela some. É visível apenas uma vez.
- Cole ela no seu .env no SMTP_APP_PASSWORD. Apague os espaços (será gerado 16 caracteres em 4 blocos de 4 caracteres). Deixe os 16 itens seguidos sem espaço.

3. SMTP_USER e SMPT_FROM será o email que enviará as notificações.

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

## Documentação da API (Swagger/OpenAPI)

O backend expõe documentação interativa em:

```
http://localhost:3001/docs
```

O Swagger UI permite:
- 📖 Visualizar todos os endpoints disponíveis
- 📋 Ver schemas de request/response
- 🧪 Testar requisições diretamente da UI
- 🔐 Autenticar com JWT para endpoints protegidos

Todos os endpoints estão documentados com suas validações, exemplos e códigos de status esperados.

## Endpoints principais (resumido)

- `POST /auth/register` — registrar
- `POST /auth/login` — login (cookie httpOnly)
- `GET /auth/me` — usuário atual
- `POST /movies` — criar filme
- `POST /movies/upload-url` — gerar presigned PUT (recebe `fileName`/`mimeType`)
- `PATCH /movies/:id` — atualizar (valida ownership e imageKey)
- `GET /movies` — listar filmes do usuário
- `DELETE /movies/:id` — deletar filme
- `POST /cron/release-reminders` — dispara os lembretes de estreia do dia (protegido por `CRON_SECRET`)
