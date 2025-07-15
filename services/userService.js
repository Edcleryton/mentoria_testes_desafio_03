// Usuários de exemplo em memória
const users = [
  { username: 'admin', password: '123456', blocked: false, attempts: 0 },
  { username: 'user', password: 'abcdef', blocked: false, attempts: 0 }
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

exports.rememberPassword = (username) => {
  const user = findUser(username);
  if (!user) return { status: 'not_found' };
  // Simula envio de instrução de recuperação
  return { status: 'ok' };
};

// Método auxiliar para testes
exports.__getUsers = () => users; 