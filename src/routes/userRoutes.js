const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

// Middleware para autenticação JWT
function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (!token) return res.status(401).json({ message: 'Token não fornecido.' });
	jwt.verify(token, 'secreta_super_segura', (err, decoded) => {
		if (err) return res.status(403).json({ message: 'Token inválido.' });
		// Garante que role está atualizado (caso o usuário tenha sido alterado)
		const user = userService.getUser(decoded.username);
		if (!user) return res.status(403).json({ message: 'Usuário não encontrado.' });
		req.user = { username: user.username, role: user.role };
		next();
	});
}

// Middleware para autorizar apenas admin
function authorizeAdmin(req, res, next) {
	if (req.user && req.user.role === 'admin') {
		return next();
	}
	return res.status(403).json({ message: 'Apenas administradores podem acessar esta rota.' });
}

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

/**
 * @swagger
 * /user:
 *   patch:
 *     summary: Atualiza dados do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 12
 *                 maxLength: 16
 *                 pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\-=[\\]{};':\\\"|,.<>/?]).{12,16}$'
 *     responses:
 *       '200':
 *         description: Usuário atualizado com sucesso.
 *       '400':
 *         description: Dados inválidos.
 *       '401':
 *         description: Token não fornecido.
 *       '403':
 *         description: Token inválido.
 *       '404':
 *         description: Usuário não encontrado.
 */
router.patch('/user', authenticateToken, userController.updateUser);

/**
 * @swagger
 * /admin/user:
 *   patch:
 *     summary: Admin atualiza dados de outro usuário
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username do usuário a ser alterado
 *               newPassword:
 *                 type: string
 *                 minLength: 12
 *                 maxLength: 16
 *                 pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\-=[\\]{};':\\\"|,.<>/?]).{12,16}$'
 *               newUsername:
 *                 type: string
 *                 format: email
 *     responses:
 *       '200':
 *         description: Usuário atualizado com sucesso.
 *       '400':
 *         description: Dados inválidos.
 *       '401':
 *         description: Token não fornecido.
 *       '403':
 *         description: Apenas administradores podem acessar esta rota.
 *       '404':
 *         description: Usuário não encontrado.
 */
router.patch('/admin/user', authenticateToken, authorizeAdmin, userController.updateUserByAdmin);

/**
 * @swagger
 * /admin/user:
 *   delete:
 *     summary: Admin deleta um usuário
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username do usuário a ser deletado
 *     responses:
 *       '200':
 *         description: Usuário deletado com sucesso.
 *       '400':
 *         description: Username não fornecido.
 *       '401':
 *         description: Token não fornecido.
 *       '403':
 *         description: Apenas administradores podem acessar esta rota.
 *       '404':
 *         description: Usuário não encontrado.
 */
router.delete('/admin/user', authenticateToken, authorizeAdmin, userController.deleteUser);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Admin lista todos os usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de usuários retornada com sucesso.
 *       '401':
 *         description: Token não fornecido.
 *       '403':
 *         description: Apenas administradores podem acessar esta rota.
 */
router.get('/admin/users', authenticateToken, authorizeAdmin, userController.listUsers);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Admin lista todos os usuários (alternativa)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de usuários retornada com sucesso.
 *       '401':
 *         description: Token não fornecido.
 *       '403':
 *         description: Apenas administradores podem acessar esta rota.
 */
router.post('/admin/reset-users', authenticateToken, authorizeAdmin, userController.resetUsers);

/**
 * @swagger
 * /admin/reset-users:
 *   post:
 *     summary: Admin restaura ao estado inicial os dados de todos os usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Usuários resetados com sucesso.
 *       '401':
 *         description: Token não fornecido.
 *       '403':
 *         description: Apenas administradores podem acessar esta rota.
 */
module.exports = router;
