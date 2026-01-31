# PRD - Área de Membros Lovable Infinito

## 📋 Visão Geral do Produto

**Nome do Produto**: Área de Membros - Lovable Infinito  
**Versão**: 1.0.0  
**Plataforma**: Web Application (PWA-ready)  
**Repositório**: [GitHub - developerslimitada/Area-de-Membros---Produto-Lovable-Infinito](https://github.com/developerslimitada/Area-de-Membros---Produto-Lovable-Infinito)  
**Deploy**: Lovable Platform (AI Studio)

### Descrição

Plataforma completa de gestão de cursos online com área de membros, permitindo que administradores gerenciem conteúdo educacional e estudantes acessem cursos, acompanhem progresso e interajam em comunidade.

---

## 🎯 Objetivos do Produto

### Objetivos Primários
1. **Gestão de Conteúdo**: Permitir administradores criarem e organizarem cursos, módulos e aulas
2. **Experiência do Aluno**: Proporcionar interface intuitiva para consumo de conteúdo educacional
3. **Engajamento**: Criar comunidade ativa através de feed social e interações
4. **Acompanhamento**: Rastrear progresso individual de cada estudante

### Objetivos Secundários
1. Oferecer sistema de ofertas e promoções
2. Gerenciar perfis de usuários com diferentes níveis de acesso
3. Suporte integrado para atendimento aos alunos
4. Preview de interface para administradores

---

## 👥 Personas de Usuário

### 1. Administrador
- **Papel**: Criador de conteúdo e gestor da plataforma
- **Necessidades**:
  - Criar e organizar cursos, módulos e aulas
  - Gerenciar categorias de conteúdo
  - Visualizar e gerenciar usuários
  - Publicar posts no feed
  - Criar ofertas e promoções
  - Preview da experiência do estudante
- **Email especial**: `developerslimitada@gmail.com` (admin automático)

### 2. Estudante
- **Papel**: Consumidor de conteúdo educacional
- **Necessidades**:
  - Acessar cursos disponíveis
  - Assistir aulas e marcar como concluídas
  - Acompanhar progresso pessoal
  - Interagir no feed social
  - Participar da comunidade
  - Gerenciar perfil pessoal

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

#### Frontend
- **Framework**: React 19.2.4
- **Build Tool**: Vite 6.2.0
- **Linguagem**: TypeScript 5.8.2
- **Roteamento**: React Router DOM 7.13.0
- **Animações**: Framer Motion 12.29.2
- **Ícones**: Lucide React 0.563.0

#### Backend & Database
- **BaaS**: Supabase
- **Database**: PostgreSQL (via Supabase)
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage (para imagens/vídeos)
- **URL**: `https://qozsqbmertgivtsgugwv.supabase.co`

#### Deployment
- **Plataforma**: Lovable (AI Studio)
- **Controle de Versão**: GitHub
- **Sincronização**: Automática via GitHub → Lovable

### Estrutura de Pastas

```
Area-de-Membros---Produto-Lovable-Infinito/
├── components/
│   ├── layouts/
│   │   ├── AdminLayout.tsx       # Layout para páginas admin
│   │   └── StudentLayout.tsx     # Layout para páginas de estudante
│   ├── effects/
│   │   └── HeartBurst.tsx        # Efeito visual de curtidas
│   ├── PandaPlayer.tsx           # Player de vídeo customizado
│   ├── PreviewModeHeader.tsx     # Header do modo preview admin
│   ├── ProtectedRoute.tsx        # Proteção de rotas por autenticação
│   ├── SidebarFooter.tsx         # Footer da sidebar
│   ├── StudentFooter.tsx         # Footer da área do estudante
│   ├── StudentNavbar.tsx         # Navegação bottom do estudante
│   └── SupportFloatingButton.tsx # Botão flutuante de suporte
├── pages/
│   ├── Admin*.tsx                # 7 páginas administrativas
│   ├── Student*.tsx              # 5 páginas de estudante
│   └── Login.tsx                 # Página de autenticação
├── lib/
│   ├── supabase.ts               # Cliente Supabase
│   ├── supabaseService.ts        # Serviços de API (422 linhas)
│   └── database.types.ts         # Tipos TypeScript do banco
├── App.tsx                       # Componente raiz com rotas
├── supabaseStore.ts              # Store global do Supabase
├── types.ts                      # Tipos compartilhados
└── index.tsx                     # Entry point
```

---

## 🗄️ Modelo de Dados

### Tabelas Principais

#### 1. `profiles`
```typescript
{
  id: string (UUID, FK para auth.users)
  email: string
  name: string
  avatar: string (URL)
  role: 'admin' | 'user'
  created_at: timestamp
}
```

#### 2. `categories`
```typescript
{
  id: string (UUID)
  name: string
  description: string
  icon: string
  color: string
  is_active: boolean
  display_order: number
  created_at: timestamp
}
```

#### 3. `courses`
```typescript
{
  id: string (UUID)
  category_id: string (FK)
  title: string
  description: string
  thumbnail: string (URL)
  is_featured: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

#### 4. `modules`
```typescript
{
  id: string (UUID)
  course_id: string (FK)
  title: string
  description: string
  order_number: number
  created_at: timestamp
}
```

#### 5. `lessons`
```typescript
{
  id: string (UUID)
  module_id: string (FK)
  title: string
  description: string
  video_url: string
  duration_seconds: number
  order_number: number
  created_at: timestamp
}
```

#### 6. `user_progress`
```typescript
{
  id: string (UUID)
  user_id: string (FK)
  lesson_id: string (FK)
  completed: boolean
  watched_seconds: number
  last_watched_at: timestamp
  UNIQUE(user_id, lesson_id)
}
```

#### 7. `posts`
```typescript
{
  id: string (UUID)
  user_id: string (FK)
  content: string
  image_url: string (opcional)
  status: 'draft' | 'published'
  created_at: timestamp
}
```

#### 8. `offers`
```typescript
{
  id: string (UUID)
  titulo: string
  descricao: string
  preco_original: number
  preco_promocional: number
  data_expiracao: timestamp
  status: 'active' | 'inactive'
  priority: number
}
```

---

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação

1. **Registro**:
   - Email + Senha + Nome
   - Criação automática de perfil
   - Role padrão: `user`
   - Exceção: `developerslimitada@gmail.com` → `admin`
   - Avatar gerado automaticamente (DiceBear API)

2. **Login**:
   - Email + Senha
   - Sessão persistente (localStorage)
   - Auto-refresh de token
   - Redirecionamento baseado em role

3. **Proteção de Rotas**:
   - `ProtectedRoute` component
   - Verificação de autenticação
   - Verificação de role (admin vs user)
   - Redirect para `/login` se não autenticado

### Regras de Acesso

| Rota | Acesso |
|------|--------|
| `/login` | Público |
| `/student/*` | Autenticado (user ou admin) |
| `/admin/*` | Apenas admin |
| `/admin/preview/student/*` | Apenas admin (preview mode) |

---

## 🎨 Funcionalidades Principais

### Área do Estudante

#### 1. **Cursos** (`/student/courses`)
- Visualização de categorias
- Grid de cursos por categoria
- Expansão de módulos e aulas
- Player de vídeo integrado (PandaPlayer)
- Marcação de aulas como concluídas
- Barra de progresso por curso

#### 2. **Feed** (`/student/feed`)
- Timeline de posts publicados
- Curtidas em posts
- Comentários (se implementado)
- Perfil do autor com avatar

#### 3. **Comunidade** (`/student/community`)
- Espaço de interação entre alunos
- Posts da comunidade
- Engajamento social

#### 4. **Progresso** (`/student/progress`)
- Visualização de aulas concluídas
- Estatísticas de progresso
- Histórico de aprendizado

#### 5. **Certificados** (`/student/certificates`)
- Certificados de conclusão
- Download de certificados

#### 6. **Perfil** (`/student/profile`)
- Edição de dados pessoais
- Alteração de avatar
- Configurações de conta

### Área Administrativa

#### 1. **Painel Admin** (`/admin`)
- Dashboard com estatísticas
- Visão geral do sistema
- Botão "Preview Student Dashboard"

#### 2. **Categorias** (`/admin/categories`)
- CRUD de categorias
- Ordenação (drag & drop ou manual)
- Ativação/desativação
- Customização de ícone e cor

#### 3. **Cursos** (`/admin/courses`)
- CRUD de cursos
- Associação com categorias
- Upload de thumbnail
- Marcar como destaque

#### 4. **Módulos** (`/admin/modules`)
- CRUD de módulos
- Associação com cursos
- Ordenação dentro do curso

#### 5. **Aulas** (`/admin/lessons`)
- CRUD de aulas
- Associação com módulos
- Upload/link de vídeo
- Duração da aula
- Ordenação dentro do módulo

#### 6. **Usuários** (`/admin/users`)
- Listagem de usuários
- Promoção user → admin
- Visualização de perfis
- Gerenciamento de acessos

#### 7. **Feed** (`/admin/feed`)
- Criação de posts
- Moderação de conteúdo
- Publicação/rascunho
- Upload de imagens

#### 8. **Ofertas** (`/admin/offers`)
- CRUD de ofertas
- Definição de preços
- Data de expiração
- Prioridade de exibição
- Status (ativo/inativo)

#### 9. **Preview Mode** (`/admin/preview/student/*`)
- Visualização da experiência do estudante
- Header especial indicando modo preview
- Navegação completa pela área do estudante
- Sidebar funcional

---

## 🔄 Fluxos de Usuário

### Fluxo do Estudante

```mermaid
graph TD
    A[Login] --> B{Autenticado?}
    B -->|Não| A
    B -->|Sim| C[/student/courses]
    C --> D[Seleciona Categoria]
    D --> E[Seleciona Curso]
    E --> F[Expande Módulo]
    F --> G[Clica em Aula]
    G --> H[Assiste Vídeo]
    H --> I{Concluiu?}
    I -->|Sim| J[Marca como Concluída]
    I -->|Não| H
    J --> K[Progresso Atualizado]
    K --> L{Mais Aulas?}
    L -->|Sim| F
    L -->|Não| M[Curso Concluído]
```

### Fluxo do Administrador

```mermaid
graph TD
    A[Login Admin] --> B[/admin]
    B --> C{Ação?}
    C -->|Criar Curso| D[/admin/courses]
    D --> E[Preenche Dados]
    E --> F[Cria Curso]
    F --> G[/admin/modules]
    G --> H[Adiciona Módulos]
    H --> I[/admin/lessons]
    I --> J[Adiciona Aulas]
    J --> K[Curso Completo]
    
    C -->|Preview| L[/admin/preview/student/courses]
    L --> M[Visualiza como Estudante]
    M --> N[Testa Funcionalidades]
    N --> O[Volta para Admin]
```

---

## 🚀 Integração Lovable + GitHub

### Workflow de Desenvolvimento

1. **Desenvolvimento Local**:
   ```bash
   npm install
   npm run dev
   ```

2. **Commit & Push**:
   - Fazer alterações no código
   - Commit via GitHub Desktop
   - Push para branch `main`

3. **Sincronização Automática**:
   - Lovable detecta push no GitHub
   - Rebuild automático da aplicação
   - Deploy instantâneo

### Configuração Necessária

#### No Lovable:
1. Conectar repositório GitHub
2. Configurar branch `main` como fonte
3. Ativar auto-deploy

#### No GitHub:
1. Manter `.gitignore` atualizado
2. Não commitar arquivos sensíveis (`.env.local`)
3. Usar mensagens de commit descritivas

### Variáveis de Ambiente

**Arquivo**: `.env.local` (não versionado)

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Nota**: Credenciais Supabase estão hardcoded em `lib/supabase.ts`

---

## 📱 Responsividade

### Breakpoints

- **Mobile**: < 768px
- **Desktop**: >= 768px

### Adaptações Mobile

1. **Navegação**: Bottom navbar (StudentNavbar)
2. **Layout**: Stack vertical
3. **Sidebar**: Escondida, substituída por bottom nav
4. **Cards**: Grid adaptativo (1 coluna em mobile)

### PWA Features

- Instalável como app
- Funciona offline (cache básico)
- Ícones e splash screens
- Manifest configurado

---

## 🎯 Roadmap de Desenvolvimento

### ✅ Fase 1 - MVP (Concluído)
- [x] Sistema de autenticação
- [x] CRUD de categorias, cursos, módulos e aulas
- [x] Área do estudante com player de vídeo
- [x] Sistema de progresso
- [x] Feed social básico
- [x] Painel administrativo
- [x] Preview mode para admin

### 🔄 Fase 2 - Melhorias (Em Andamento)
- [ ] Sistema de comentários em posts
- [ ] Notificações em tempo real
- [ ] Certificados automáticos
- [ ] Gamificação (badges, pontos)
- [ ] Chat de suporte integrado

### 📋 Fase 3 - Expansão (Planejado)
- [ ] Sistema de pagamentos (Stripe/Mercado Pago)
- [ ] Marketplace de cursos
- [ ] API pública
- [ ] App mobile nativo (React Native)
- [ ] Analytics avançado

---

## 🔧 Manutenção e Suporte

### Logs e Debugging

- **Supabase Logs**: Disponíveis no dashboard Supabase
- **Browser Console**: Erros de frontend
- **Network Tab**: Requisições API

### Backup

- **Database**: Backups automáticos Supabase (diários)
- **Código**: Versionado no GitHub
- **Assets**: Armazenados no Supabase Storage

### Monitoramento

- **Uptime**: Lovable monitoring
- **Performance**: Lighthouse scores
- **Errors**: Supabase error tracking

---

## 📞 Contatos e Recursos

### Equipe
- **Desenvolvedor**: Developers Limitada
- **Email Admin**: developerslimitada@gmail.com

### Links Importantes
- **Repositório**: https://github.com/developerslimitada/Area-de-Membros---Produto-Lovable-Infinito
- **Lovable App**: https://ai.studio/apps/drive/1C-EzLBzrlGY0iCJSQS6Il6vv0asITZq-
- **Supabase Project**: https://qozsqbmertgivtsgugwv.supabase.co

### Documentação Técnica
- [React Documentation](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Guide](https://vitejs.dev/guide)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## 📄 Licença e Propriedade

**Proprietário**: Developers Limitada  
**Licença**: Privado  
**Uso**: Restrito à organização

---

**Última Atualização**: 31 de Janeiro de 2026  
**Versão do Documento**: 1.0.0
