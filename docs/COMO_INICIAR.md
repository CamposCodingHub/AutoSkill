# Como iniciar o AutoSkill (guia pessoal)

> Cópia estável em `docs/`. A raiz também tem `COMO_INICIAR.md`.  
> Repo: https://github.com/CamposCodingHub/AutoSkill.git

## Ligar no Windows (PowerShell)

### Dependências (primeira vez)

```powershell
cd C:\Projetos\AutoSkill
npm install
cd C:\Projetos\AutoSkill\backend
npm install
```

### .env

**Raiz** `.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

**Backend** `backend/.env` (veja `backend/.env.example`):

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/autoskill"
JWT_SECRET="troque-por-uma-chave-longa"
REFRESH_SECRET="outra-chave-longa"
ENCRYPTION_KEY="exatamente-32-caracteres-aqui!!"
PORT=3001
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
```

```powershell
cd C:\Projetos\AutoSkill\backend
npm run prisma:generate
npx prisma migrate dev
```

### Todo dia — 2 terminais

```powershell
# Terminal A
cd C:\Projetos\AutoSkill\backend
npm run dev

# Terminal B
cd C:\Projetos\AutoSkill
npm run dev
```

Browser: http://localhost:5173  
Trilha: http://localhost:5173/trilha  
Este guia no app: http://localhost:5173/como-iniciar
