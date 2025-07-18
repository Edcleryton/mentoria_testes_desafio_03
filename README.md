# API de Login de Usuários

![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-green)
![Express](https://img.shields.io/badge/express-%5E4.18.2-blue)
![Mocha](https://img.shields.io/badge/tested%20with-mocha-yellow)

## Sumário

- [Pré-requisitos](#pré-requisitos)
- [Como baixar e instalar o projeto](#como-baixar-e-instalar-o-projeto)
- [Como rodar os testes](#como-rodar-os-testes)
- [Estrutura de Pastas e Explicação](#estrutura-de-pastas-e-explicação)
- [Usuários de exemplo](#usuários-de-exemplo)
- [Autenticação](#autenticação)
- [Exemplos de Requisições](#exemplos-de-requisições)
- [Dependências principais](#dependências-principais)
- [Observações](#observações)
- [Licença](#licença)

## Histórico de Alterações

- Implementação de autenticação JWT (Bearer Token) para todos os endpoints protegidos.
- Adição de roles de usuário: `admin` e `user`.
- Criação de usuários administradores: `admin@email.com`, `edcleryton.silva@email.com`, `jorge.mercado@email.com` (todos com senha `Admin123456!`).
- Criação de endpoint PATCH `/admin/user` para administradores alterarem nome/senha de qualquer usuário.
- Criação de endpoint DELETE `/user` para administradores deletarem qualquer usuário.
- Apenas administradores podem alterar ou deletar outros usuários.
- Separação dos testes automatizados em blocos distintos para garantir isolamento e clareza dos cenários (usuário comum, admin, permissões, etc).
- Reset robusto do estado dos usuários antes de cada teste.
- Documentação Swagger e exemplos de requisição atualizados.

## Documentação Swagger

A documentação interativa da API está disponível em:

[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

Basta iniciar a aplicação e acessar esse link no navegador para visualizar e testar todos os endpoints da API.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [npm](https://www.npmjs.com/) (geralmente já vem com o Node.js)
- Git (opcional, para clonar o repositório)

## Como baixar e instalar o projeto

1. **Clone o repositório (ou baixe o ZIP):**
   ```bash
   git clone https://github.com/seu-usuario/mentoria_testes_desafio_03.git
   cd mentoria_testes_desafio_03
   ```
   > Se preferir, baixe o projeto como ZIP pelo GitHub e extraia em uma pasta.

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **(Opcional) Defina a porta da aplicação:**
   - Por padrão, a API roda na porta 3000. Para mudar, defina a variável de ambiente `PORT`:
     ```bash
     export PORT=4000 # Linux/Mac
     set PORT=4000    # Windows
     ```

4. **Inicie a aplicação:**
   ```bash
   node app.js
   ```

5. **Acesse a documentação Swagger:**
   - [http://localhost:3000/api-docs](http://localhost:3000/api-docs) (ou a porta que você definiu)

## Como rodar os testes

Execute:
```bash
npm test
```

## Usuários de exemplo

> **Atenção:** As senhas estão explícitas para facilitar o estudo e os testes. **Nunca faça isso em produção!**

- **admin@email.com** (admin)
  - Senha: `Admin123456!`
- **edcleryton.silva@email.com** (admin)
  - Senha: `Admin123456!`
- **jorge.mercado@email.com** (admin)
  - Senha: `Admin123456!`
- **user@email.com** (usuário comum)
  - Senha: `User12345678!`

## Autenticação

A API utiliza autenticação do tipo **Bearer Token** (JWT). Para acessar endpoints protegidos, faça login e utilize o token retornado no header:

```
Authorization: Bearer <seu_token>
```

## Exemplos de Requisições

### Cadastro de Usuário
```http
POST /register
Content-Type: application/json
{
  "email": "usuario@email.com",
  "password": "SenhaForte123!"
}
```

### Login
```http
POST /login
Content-Type: application/json
{
  "email": "admin@email.com",
  "password": "Admin123456!"
}
```
**Resposta:**
```json
{
  "message": "Login realizado com sucesso. Sessão criada.",
  "token": "<jwt_token>"
}
```

### Alterar senha do próprio usuário (autenticado)
```http
PATCH /user
Authorization: Bearer <token>
Content-Type: application/json
{
  "password": "NovaSenha12345!"
}
```

### Alterar nome/senha de qualquer usuário (admin)
```http
PATCH /admin/user
Authorization: Bearer <token_admin>
Content-Type: application/json
{
  "username": "user@email.com",
  "password": "NovaSenha12345!",
  "newUsername": "novo@email.com" // opcional
}
```

### Deletar usuário (admin)
```http
DELETE /user
Authorization: Bearer <token_admin>
Content-Type: application/json
{
  "username": "user@email.com"
}
```

### Recuperação de Senha
```http
POST /remember-password
Content-Type: application/json
{
  "email": "usuario@email.com"
}
```

## Dependências principais
- express
- swagger-ui-express
- swagger-jsdoc
- jsonwebtoken
- mocha (testes)
- supertest (testes)

## Observações
- O arquivo `swagger.json` contém toda a documentação da API.
- Para rodar a API em outra porta, defina a variável de ambiente `PORT`.
- O cadastro exige email válido e senha forte (12-16 caracteres, maiúscula, minúscula, número e caractere especial).
- Apenas administradores podem alterar ou deletar outros usuários.
- **Nunca exponha senhas reais em código ou documentação em ambientes de produção!**

## Estrutura de Pastas e Explicação

```
/
├── app.js                 # Arquivo principal da aplicação Express
├── package.json           # Gerenciador de dependências e scripts
├── package-lock.json      # Controle de versões das dependências
├── README.md              # Documentação do projeto
├── routes/
│   └── userRoutes.js      # Rotas relacionadas a usuários
├── services/
│   └── userService.js     # Lógica de negócio dos usuários
├── controllers/
│   └── userController.js  # Controladores das rotas de usuário
├── test/
│   └── user.test.js       # Testes automatizados
├── swagger.json           # Documentação Swagger da API
```

- **app.js**: Ponto de entrada da aplicação.
- **routes/**: Define as rotas da API.
- **controllers/**: Controla as requisições e respostas das rotas.
- **services/**: Contém a lógica de negócio.
- **test/**: Testes automatizados.
- **swagger.json**: Documentação da API.

## Licença

Este projeto está licenciado sob a licença MIT.

