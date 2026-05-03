# Cubos Movies

O objetivo deste desafio é desenvolver uma aplicação web completa e responsiva, cobrindo
tanto o frontend quanto o backend. A aplicação deve permitir que os usuários realizem as
operações de adicionar, editar, excluir e visualizar detalhes de filmes. Adicionalmente,
são essenciais as funcionalidades de busca e filtragem dentro da lista de filmes.

Aplicação de gerenciamento de filmes com backend em Fastify + Prisma e frontend em Next.js.

Arquitetura resumida:
- Backend: Node.js + Fastify, autenticação JWT via cookie httpOnly, Prisma ORM para PostgreSQL.
- Banco: PostgreSQL (docker local recomendado para testes).
- Storage: S3 privado com uploads via presigned PUT e presigned GET para leitura.
- Frontend: Next.js (app router), formulários de auth e CRUD de filmes.

Quick start (local)

1. Subir Postgres em Docker:
```bash
docker run --name cubos-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=cubos_movies -p 5432:5432 -d postgres:16
```

2. Configurar variáveis de ambiente no `backend/.env` (exemplo abaixo).

3. Rodar migrações e gerar client Prisma:
```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
```

4. Iniciar serviços:
```bash
# backend
npm run dev
# frontend (em outra aba)
cd frontend
npm install
npm run dev
```

5. Abrir http://localhost:3000

Para detalhes e instruções do `backend` e do `frontend`, veja os READMEs nas respectivas pastas.
