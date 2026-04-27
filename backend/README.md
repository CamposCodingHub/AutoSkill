# AutoSkill Backend

Backend API para a plataforma de aprendizado AutoSkill.

## Stack Tecnológica

- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcryptjs para hash de senhas

## Instalação

### 1. Instalar dependências

Abra o terminal na pasta `backend` e execute:

```bash
npm install
```

### 2. Configurar banco de dados

Você precisa ter o PostgreSQL instalado. Edite o arquivo `.env` com suas credenciais:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/autoskill?schema=public"
JWT_SECRET="sua-chave-secreta-aqui"
PORT=3001
NODE_ENV=development
```

### 3. Executar migrations do Prisma

```bash
npx prisma migrate dev --name init
```

### 4. Gerar cliente Prisma

```bash
npx prisma generate
```

## Executar o servidor

### Modo desenvolvimento (com hot reload)

```bash
npm run dev
```

### Modo produção

```bash
npm run build
npm start
```

## API Endpoints

### Autenticação

- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obter usuário atual (requer token)

### Progresso

- `GET /api/progress` - Obter progresso do usuário (requer token)
- `PUT /api/progress/lessons/:moduleId/:lessonId` - Atualizar progresso de aula (requer token)
- `POST /api/progress/quiz` - Salvar resposta de quiz (requer token)
- `GET /api/progress/leaderboard` - Obter leaderboard (requer token)

### Gamificação

- `GET /api/gamification/profile` - Obter perfil gamificado (requer token)
- `PUT /api/gamification/profile` - Atualizar perfil gamificado (requer token)

## Estrutura do Projeto

```
backend/
├── src/
│   ├── controllers/    # Lógica de cada endpoint
│   ├── middleware/     # Middleware (autenticação)
│   ├── routes/         # Definição de rotas
│   ├── utils/          # Utilitários (prisma, jwt)
│   └── index.ts        # Ponto de entrada
├── prisma/
│   └── schema.prisma   # Schema do banco de dados
├── .env                # Variáveis de ambiente
├── package.json
└── tsconfig.json
```

## Prisma Studio

Para visualizar e editar o banco de dados:

```bash
npx prisma studio
```
