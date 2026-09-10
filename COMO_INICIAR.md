# Como iniciar o AutoSkill (guia pessoal)

Caminho: `C:\Projetos\AutoSkill\COMO_INICIAR.md`  
Cópia em: `docs/COMO_INICIAR.md`

Repositório: https://github.com/CamposCodingHub/AutoSkill.git

---

## O que você precisa

1. **Node.js** LTS (18+) — https://nodejs.org
2. **PostgreSQL** — para login/API (recomendado)

---

## 1) Instalar dependências (primeira vez)

```powershell
cd C:\Projetos\AutoSkill
npm install

cd C:\Projetos\AutoSkill\backend
npm install
cd C:\Projetos\AutoSkill
```

---

## 2) Variáveis de ambiente

### Frontend — `C:\Projetos\AutoSkill\.env`

```env
VITE_API_URL=http://localhost:3001/api
```

### Backend — `C:\Projetos\AutoSkill\backend\.env`

Copie de `backend\.env.example` e ajuste:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/autoskill"
JWT_SECRET="troque-por-uma-chave-longa"
REFRESH_SECRET="outra-chave-longa"
ENCRYPTION_KEY="exatamente-32-caracteres-aqui!!"
PORT=3001
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
```

No PostgreSQL:

```sql
CREATE DATABASE autoskill;
```

```powershell
cd C:\Projetos\AutoSkill\backend
npm run prisma:generate
npx prisma migrate dev
```

---

## 3) Subir o projeto (uso diário — 2 terminais)

### Terminal A — Backend

```powershell
cd C:\Projetos\AutoSkill\backend
npm run dev
```

Porta **3001**.

### Terminal B — Frontend

```powershell
cd C:\Projetos\AutoSkill
npm run dev
```

Abra: **http://localhost:5173**

---

## 4) Entrar e estudar

1. Registre em `/register` ou login em `/login`
2. Trilha de estudos: **http://localhost:5173/trilha**
3. Guia no app (sem login): **http://localhost:5173/como-iniciar**

---

## Comandos úteis

| Comando | Onde | Para quê |
|---------|------|----------|
| `npm run dev` | raiz | Frontend |
| `npm run dev` | `backend/` | API |
| `npm run validate:lessons` | raiz | Validar aulas JSON |
| `npx tsc --noEmit` | raiz | Typecheck |
| `npm run prisma:studio` | `backend/` | Ver banco |

---

## Problemas comuns

- **Porta ocupada** → feche o processo antigo
- **Erro Prisma** → confira `DATABASE_URL` e se o PostgreSQL está rodando
- **Volta para o login** → token expirado; entre de novo
- **API não responde** → confira `VITE_API_URL` e `FRONTEND_URL`

---

## Resumo de 30 segundos

1. `npm install` (raiz + backend)  
2. `.env` ok  
3. `backend` → `npm run dev`  
4. raiz → `npm run dev`  
5. http://localhost:5173 → login → Trilha Mestre
