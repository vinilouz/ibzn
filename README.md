# IBZN - Sistema de Gerenciamento de Cursos

Sistema completo de gerenciamento de cursos, participantes, facilitadores e presença desenvolvido com SvelteKit.

## Tecnologias Utilizadas

### Frontend
- **[SvelteKit](https://kit.svelte.dev/)** v2.43.2 - Framework full-stack para Svelte
- **[Svelte](https://svelte.dev/)** v5.39.5 - Framework reativo de UI
- **[TailwindCSS](https://tailwindcss.com/)** v4.1.13 - Framework CSS utilitário
- **[bits-ui](https://www.bits-ui.com/)** v2.11.0 - Componentes UI headless para Svelte
- **[Lucide Svelte](https://lucide.dev/)** v0.548.0 - Ícones SVG
- **[mode-watcher](https://github.com/svecosystem/mode-watcher)** v1.1.0 - Gerenciamento de tema claro/escuro

### Backend & Database
- **[Drizzle ORM](https://orm.drizzle.team/)** v0.44.5 - ORM TypeScript-first para PostgreSQL
- **[PostgreSQL](https://www.postgresql.org/)** 16 Alpine - Banco de dados relacional
- **[Better Auth](https://www.better-auth.com/)** v1.3.34 - Sistema de autenticação
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** v2.4.3 - Hashing de senhas
- **[Resend](https://resend.com/)** v6.4.2 - Serviço de envio de emails

### Infraestrutura
- **[Docker](https://www.docker.com/)** & Docker Compose - Containerização do PostgreSQL
- **[Vite](https://vitejs.dev/)** v7.1.7 - Build tool e dev server
- **[@sveltejs/adapter-node](https://kit.svelte.dev/docs/adapter-node)** v5.4.0 - Adapter para deployment Node.js

### Qualidade de Código
- **[TypeScript](https://www.typescriptlang.org/)** v5.9.2 - Superset tipado de JavaScript
- **[ESLint](https://eslint.org/)** v9.36.0 - Linter para JavaScript/TypeScript
- **[Prettier](https://prettier.io/)** v3.6.2 - Formatador de código
- **[Playwright](https://playwright.dev/)** v1.55.1 - Framework de testes E2E

## Estrutura do Projeto

```
ibzn/
├── src/
│   ├── lib/
│   │   ├── components/         # Componentes reutilizáveis
│   │   │   ├── ui/            # Componentes de UI (buttons, cards, tables, etc)
│   │   │   ├── Logo.svelte
│   │   │   ├── reset-password.svelte
│   │   │   └── theme-button.svelte
│   │   ├── hooks/             # Svelte hooks customizados
│   │   ├── server/            # Código server-side
│   │   │   ├── db/           # Configuração do banco de dados
│   │   │   │   ├── schema/   # Schemas Drizzle (users, courses, etc)
│   │   │   │   └── index.ts  # Instância do banco
│   │   │   ├── middleware/   # Middlewares de autenticação
│   │   │   ├── cache.ts      # Sistema de cache
│   │   │   ├── capabilities.ts
│   │   │   └── permissions.ts # Sistema de permissões
│   │   ├── utils.ts          # Funções utilitárias
│   │   └── auth.server.ts    # Configuração Better Auth
│   ├── routes/
│   │   ├── (protected)/      # Rotas protegidas (requerem autenticação)
│   │   │   ├── calendar/     # Calendário de eventos
│   │   │   ├── configuracoes/# Configurações do sistema
│   │   │   ├── cursos/       # Gestão de cursos
│   │   │   ├── facilitators/ # Gestão de facilitadores
│   │   │   ├── financeiro/   # Gestão financeira
│   │   │   ├── matriculas/   # Gestão de matrículas
│   │   │   ├── painel/       # Dashboard principal
│   │   │   ├── participants/ # Gestão de participantes
│   │   │   ├── payments/     # Gestão de pagamentos
│   │   │   ├── presenca/     # Controle de presença
│   │   │   └── salas/        # Gestão de salas
│   │   ├── api/              # Endpoints da API
│   │   ├── login/            # Página de login
│   │   ├── signup/           # Página de cadastro
│   │   ├── forgot-password/  # Recuperação de senha
│   │   ├── reset-password/   # Redefinição de senha
│   │   └── maintenance/      # Página de manutenção
│   ├── app.html              # Template HTML principal
│   ├── app.css               # Estilos globais
│   └── hooks.server.ts       # Hooks do SvelteKit (middleware)
├── docker-compose.yml        # Configuração do PostgreSQL
├── drizzle.config.ts         # Configuração do Drizzle ORM
├── svelte.config.js          # Configuração do SvelteKit
├── vite.config.ts            # Configuração do Vite
├── playwright.config.ts      # Configuração de testes E2E
└── package.json              # Dependências e scripts
```

## Funcionalidades

### Autenticação e Autorização
- Sistema de login/cadastro com email e senha
- Recuperação e redefinição de senha via email
- Roles de usuário (admin, manager)
- Middleware de autenticação em rotas protegidas
- Sistema de permissões granular

### Gestão de Cursos
- Cadastro e gerenciamento de cursos
- Matrículas de participantes
- Associação de facilitadores
- Controle de turmas e horários

### Controle de Presença
- Registro de presença por lista
- Histórico de presenças
- Relatórios de frequência

### Gestão Financeira
- Controle de pagamentos
- Registro de transações
- Dashboard financeiro

### Calendário
- Visualização de eventos e agendamentos
- Gestão de compromissos
- Integração com salas e cursos

### Modo Manutenção
- Sistema de manutenção programada
- Acesso restrito para administradores durante manutenção
- Configurável via banco de dados

## Pré-requisitos

- **Node.js** 18+
- **Docker** e **Docker Compose**
- **npm** ou **pnpm** ou **yarn**

## Instalação

1. Clone o repositório:
```sh
git clone <repository-url>
cd ibzn
```

2. Instale as dependências:
```sh
npm install
```

3. Configure as variáveis de ambiente:
```sh
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL="postgres://root:mysecretpassword@localhost:5432/local"
BETTER_AUTH_SECRET=your_better_auth_secret_key
BETTER_AUTH_URL=http://localhost:5173
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:5173
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL="IBZN <onboarding@resend.dev>"
```

4. Inicie o banco de dados PostgreSQL:
```sh
npm run db:start
```

5. Execute as migrações do banco de dados:
```sh
npm run db:push
```

## Scripts Disponíveis

### Desenvolvimento
```sh
npm run dev              # Inicia o servidor de desenvolvimento
npm run dev -- --open    # Inicia e abre no navegador
```

### Build e Preview
```sh
npm run build            # Cria build de produção
npm run preview          # Preview do build de produção
```

### Banco de Dados
```sh
npm run db:start         # Inicia PostgreSQL via Docker
npm run db:push          # Sincroniza schema com o banco
npm run db:generate      # Gera migrações
npm run db:migrate       # Executa migrações
npm run db:studio        # Abre Drizzle Studio (GUI do banco)
```

### Qualidade de Código
```sh
npm run check            # Verifica tipos TypeScript
npm run check:watch      # Verifica tipos em modo watch
npm run format           # Formata código com Prettier
npm run lint             # Verifica código com ESLint
```

### Testes
```sh
npm run test             # Executa testes E2E
npm run test:e2e         # Executa testes Playwright
```

## Deployment

O projeto está configurado para deployment em Node.js usando `@sveltejs/adapter-node`.

1. Build o projeto:
```sh
npm run build
```

2. O build estará disponível na pasta `build/` e pode ser executado com:
```sh
node build
```

### Variáveis de Ambiente de Produção

Certifique-se de configurar todas as variáveis de ambiente necessárias no ambiente de produção:
- `DATABASE_URL` - URL de conexão do PostgreSQL
- `BETTER_AUTH_SECRET` - Secret para o Better Auth
- `BETTER_AUTH_URL` - URL base da aplicação
- `BETTER_AUTH_TRUSTED_ORIGINS` - Origins confiáveis
- `RESEND_API_KEY` - API key do Resend
- `RESEND_FROM_EMAIL` - Email de origem

## Arquitetura

### Sistema de Autenticação
O sistema utiliza **Better Auth** com adapter Drizzle para autenticação completa:
- Email/password authentication
- Envio de emails de recuperação via Resend
- Sessões persistentes
- Campos customizados (role)

### Banco de Dados
Schema completo com tabelas para:
- Usuários e autenticação (users, sessions, accounts, verifications)
- Cursos e matrículas (courses, courseEnrollments)
- Participantes e facilitadores (participants, facilitators)
- Controle de presença (attendanceLists, attendanceRecords)
- Gestão financeira (payments)
- Calendário e eventos (events, appointments, rooms)
- Configurações do sistema (settings)

### Componentes UI
Biblioteca completa de componentes baseada em **bits-ui**:
- Buttons, Cards, Tables
- Forms (Input, Label, Textarea)
- Navigation (Sidebar, Sheet)
- Calendar
- Badges, Tooltips, Skeletons
- E mais...

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto é privado e proprietário.
