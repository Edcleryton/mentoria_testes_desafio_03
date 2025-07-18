// Usuários de exemplo em memória
const users = [
  {
    username: "admin@email.com",
    password: "Admin123456!",
    blocked: false,
    attempts: 0,
    role: "admin",
  },
  {
    username: "edcleryton.silva@email.com",
    password: "Admin123456!",
    blocked: false,
    attempts: 0,
    role: "admin",
  },
  {
    username: "jorge.mercado@email.com",
    password: "Admin123456!",
    blocked: false,
    attempts: 0,
    role: "admin",
  },
  {
    username: "user@email.com",
    password: "User12345678!",
    blocked: false,
    attempts: 0,
    role: "user",
  },
  {
    username: "user2@email.com",
    password: "User12345678!",
    blocked: false,
    attempts: 0,
    role: "user",
  },
];

const initialUsers = [
  {
    username: "admin@email.com",
    password: "Admin123456!",
    blocked: false,
    attempts: 0,
    role: "admin",
  },
  {
    username: "edcleryton.silva@email.com",
    password: "Admin123456!",
    blocked: false,
    attempts: 0,
    role: "admin",
  },
  {
    username: "jorge.mercado@email.com",
    password: "Admin123456!",
    blocked: false,
    attempts: 0,
    role: "admin",
  },
  {
    username: "user@email.com",
    password: "User12345678!",
    blocked: false,
    attempts: 0,
    role: "user",
  },
  {
    username: "user2@email.com",
    password: "User12345678!",
    blocked: false,
    attempts: 0,
    role: "user",
  },
];

function findUser(username) {
  return users.find((u) => u.username === username);
}

function resetUsers() {
  users.length = 0;
  initialUsers.forEach((u) => users.push({ ...u }));
}

exports._reset = resetUsers;

exports.login = (username, password) => {
  const user = findUser(username);

  if (!user) return { status: "invalid" };
  if (user.blocked) return { status: "blocked" };
  if (user.password === password) {
    user.attempts = 0;
    return { status: "success", user };
  } else {
    user.attempts++;
    if (user.attempts >= 3) {
      user.blocked = true;
      return { status: "blocked" };
    }
    return { status: "invalid" };
  }
};

exports.register = (username, password) => {
  if (!username || !password) {
    return { status: "invalid" };
  }
  if (findUser(username)) {
    return { status: "exists" };
  }
  users.push({ username, password, blocked: false, attempts: 0, role: "user" });
  return { status: "created" };
};

exports.rememberPassword = (username) => {
  const user = findUser(username);

  if (!user) return { status: "not_found" };
  // Simula envio de instrução de recuperação
  return { status: "ok" };
};

exports.updatePassword = (username, newPassword) => {
  const user = findUser(username);
  if (!user) return { status: "not_found" };
  user.password = newPassword;
  return { status: "updated" };
};

exports.updateUserByAdmin = (targetUsername, newData) => {
  const user = findUser(targetUsername);
  if (!user) return { status: "not_found" };
  if (newData.username) user.username = newData.username;
  if (newData.password) user.password = newData.password;
  return { status: "updated" };
};

exports.deleteUser = (username) => {
  const idx = users.findIndex((u) => u.username === username);
  if (idx === -1) return { status: "not_found" };
  users.splice(idx, 1);
  return { status: "deleted" };
};

exports.getUser = findUser;

// Método auxiliar para testes
exports.__getUsers = () => users;

exports.getAllUsers = function () {
  return users;
};
