const userService = require('../../services/userService');

function isValidEmail(email) {
  // Regex simples para validar email
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

function isStrongPassword(password) {
  // 12-16 caracteres, maiúscula, minúscula, número, especial
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"|,.<>/?]).{12,16}$/.test(password);
}

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }
  // Simulação de usuário proibido
  if (email === 'forbidden@email.com') {
    return res.status(403).json({ message: 'Usuário não tem permissão para acessar este recurso.' });
  }
  // Simulação de resposta parcial
  if (email === 'partial@email.com') {
    return res.status(203).json({ message: 'Login realizado, mas informações parciais retornadas.' });
  }
  const result = userService.login(email, password);
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
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email é obrigatório.' });
  }
  // Simulação de usuário proibido
  if (email === 'forbidden@email.com') {
    return res.status(403).json({ message: 'Usuário não tem permissão para solicitar recuperação de senha.' });
  }
  // Simulação de resposta parcial
  if (email === 'partial@email.com') {
    return res.status(203).json({ message: 'Solicitação processada, mas informações parciais retornadas.' });
  }
  const result = userService.rememberPassword(email);
  if (result.status === 'not_found') {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }
  // 201 Created para solicitação de recuperação criada
  return res.status(201).json({ message: 'Instruções de recuperação enviadas. Solicitação criada.' });
};

exports.register = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Email inválido.' });
  }
  if (!isStrongPassword(password)) {
    return res.status(400).json({ message: 'A senha deve ter entre 12 e 16 caracteres, conter maiúsculas, minúsculas, números e caractere especial.' });
  }
  const result = userService.register(email, password);
  if (result.status === 'exists') {
    return res.status(400).json({ message: 'Usuário já existe.' });
  }
  if (result.status === 'created') {
    return res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
  }
  return res.status(400).json({ message: 'Dados inválidos.' });
}; 