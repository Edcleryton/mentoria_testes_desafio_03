const userService = require('../services/userService');

function isValidEmail(email) {
  // Regex simples para validar email
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

function isStrongPassword(password) {
  // 12-16 caracteres, maiúscula, minúscula, número, especial
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"|,.<>/?]).{12,16}$/.test(password);
}

exports.login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username e senha são obrigatórios.' });
  }
  // Simulação de usuário proibido
  if (username === 'forbidden') {
    return res.status(403).json({ message: 'Usuário não tem permissão para acessar este recurso.' });
  }
  // Simulação de resposta parcial
  if (username === 'partial') {
    return res.status(203).json({ message: 'Login realizado, mas informações parciais retornadas.' });
  }
  const result = userService.login(username, password);
  if (result.status === 'blocked') {
    return res.status(429).json({ message: 'Usuário bloqueado por excesso de tentativas.' });
  }
  if (result.status === 'success') {
    // 201 Created para login bem-sucedido (sessão criada)
    return res.status(201).json({ message: 'Login realizado com sucesso. Sessão criada.' });
  }
  return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
};

exports.rememberPassword = (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Username é obrigatório.' });
  }
  // Simulação de usuário proibido
  if (username === 'forbidden') {
    return res.status(403).json({ message: 'Usuário não tem permissão para solicitar recuperação de senha.' });
  }
  // Simulação de resposta parcial
  if (username === 'partial') {
    return res.status(203).json({ message: 'Solicitação processada, mas informações parciais retornadas.' });
  }
  const result = userService.rememberPassword(username);
  if (result.status === 'not_found') {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }
  // 201 Created para solicitação de recuperação criada
  return res.status(201).json({ message: 'Instruções de recuperação enviadas. Solicitação criada.' });
};

exports.register = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username (e-mail) e senha são obrigatórios.' });
  }
  if (!isValidEmail(username)) {
    return res.status(400).json({ message: 'Username (e-mail) inválido.' });
  }
  if (!isStrongPassword(password)) {
    return res.status(400).json({ message: 'A senha deve ter entre 12 e 16 caracteres, conter maiúsculas, minúsculas, números e caractere especial.' });
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