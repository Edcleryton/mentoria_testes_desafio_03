// Usuários de exemplo em memória
const users = [

  { username: 'admin@email.com', password: 'Admin123456!', blocked: false, attempts: 0 },
  { username: 'user@email.com', password: 'User12345678!', blocked: false, attempts: 0 }
];

function findUser(username) {
  return users.find(u => u.username === username);
}

exports.login = (username, password) => {
  const user = findUser(username);

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

exports.register = (username, password) => {
  if (!username || !password) {
    return { status: 'invalid' };
  }
  if (findUser(username)) {
    return { status: 'exists' };
  }
  users.push({ username, password, blocked: false, attempts: 0 });
  return { status: 'created' };
};

exports.rememberPassword = (username) => {
  const user = findUser(username);

  if (!user) return { status: 'not_found' };
  // Simula envio de instrução de recuperação
  return { status: 'ok' };
};

// Método auxiliar para testes
exports.__getUsers = () => users; 