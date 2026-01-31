<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎓 Área de Membros - Lovable Infinito

Plataforma completa de gestão de cursos online com área de membros, permitindo que administradores gerenciem conteúdo educacional e estudantes acessem cursos, acompanhem progresso e interajam em comunidade.

[![Deploy on Lovable](https://img.shields.io/badge/Deploy-Lovable-blue)](https://ai.studio/apps/drive/1C-EzLBzrlGY0iCJSQS6Il6vv0asITZq-)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black)](https://github.com/developerslimitada/Area-de-Membros---Produto-Lovable-Infinito)

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Deploy no Lovable](#-deploy-no-lovable)
- [Documentação](#-documentação)

---

## 🎯 Visão Geral

### Funcionalidades Principais

#### Para Estudantes
- ✅ Acesso a cursos organizados por categorias
- ✅ Player de vídeo integrado
- ✅ Acompanhamento de progresso
- ✅ Feed social com posts e interações
- ✅ Comunidade de alunos
- ✅ Perfil personalizável
- ✅ Certificados de conclusão

#### Para Administradores
- ✅ Painel administrativo completo
- ✅ CRUD de categorias, cursos, módulos e aulas
- ✅ Gerenciamento de usuários
- ✅ Publicação de posts no feed
- ✅ Sistema de ofertas e promoções
- ✅ Preview da experiência do estudante
- ✅ Analytics e relatórios

---

## 🛠️ Tecnologias

### Frontend
- **React** 19.2.4 - Biblioteca UI
- **TypeScript** 5.8.2 - Tipagem estática
- **Vite** 6.2.0 - Build tool
- **React Router** 7.13.0 - Roteamento
- **Framer Motion** 12.29.2 - Animações
- **Lucide React** 0.563.0 - Ícones

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Storage
  - Real-time subscriptions

### Deploy
- **Lovable** - Plataforma de deploy (AI Studio)
- **GitHub** - Controle de versão

---

## 📦 Instalação

### Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn
- Git
- Conta no GitHub
- Conta no Lovable (via Imagine Labs)

### Passo a Passo

1. **Clone o repositório**

```bash
git clone https://github.com/developerslimitada/Area-de-Membros---Produto-Lovable-Infinito.git
cd Area-de-Membros---Produto-Lovable-Infinito
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie o arquivo `.env.local` baseado no `.env.example`:

```bash
cp .env.example .env.local
```

Edite `.env.local` e adicione sua chave da API Gemini:

```env
GEMINI_API_KEY=sua_chave_aqui
```

> **Nota**: As credenciais do Supabase já estão configuradas em `lib/supabase.ts`

4. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

## ⚙️ Configuração

### Supabase

O projeto já vem configurado com uma instância Supabase. As credenciais estão em:

```typescript
// lib/supabase.ts
const supabaseUrl = 'https://qozsqbmertgivtsgugwv.supabase.co';
const supabaseAnonKey = 'eyJhbGci...'; // Chave pública
```

### Autenticação

#### Conta Admin Padrão
- **Email**: `developerslimitada@gmail.com`
- **Role**: Automaticamente definido como `admin`

#### Novos Usuários
- **Role padrão**: `user` (estudante)
- **Promoção para admin**: Via painel administrativo

---

## 🚀 Uso

### Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Cria build de produção

# Preview
npm run preview      # Preview do build de produção
```

### Acessando a Aplicação

#### Área do Estudante
- **URL**: `/student/courses`
- **Login**: Qualquer conta de usuário

#### Painel Administrativo
- **URL**: `/admin`
- **Login**: Apenas contas com role `admin`

---

## 📁 Estrutura do Projeto

```
Area-de-Membros---Produto-Lovable-Infinito/
├── components/              # Componentes React
│   ├── layouts/            # Layouts (Admin, Student)
│   ├── effects/            # Efeitos visuais
│   ├── PandaPlayer.tsx     # Player de vídeo
│   ├── StudentNavbar.tsx   # Navegação do estudante
│   └── ...
├── pages/                  # Páginas da aplicação
│   ├── Admin*.tsx          # Páginas administrativas
│   ├── Student*.tsx        # Páginas do estudante
│   └── Login.tsx           # Autenticação
├── lib/                    # Utilitários e serviços
│   ├── supabase.ts         # Cliente Supabase
│   ├── supabaseService.ts  # Serviços de API
│   └── database.types.ts   # Tipos do banco
├── App.tsx                 # Componente raiz
├── supabaseStore.ts        # Store global
├── types.ts                # Tipos compartilhados
├── PRD.md                  # Product Requirements Document
├── WORKFLOW.md             # Guia de workflow
└── package.json            # Dependências
```

---

## 🌐 Deploy no Lovable

### Integração GitHub + Lovable

Este projeto está configurado para deploy automático no Lovable via GitHub.

#### Como Funciona

1. **Faça alterações** no código localmente
2. **Commit** via GitHub Desktop ou terminal
3. **Push** para a branch `main`
4. **Lovable detecta** o push automaticamente
5. **Rebuild e deploy** acontecem automaticamente (~2-4 min)

#### Configuração no Lovable

1. Acesse: https://ai.studio/apps/drive/1C-EzLBzrlGY0iCJSQS6Il6vv0asITZq-
2. Conecte seu repositório GitHub
3. Configure branch `main` como fonte
4. Ative auto-deploy

### Forçar Rebuild Manual

Se precisar forçar um rebuild:

1. Acesse o dashboard do Lovable
2. Clique em **"Rebuild"**
3. Aguarde o processo completar

---

## 📚 Documentação

### Documentos Disponíveis

- **[PRD.md](./PRD.md)** - Product Requirements Document completo
  - Especificações técnicas
  - Modelo de dados
  - Fluxos de usuário
  - Roadmap

- **[WORKFLOW.md](./WORKFLOW.md)** - Guia de workflow
  - Desenvolvimento local
  - Processo de commit
  - Integração Lovable + GitHub
  - Troubleshooting

### Recursos Externos

- [React Documentation](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Guide](https://vitejs.dev/guide)
- [Lovable Docs](https://lovable.dev/docs)

---

## 🔐 Segurança

### Arquivos Sensíveis

O `.gitignore` está configurado para **não versionar**:

- `.env.local` - Variáveis de ambiente locais
- `node_modules/` - Dependências
- `dist/` - Build de produção
- `.supabase/` - Configurações locais do Supabase

### Boas Práticas

- ✅ Nunca commite chaves de API
- ✅ Use `.env.local` para secrets
- ✅ Revise commits antes de push
- ✅ Mantenha dependências atualizadas

---

## 🤝 Contribuindo

### Workflow de Desenvolvimento

1. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```

2. **Faça suas alterações** e teste localmente

3. **Commit** com mensagens descritivas:
   ```bash
   git commit -m "feat: adiciona nova funcionalidade"
   ```

4. **Push** para o GitHub:
   ```bash
   git push origin feature/nova-funcionalidade
   ```

5. **Crie um Pull Request** para revisão

### Padrão de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Alterações em documentação
- `style:` - Formatação (sem mudança de lógica)
- `refactor:` - Refatoração de código
- `test:` - Testes
- `chore:` - Manutenção

---

## 📞 Suporte

### Contato

- **Email**: developerslimitada@gmail.com
- **GitHub Issues**: [Reportar problema](https://github.com/developerslimitada/Area-de-Membros---Produto-Lovable-Infinito/issues)

### Links Úteis

- **App no Lovable**: https://ai.studio/apps/drive/1C-EzLBzrlGY0iCJSQS6Il6vv0asITZq-
- **Repositório GitHub**: https://github.com/developerslimitada/Area-de-Membros---Produto-Lovable-Infinito
- **Supabase Project**: https://qozsqbmertgivtsgugwv.supabase.co

---

## 📄 Licença

**Proprietário**: Developers Limitada  
**Licença**: Privado  
**Uso**: Restrito à organização

---

## 🎉 Agradecimentos

- **Imagine Labs** - Créditos de professor no Lovable
- **Supabase** - Backend as a Service
- **Lovable** - Plataforma de deploy

---

<div align="center">

**Desenvolvido com ❤️ por Developers Limitada**

[Lovable](https://ai.studio/apps/drive/1C-EzLBzrlGY0iCJSQS6Il6vv0asITZq-) • [GitHub](https://github.com/developerslimitada/Area-de-Membros---Produto-Lovable-Infinito) • [Supabase](https://qozsqbmertgivtsgugwv.supabase.co)

</div>
