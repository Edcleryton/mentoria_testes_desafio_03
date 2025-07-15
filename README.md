# API Login de Usuários

API REST para gestão de login de usuários, desenvolvida em Node.js com Express, para fins de estudo de testes automatizados.

## Funcionalidades
- Login de usuário (com bloqueio após 3 tentativas inválidas)
- Lembrar senha
- Documentação Swagger em `/api-docs`

## Tecnologias Utilizadas
- Node.js
- Express
- Swagger (OpenAPI)
- Mocha
- Supertest

## Instalação
```bash
cd mentoria_testes_desafio_03
npm install
```

## Como iniciar o servidor
```bash
npm start
```

## Como rodar os testes
```bash
npm test
```

## Documentação da API
Acesse a documentação Swagger em: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

**Projeto para fins de estudo. Não utilizar em produção.** 

## Códigos de Status da API

| Código | Nome do Status         | Cenário de Aplicação                                                                                   |
|--------|-----------------------|--------------------------------------------------------------------------------------------------------|
| 200    | OK                    | Requisição bem-sucedida. Exemplo: login realizado com sucesso ou instruções de recuperação enviadas.   |
| 201    | Created               | Recurso criado com sucesso. Exemplo: sessão de login criada ou solicitação de recuperação registrada.  |
| 203    | Non-Authoritative Information | Requisição bem-sucedida, mas as informações retornadas podem ser parciais ou de fonte não-autoritativa. |
| 400    | Bad Request           | A requisição está mal formatada ou faltam campos obrigatórios (ex: username/senha).                    |
| 401    | Unauthorized          | As credenciais fornecidas (username ou senha) estão incorretas.                                        |
| 403    | Forbidden             | O usuário está autenticado, mas não tem permissão para acessar o recurso ou realizar a ação.           |
| 404    | Not Found             | Usuário não encontrado (ex: ao solicitar lembrar senha para usuário inexistente).                      |
| 429    | Too Many Requests     | A conta foi bloqueada temporariamente devido a múltiplas tentativas de login falhas.                   |
| 500    | Internal Server Error | Ocorreu um erro inesperado no servidor.                                                                | 