---
name: "github-deploy"
description: "Faz deploy do projeto React/Vite no GitHub. Invoca quando usuário pede para fazer deploy no GitHub."
---

# GitHub Deploy Skill

Este skill automatiza o processo de deploy de um projeto React/Vite para o GitHub.

## Funcionalidades

- Configura Git remote para GitHub
- Faz commit das alterações
- Push para o repositório remoto
- Build do projeto para produção
- Deploy para GitHub Pages (se aplicável)

## Pré-requisitos

1. Git instalado e configurado
2. Conta no GitHub
3. Repositório criado no GitHub
4. Token de acesso pessoal (se necessário)

## Comandos Úteis

```bash
# Verificar status do Git
git status

# Adicionar todas as alterações
git add .

# Fazer commit
git commit -m "feat: atualizações no site Muwoyo"

# Adicionar remote do GitHub
git remote add origin https://github.com/USUARIO/REPOSITORIO.git

# Push para o GitHub
git push -u origin main

# Build para produção
npm run build
```

## Configuração de Deploy Automático

Para GitHub Pages com Vite, adicione no `vite.config.ts`:

```typescript
export default defineConfig({
  base: "/NOME-DO-REPOSITORIO/",
  // ... resto da configuração
});
```

## Notas Importantes

- Substitua `USUARIO` e `REPOSITORIO` pelos valores reais
- O branch pode ser `main` ou `master` dependendo da configuração
- Para GitHub Pages, o site estará disponível em: `https://USUARIO.github.io/REPOSITORIO/`
