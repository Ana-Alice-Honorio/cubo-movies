# Cubos Movies

Aplicação web completa e responsiva de gerenciamento de filmes com backend em **Fastify + Prisma** e frontend em **Next.js**.

## Objetivo

Desenvolver uma plataforma que permita usuários:
- ✅ Gerenciar filmes (adicionar, editar, excluir, visualizar)
- ✅ Buscar e filtrar filmes
- ✅ Autenticação segura com JWT
- ✅ Receber lembretes de lançamentos por email

## Pré-requisitos

- **Node.js** 18+ (recomendado LTS)
- **npm** 9+
- **Docker** (para PostgreSQL local)
- **Git**

## Arquitetura

```
┌─────────────────────────────────────────┐
│        Frontend (Next.js 14+)           │
│  - TypeScript, Tailwind CSS             │
│  - Auth Context, Theme Context          │
│  - CRUD de filmes com modal            │
└────────────────┬────────────────────────┘
                 │ HTTP/REST
┌────────────────▼────────────────────────┐
│   Backend (Fastify + Node.js)           │
│  - JWT auth via httpOnly cookies        │
│  - Prisma ORM                           │
│  - S3 presigned URLs (upload/download)  │
│  - CRON jobs para lembretes             │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┴────────────┬─────────────┐
    │                         │             │
┌───▼──────┐         ┌────────▼───┐   ┌────▼────┐
│ PostgreSQL│         │ S3 Bucket  │   │ SMTP    │
│ (Prisma)  │         │ (imagens)  │   │(lembretes)
└──────────┘         └────────────┘   └─────────┘
```

## Estrutura do Projeto

```
cubos-movies/
├── backend/                 # API Node.js + Fastify
│   ├── src/
│   │   ├── app.ts          # Config Fastify
│   │   ├── server.ts       # Inicialização
│   │   ├── plugins/        # Plugins (auth, etc)
│   │   ├── routes/         # Rotas de API
│   │   ├── schemas/        # Validações Zod
│   │   └── lib/            # Utilitários (S3, prisma, etc)
│   ├── prisma/
│   │   ├── schema.prisma   # Model do banco
│   │   └── migrations/     # Histórico de mudanças
│   └── package.json
│
├── frontend/                # App Next.js
│   ├── src/
│   │   ├── app/            # Layout + páginas
│   │   ├── components/     # Componentes React
│   │   ├── lib/            # Contextos e utilitários
│   │   └── public/         # Assets estáticos
│   └── package.json
│
└── README.md               # Este arquivo
```

## Quick Start (Local)

### 1. Clonar e instalar dependências

```bash
git clone <repo>
cd cubos-movies
```

### 2. Configurar banco de dados

```bash
# Iniciar PostgreSQL em Docker
docker run \
  --name cubos-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cubos_movies \
  -p 5432:5432 \
  -d postgres:16

# Para iniciar novamente (se parado)
docker start cubos-postgres
```

### 3. Configurar variáveis de ambiente (seguro)

Copie o arquivo de exemplo e edite localmente (NÃO comite segredos):

```bash
cp backend/.env.example backend/.env
# editar backend/.env com valores locais
```

Gerar segredos/valores seguros:

```bash
# gerar CRON_SECRET (OpenSSL)
openssl rand -hex 32

# ou (Node.js, cross-platform)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# gerar JWT_SECRET de forma similar
```

SMTP / emails:
Como gerar senha SMTP:
- Entre na sua conta Google
- Vá em Configurações
- Segurança e login 
Obs: A verificação em duas etapas deve estar ativa.
- Na barra de buscas digite "apps senha" e selecione a opção: Senhas de app
- Ele vai pedir pra confirmar sua senha (a usada no Google). Após a confirmação, ele abrirá uma tela de cadastro de novo app como imagem abaixo:
![alt text](images-readme/image.png)
- Após criar, ele irá gerar uma senha. Copie e guarde essa senha, pois ela some. É visível apenas uma vez.
- Cole ela no seu .env no SMTP_APP_PASSWORD. Apague os espaços (será gerado 16 caracteres em 4 blocos de 4 caracteres). Deixe os 16 itens seguidos sem espaço.

SMTP_USER e SMPT_FROM será o email que enviará as notificações.

### 4. Setup backend

```bash
cd backend

# Instalar dependências
npm install

# Rodar migrações do banco
npx prisma migrate dev --name init

# Gerar cliente Prisma
npx prisma generate

# Iniciar servidor (dev)
npm run dev
```

O backend estará disponível em `http://localhost:3001`

### 5. Setup frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

### 6. Acessar a aplicação

Abra seu navegador em **http://localhost:3000**

## Variáveis de Ambiente Detalhadas

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Chave para assinar JWT tokens | Mínimo 32 caracteres aleatórios |
| `PORT` | Porta do backend | `3001` |
| `AWS_ACCESS_KEY_ID` | Chave de acesso AWS | Obtém na AWS Console |
| `AWS_SECRET_ACCESS_KEY` | Chave secreta AWS | Obtém na AWS Console |
| `AWS_REGION` | Região AWS | `us-east-1`, `sa-east-1`, etc |
| `AWS_S3_BUCKET` | Nome do bucket S3 | `meu-bucket-filmes` |
| `SMTP_USER` | Email para enviar | `seu-email@gmail.com` |
| `SMTP_APP_PASSWORD` | Senha app (Gmail) | Gerar em: https://myaccount.google.com/apppasswords |
| `MAIL_FROM` | Email de origem | `seu-email@gmail.com` |
| `CRON_SECRET` | Token para jobs agendados | Qualquer string segura |
| `ENABLE_RELEASE_REMINDER_CRON` | Ativar lembretes | `true` ou `false` |

## Troubleshooting

### Erro: "Banco de dados não encontrado"
```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Reiniciar container
docker restart cubos-postgres
```

### Erro: "JWT_SECRET não definido"
- Verificar se arquivo `.env` existe em `backend/.env`
- Confirmar que variáveis estão preenchidas (sem espaços em branco)

### Erro: "Falha ao conectar S3"
- Verificar credenciais AWS na AWS Console
- Confirmar que bucket existe e está acessível
- Verificar permissões de CORS do bucket (ver `backend/setup-s3-cors.ts`)

### Porta 3000 ou 3001 já em uso
```bash
# Mudar porta no .env
PORT=3002

# Ou liberar porta (Linux/Mac)
lsof -ti:3001 | xargs kill -9
```

## Scripts Disponíveis

### Backend
```bash
npm run dev      # Modo desenvolvimento com hot-reload
npm run build    # Build para produção
npm run start    # Rodar build de produção
npm run test     # Executar testes
```

### Frontend
```bash
npm run dev      # Modo desenvolvimento
npm run build    # Build otimizado
npm start        # Rodar build
npm run lint     # Verificar código
```

## Documentação da API

O backend possui documentação interativa via **Swagger UI / OpenAPI**:

- **Local**: http://localhost:3001/docs
- **Endpoints documentados**: Autenticação, CRUD de filmes, uploads S3, cron de lembretes
- **Tente requisições**: O Swagger permite testar endpoints diretamente

> **Nota**: O Swagger fica disponível após iniciar o backend com `npm run dev`

## Documentação

- **[Backend README](./backend/README.md)** - Endpoints, autenticação, middleware, Swagger
- **[Frontend README](./frontend/README.md)** - Componentes, estado, temas

## Tecnologias

### Backend
- **Fastify** - Framework web rápido
- **Prisma** - ORM type-safe
- **JWT** - Autenticação stateless
- **AWS SDK** - Upload/download S3
- **Node-cron** - Jobs agendados

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilos
- **Axios** - HTTP client
