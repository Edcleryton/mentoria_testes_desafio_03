# API de Login de Usuários

## Documentação Swagger

A documentação interativa da API está disponível em:

[http://localhost:3000/api-docs](http://localhost:3000/api-docs)


Basta iniciar a aplicação e acessar esse link no navegador para visualizar e testar todos os endpoints da API.
=======
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
  "email": "usuario@email.com",
  "password": "SenhaForte123!"
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
- mocha (testes)
- supertest (testes)

## Observações
- O arquivo `swagger.json` contém toda a documentação da API.
- Para rodar a API em outra porta, defina a variável de ambiente `PORT`.
- O cadastro exige email válido e senha forte (12-16 caracteres, maiúscula, minúscula, número e caractere especial).

---
Se precisar de mais informações, consulte o arquivo `swagger.json` ou a documentação em `/api-docs`. 