const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

const { logDebug } = require('../../utils/logger');

function isValidEmail(email) {
	// Regex simples para validar email
	return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

function isStrongPassword(password) {
	// 12-16 caracteres, maiúscula, minúscula, número, especial
	return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"|,.<>/?]).{12,16}$/.test(password);
}

exports.login = (req, res) => {
	logDebug('=== LOGIN ENDPOINT CALLED ===');
	logDebug('Request body:', req.body);
	logDebug('Request headers:', req.headers);

	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(400).json({ message: 'Username e senha são obrigatórios.', success: false });
	}
	// Simulação de usuário proibido
	if (username === 'forbidden') {
		return res.status(403).json({
			message: 'Usuário não tem permissão para acessar este recurso.',
			success: false,
		});
	}
	// Simulação de resposta parcial
	if (username === 'partial') {
		return res.status(203).json({
			message: 'Login realizado, mas informações parciais retornadas.',
			success: true,
		});
	}
	const result = userService.login(username, password);
	if (result.status === 'blocked') {
		return res.status(429).json({
			message: 'Usuário bloqueado por excesso de tentativas.',
			success: false,
		});
	}
	if (result.status === 'success') {
		// Geração do token JWT com role
		const token = jwt.sign({ username, role: result.user.role }, 'secreta_super_segura', { expiresIn: '1h' });
		return res.status(200).json({
			message: 'Login realizado com sucesso.',
			token,
			success: true,
		});
	}
	return res.status(401).json({ message: 'Usuário ou senha inválidos.', success: false });
};

exports.rememberPassword = (req, res) => {
	logDebug('=== REMEMBER PASSWORD ENDPOINT CALLED ===');
	logDebug('Request body:', req.body);
	logDebug('Request headers:', req.headers);

	const { username } = req.body;
	if (!username) {
		return res.status(400).json({ message: 'Username é obrigatório.', success: false });
	}
	
	// Validação de email
	if (!isValidEmail(username)) {
		return res.status(400).json({ message: 'Username (e-mail) inválido.', success: false });
	}
	
	// Simulação de usuário não encontrado
	if (username === 'notfound' || username === 'naoexiste') {
		return res.status(404).json({ message: 'Usuário não encontrado.', success: false });
	}
	// Simulação de usuário proibido
	if (username === 'forbidden') {
		return res.status(403).json({ message: 'Usuário não tem permissão para solicitar recuperação de senha.', success: false });
	}
	// Simulação de resposta parcial
	if (username === 'partial') {
		return res.status(203).json({ message: 'Solicitação processada, mas informações parciais retornadas.', success: true });
	}
	
	// Validação se o usuário existe no sistema
	const user = userService.getUser(username);
	if (!user) {
		return res.status(404).json({ message: 'Usuário não encontrado.', success: false });
	}
	
	// Simulação de sucesso
	return res.status(200).json({ message: 'Instruções de recuperação enviadas.', success: true });
};

exports.register = (req, res) => {
	logDebug('=== REGISTER ENDPOINT CALLED ===');
	logDebug('Request body:', req.body);
	logDebug('Request headers:', req.headers);

	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(400).json({ message: 'Username (e-mail) e senha são obrigatórios.' });
	}
	if (!isValidEmail(username)) {
		return res.status(400).json({ message: 'Username (e-mail) inválido.' });
	}
	if (!isStrongPassword(password)) {
		return res.status(400).json({
			message:
				'A senha deve ter entre 12 e 16 caracteres, conter maiúsculas, minúsculas, números e caractere especial.',
		});
	}
	const result = userService.register(username, password);
	if (result.status === 'exists') {
		return res.status(400).json({ message: 'Usuário já existe.' });
	}
	if (result.status === 'created') {
		return res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
	}
	return res.status(400).json({ message: 'Dados inválidos.' });
};

exports.updateUser = (req, res) => {
	const { password } = req.body;
	const username = req.user.username;
	if (!password) {
		return res.status(400).json({ message: 'Senha é obrigatória.' });
	}
	if (!isStrongPassword(password)) {
		return res.status(400).json({
			message:
				'A senha deve ter entre 12 e 16 caracteres, conter maiúsculas, minúsculas, números e caractere especial.',
		});
	}
	const result = userService.updatePassword(username, password);
	if (result.status === 'not_found') {
		return res.status(404).json({ message: 'Usuário não encontrado.' });
	}
	if (result.status === 'updated') {
		return res.status(200).json({ message: 'Usuário atualizado com sucesso.' });
	}
	return res.status(400).json({ message: 'Erro ao atualizar usuário.' });
};

exports.updateUserByAdmin = (req, res) => {
	console.log('updateUserByAdmin - req.user:', req.user);
	console.log('updateUserByAdmin - req.body:', req.body);
	const { username: targetUsername, newPassword, password, newUsername } = req.body;
	const { role } = req.user;
	if (role !== 'admin') {
		return res.status(403).json({
			message: 'Apenas administradores podem alterar outros usuários.',
		});
	}
	if (!targetUsername) {
		return res.status(400).json({ message: 'Username do usuário a ser alterado é obrigatório.' });
	}
	const newData = {};
	// Aceita tanto password quanto newPassword
	if (newPassword || password) {
		const passwordToUse = newPassword || password;
		if (!isStrongPassword(passwordToUse)) {
			return res.status(400).json({
				message:
					'A senha deve ter entre 12 e 16 caracteres, conter maiúsculas, minúsculas, números e caractere especial.',
			});
		}
		newData.password = passwordToUse;
	}
	if (newUsername) {
		if (!isValidEmail(newUsername)) {
			return res.status(400).json({ message: 'Username (e-mail) inválido.' });
		}
		newData.username = newUsername;
	}
	const result = userService.updateUserByAdmin(targetUsername, newData);
	if (result.status === 'not_found') {
		return res.status(404).json({ message: 'Usuário não encontrado.' });
	}
	return res.status(200).json({ message: 'Usuário atualizado com sucesso.' });
};

exports.deleteUser = (req, res) => {
	console.log('deleteUser - req.user:', req.user);
	console.log('deleteUser - req.body:', req.body);
	const { role } = req.user;
	const { username: targetUsername } = req.body;
	if (role !== 'admin') {
		return res.status(403).json({ message: 'Apenas administradores podem deletar usuários.' });
	}
	if (!targetUsername) {
		return res.status(400).json({ message: 'Username do usuário a ser deletado é obrigatório.' });
	}
	const result = userService.deleteUser(targetUsername);
	if (result.status === 'not_found') {
		return res.status(404).json({ message: 'Usuário não encontrado.' });
	}
	return res.status(200).json({ message: 'Usuário deletado com sucesso.' });
};

exports.listUsers = (req, res) => {
	// Busca todos os usuários, mas não retorna a senha
	const users = userService.getAllUsers().map((u) => ({
		username: u.username,
		role: u.role,
		blocked: u.blocked,
		attempts: u.attempts,
	}));
	res.status(200).json(users);
};
