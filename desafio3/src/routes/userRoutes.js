const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autentica um usuário
 *     description: Recebe email e senha para autenticação.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 12
 *                 maxLength: 16
 *                 pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\-=[\\]{};':\\\"|,.<>/?]).{12,16}$'
 *     responses:
 *       '200':
 *         description: OK. Login bem-sucedido.
 *       '201':
 *         description: Created. Login realizado e sessão criada (caso aplicável).
 *       '203':
 *         description: Non-Authoritative Information. Login realizado, mas informações retornadas podem ser parciais.
 *       '400':
 *         description: Bad Request. A requisição está mal formatada ou faltam campos obrigatórios (email/senha).
 *       '401':
 *         description: Unauthorized. As credenciais fornecidas (email ou senha) estão incorretas.
 *       '403':
 *         description: Forbidden. O usuário está ativo, mas não tem permissão para acessar o recurso (caso aplicável).
 *       '429':
 *         description: Too Many Requests. A conta foi bloqueada temporariamente devido a múltiplas tentativas de login falhas.
 *       '500':
 *         description: Internal Server Error. Ocorreu um erro inesperado no servidor.
 */
router.post('/login', userController.login);

/**
 * @swagger
 * /remember-password:
 *   post:
 *     summary: Solicita instruções para lembrar a senha do usuário
 *     description: Envia instruções de recuperação de senha para o email informado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       '200':
 *         description: OK. Instruções de recuperação enviadas.
 *       '201':
 *         description: Created. Solicitação de recuperação criada com sucesso.
 *       '203':
 *         description: Non-Authoritative Information. Solicitação processada, mas informações podem ser parciais.
 *       '400':
 *         description: Bad Request. A requisição está mal formatada ou falta o campo obrigatório (email).
 *       '403':
 *         description: Forbidden. O usuário não tem permissão para solicitar recuperação de senha (caso aplicável).
 *       '404':
 *         description: Not Found. Usuário não encontrado.
 *       '500':
 *         description: Internal Server Error. Ocorreu um erro inesperado no servidor.
 */
router.post('/remember-password', userController.rememberPassword);

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Cadastro de novo usuário
 *     description: Permite que um novo usuário se cadastre informando email e senha.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 12
 *                 maxLength: 16
 *                 pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\-=[\\]{};':\\\"|,.<>/?]).{12,16}$'
 *     responses:
 *       '201':
 *         description: Created. Usuário cadastrado com sucesso.
 *       '400':
 *         description: Bad Request. Dados inválidos ou usuário já existe.
 *       '500':
 *         description: Internal Server Error. Ocorreu um erro inesperado no servidor.
 */
router.post('/register', userController.register);

module.exports = router; 