// Usuários de exemplo em memória
const users = [

  { email: 'admin@email.com', password: 'Admin123456!', blocked: false, attempts: 0 },
  { email: 'user@email.com', password: 'User12345678!', blocked: false, attempts: 0 }
];

function findUser(email) {
  return users.find(u => u.email === email);
}

exports.login = (email, password) => {
  const user = findUser(email);

  if (!user) return { status: 'invalid' };
  if (user.blocked) return { status: 'blocked' };
  if (user.password === password) {
    user.attempts = 0;
    return { status: 'success' };
  } else {
    user.attempts++;
    if (user.attempts >= 3) {
      user.blocked = true;
      return { status: 'blocked' };
    }
    return { status: 'invalid' };
  }
};

exports.register = (email, password) => {
  if (!email || !password) {
    return { status: 'invalid' };
  }
  if (findUser(email)) {
    return { status: 'exists' };
  }
  users.push({ email, password, blocked: false, attempts: 0 });
  return { status: 'created' };
};

exports.rememberPassword = (email) => {
  const user = findUser(email);

  if (!user) return { status: 'not_found' };
  // Simula envio de instrução de recuperação
  return { status: 'ok' };
};

// Método auxiliar para testes
exports.__getUsers = () => users; 