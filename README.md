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
- Criação de usuários administradores: `admin@email.com`, `edcleryton.silva@email.com`, `jorge.mercado@email.com`.
- Criação de endpoint PATCH `/admin/user` para administradores alterarem nome/senha de qualquer usuário.
- Criação de endpoint DELETE `/user` para administradores deletarem qualquer usuário.
- Novo endpoint: `GET /health` para verificar se a API está online.
- Adicionado suporte a logs de debug via variável de ambiente `DEBUG=true`.
- Separação dos testes automatizados em blocos distintos.
- Documentação Swagger e exemplos de requisição atualizados.

## Documentação Swagger

A documentação interativa da API está disponível em:

[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [npm](https://www.npmjs.com/)
- Git (opcional)

## Como baixar e instalar o projeto

1. **Clone o repositório ou baixe como ZIP:**

   ```bash
   git clone https://github.com/Edcleryton/mentoria_testes_desafio_03/
   cd mentoria_testes_desafio_03
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente (.env):**

   Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

   ```env
   DEBUG=true
   PORT=3000
   ```

   > `DEBUG=true` ativa logs de debug no terminal. É opcional, mas útil para desenvolvimento.

4. **Inicie a aplicação:**

   ```bash
   node app.js
   ```

5. **Acesse a documentação Swagger:**

   [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Como rodar os testes

```bash
npm test
```

## Usuários de exemplo

> ⚠️ **Atenção:** Nunca use essas senhas em produção!

| Email                                                           | Tipo  | Senha         |
| --------------------------------------------------------------- | ----- | ------------- |
| [admin@email.com](mailto:admin@email.com)                       | admin | Admin123456!  |
| [edcleryton.silva@email.com](mailto:edcleryton.silva@email.com) | admin | Admin123456!  |
| [jorge.mercado@email.com](mailto:jorge.mercado@email.com)       | admin | Admin123456!  |
| [user@email.com](mailto:user@email.com)                         | comum | User12345678! |

## Autenticação

A API utiliza JWT. Use o token no header:

```http
Authorization: Bearer <seu_token>
```

## Exemplos de Requisições

### Login

```http
POST /login
{
  "email": "admin@email.com",
  "password": "Admin123456!"
}
```

### Recuperação de Senha

```http
POST /remember-password
{
  "email": "user@email.com"
}
```

### Verificar status da API (Health Check)

```http
GET /health
```

**Resposta:**

```json
{
  "status": "ok",
  "message": "API está funcionando"
}
```

### Alterar dados (usuário autenticado)

```http
PATCH /user
Authorization: Bearer <token>
{
  "password": "NovaSenha123!"
}
```

### Ações administrativas

* **Alterar qualquer usuário:**

```http
PATCH /admin/user
Authorization: Bearer <admin_token>
{
  "username": "user@email.com",
  "password": "NovaSenha123!",
  "newUsername": "novo@email.com"
}
```

* **Deletar usuário:**

```http
DELETE /admin/user
Authorization: Bearer <admin_token>
{
  "username": "user@email.com"
}
```

* **Listar todos os usuários:**

```http
GET /admin/users
Authorization: Bearer <admin_token>
```

## Cobertura de Testes

Arquivos de teste incluídos:

```
test/
├── login.test.js
├── user-features.test.js
├── user-password-update.test.js
├── user-permission.test.js
├── admin-features.test.js
└── user-delete.test.js
```

## Dependências principais

* `express`
* `swagger-ui-express`
* `swagger-jsdoc`
* `jsonwebtoken`
* `dotenv`
* `mocha`, `chai`, `supertest` (testes)

## Observações

* Logs de debug estão disponíveis se você definir `DEBUG=true` no `.env`.
* Para rodar em outra porta, defina `PORT=xxxx` no `.env`.
* O arquivo `swagger.json` contém a documentação da API.
* Todos os testes são independentes e reiniciam o estado da base de dados antes de cada execução.

## Estrutura de Pastas

```
/
├── app.js
├── .env
├── package.json
├── README.md
├── routes/
│   └── userRoutes.js
├── controllers/
│   └── userController.js
├── services/
│   └── userService.js
├── utils/
│   └── logger.js
├── test/
│   ├── *.test.js
├── swagger.json
```

## Licença

Este projeto está licenciado sob a Licença MIT.

## 👤 Autores

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Edcleryton">
        <img src="https://avatars.githubusercontent.com/u/134793465?v=4" width="50px" /><br />
        <sub><b>Edcleryton Silva</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/9809022">
        <img src="https://avatars.githubusercontent.com/u/9809022?v=4" width="50px" /><br />
        <sub><b>Autor 1</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/43006576">
        <img src="https://avatars.githubusercontent.com/u/43006576?v=4" width="50px" /><br />
        <sub><b>Autor 2</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/7840758">
        <img src="https://avatars.githubusercontent.com/u/7840758?v=4" width="50px" /><br />
        <sub><b>Autor 3</b></sub>
      </a>
    </td>
  </tr>
</table>
