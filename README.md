# API de Login de Usuários

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

## Instalação
```bash
cd mentoria_testes_desafio_03
npm install
```

## Estrutura de Pastas

```
/
├── app.js
├── package.json
├── package-lock.json
├── README.md
├── routes/
│   └── userRoutes.js
├── services/
│   └── userService.js
├── controllers/
│   └── userController.js
├── test/
│   └── user.test.js
├── swagger.json
```

## Como rodar o projeto

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie a aplicação:
   ```bash
   node app.js
   ```
3. Acesse a documentação:
   - [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

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

--- 