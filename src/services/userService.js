const bcrypt = require('bcryptjs');

// Hashes computados uma única vez no carregamento do módulo
const HASH_ADMIN = bcrypt.hashSync('Admin123456!', 10);
const HASH_USER = bcrypt.hashSync('User12345678!', 10);

const INITIAL_SNAPSHOT = [
	{ username: 'admin@email.com', password: HASH_ADMIN, blocked: false, attempts: 0, role: 'admin' },
	{ username: 'edcleryton.silva@email.com', password: HASH_ADMIN, blocked: false, attempts: 0, role: 'admin' },
	{ username: 'jorge.mercado@email.com', password: HASH_ADMIN, blocked: false, attempts: 0, role: 'admin' },
	{ username: 'user@email.com', password: HASH_USER, blocked: false, attempts: 0, role: 'user' },
	{ username: 'user2@email.com', password: HASH_USER, blocked: false, attempts: 0, role: 'user' },
];

let users = INITIAL_SNAPSHOT.map((u) => ({ ...u }));

function findUser(username) {
	return users.find((u) => u.username === username);
}

function resetUsers() {
	users.length = 0;
	INITIAL_SNAPSHOT.forEach((u) => users.push({ ...u }));
}

exports._reset = resetUsers;

exports.login = (username, password) => {
	const user = findUser(username);

	if (!user) return { status: 'invalid' };
	if (user.blocked) return { status: 'blocked' };
	if (bcrypt.compareSync(password, user.password)) {
		user.attempts = 0;
		return { status: 'success', user };
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
	users.push({ username, password: bcrypt.hashSync(password, 10), blocked: false, attempts: 0, role: 'user' });
	return { status: 'created' };
};

exports.rememberPassword = (username) => {
	const user = findUser(username);
	if (!user) return { status: 'not_found' };
	return { status: 'ok' };
};

exports.updatePassword = (username, newPassword) => {
	const user = findUser(username);
	if (!user) return { status: 'not_found' };
	user.password = bcrypt.hashSync(newPassword, 10);
	return { status: 'updated' };
};

exports.updateUserByAdmin = (targetUsername, newData) => {
	const user = findUser(targetUsername);
	if (!user) return { status: 'not_found' };
	if (newData.username) user.username = newData.username;
	if (newData.password) user.password = bcrypt.hashSync(newData.password, 10);
	if (typeof newData.blocked === 'boolean') user.blocked = newData.blocked;
	return { status: 'updated' };
};

exports.deleteUser = (username) => {
	const idx = users.findIndex((u) => u.username === username);
	if (idx === -1) return { status: 'not_found' };
	users.splice(idx, 1);
	return { status: 'deleted' };
};

exports.getUser = findUser;

exports.__getUsers = () => users;

exports.getAllUsers = function () {
	return users;
};
