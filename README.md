# AdminDesk

Sistema de gestão financeira e de clientes para pequenas e médias empresas.
AdminDesk é uma aplicação **full-stack** que permite controlar **clientes, 
receitas e despesas em tempo real**, oferecendo uma visão clara da saúde 
financeira do negócio através de um **dashboard visual e interativo**.
O projeto foi desenvolvido com **React no frontend** e **Spring Boot no backend**, 
utilizando autenticação segura com **JWT** e arquitetura organizada em camadas.

---

## Demonstração

🔗 **Aplicação:** *(em breve)*

---

# Funcionalidades

- Dashboard financeiro com **totais de receitas, despesas e lucro**
- **Gráfico de evolução mensal**
- **Cadastro completo de clientes**
- Controle de **receitas e despesas**
- **Receita vinculada automaticamente a clientes**
- **Autenticação segura com JWT**
- Rotas protegidas no frontend
- Interface **dark-first moderna**
- API REST estruturada

---

# Arquitetura do Projeto

O AdminDesk segue uma arquitetura organizada separando **frontend e backend**, com responsabilidades bem definidas.

AdminDesk
├ backend  (Spring Boot API)
└ frontend (React + Vite)

---

# Stack Tecnológica

## Frontend

| Tecnologia | Uso |
|---|---|
| React | Construção da interface |
| Vite | Build tool e ambiente de desenvolvimento |
| React Router | Navegação entre páginas |
| Context API | Gerenciamento de estado global |
| Recharts | Gráficos do dashboard |
| TailwindCSS | Estilização |
| Lucide Icons | Ícones da interface |

---

## Backend

| Tecnologia | Uso |
|---|---|
| Java | Linguagem principal |
| Spring Boot | Framework da API |
| Spring Security | Autenticação e autorização |
| JWT | Autenticação baseada em token |
| Spring Data JPA | Persistência de dados |
| Hibernate | ORM |
| Maven | Gerenciamento de dependências |

---

# Estrutura do Projeto

## Frontend

```

src
├ components
│   ├ PrivateRoute.jsx
│   └ Sidebar.jsx
│
├ context
│   └ AuthContext.jsx
│
├ hooks
│   └ useTheme.js
│
├ pages
│   ├ Dashboard.jsx
│   ├ Clientes.jsx
│   ├ Despesas.jsx
│   ├ Relatorios.jsx
│   ├ Configuracoes.jsx
│   ├ Login.jsx
│   └ Register.jsx
│
├ services
│   └ api.js
│
├ App.jsx
└ main.jsx

```

---

## Backend

```

src/main/java/com/admindesk

controller
├ AuthController
├ ClientController
├ DashboardController
└ SpentController

dto
├ DashboardDTO
├ LoginRequest
└ RegisterRequest

entity
├ Client
├ Spent
└ User

repository
├ ClientRepository
├ SpentRepository
└ UserRepository

service
├ ClienteService
├ DashboardService
├ SpentService
└ UserService

security
├ JwtFilter
├ JwtUtil
├ PasswordConfig
└ SecurityConfig

```

---

# API REST

## Autenticação

### Login

```

POST /login

````

```json
{
  "email": "user@email.com",
  "password": "123456"
}
````

Retorno:

```json
{
  "token": "jwt-token"
}
```

Todas as outras rotas exigem:

```
Authorization: Bearer <token>
```

---

## Dashboard

```
GET /dashboard
```

Resposta:

```json
{
  "totalReceitas": 4800,
  "totalDespesas": 1200,
  "lucro": 3600,
  "grafico": [
    { "time": "Jan", "receita": 3200, "despesa": 800 },
    { "time": "Fev", "receita": 4100, "despesa": 950 },
    { "time": "Mar", "receita": 4800, "despesa": 1200 }
  ]
}
```

---

## Clientes

| Método | Endpoint        |
| ------ | --------------- |
| GET    | `/clients`      |
| POST   | `/clients`      |
| PUT    | `/clients/{id}` |
| DELETE | `/clients/{id}` |

---

## Lançamentos Financeiros

| Método | Endpoint       |
| ------ | -------------- |
| GET    | `/spents`      |
| POST   | `/spents`      |
| PUT    | `/spents/{id}` |
| DELETE | `/spents/{id}` |

### Exemplo de criação

```json
{
  "descriptor": "Mensalidade - João Silva",
  "price": 200,
  "date": "2026-03-01",
  "type": "income",
  "clientId": 3
}
```

---

# Instalação

## Pré-requisitos

* Node.js 18+
* Java 17+
* Maven
* Banco de dados relacional (PostgreSQL ou MySQL)

---

## Backend

```bash
git clone https://github.com/seu-usuario/admindesk.git

cd backend

mvn spring-boot:run
```

A API iniciará em:

```
http://localhost:8080
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Aplicação disponível em:

```
http://localhost:5173
```

---

# Variáveis de Ambiente

Crie um arquivo `.env` no frontend:

```
VITE_API_URL=http://localhost:8080
```

---

# Design System

| Token         | Valor     | Uso               |
| ------------- | --------- | ----------------- |
| bg            | `#080f08` | Fundo principal   |
| bgCard        | `#0d150d` | Cards             |
| border        | `#1a2e1a` | Bordas            |
| green         | `#84cc16` | Destaques         |
| greenText     | `#a3e635` | Valores positivos |
| red           | `#ef4444` | Valores negativos |
| textPrimary   | `#f0fdf0` | Texto principal   |
| textSecondary | `#6b7280` | Texto secundário  |

---

# Melhorias Futuras

* Exportação de relatórios em **PDF**
* Dashboard com **filtros por período**
* Sistema de **notificações financeiras**
* Testes automatizados
* Dockerização do projeto

---

# Licença

MIT License

---

# Autor

Desenvolvido por **Victor Berlinck**
