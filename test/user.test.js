const request = require('supertest');
const express = require('express');
const userRoutes = require('../src/routes/userRoutes');
const userService = require('../src/services/userService');

const app = express();
app.use(express.json());
app.use('/', userRoutes);

describe('API Login de Usuários', () => {
  beforeEach(() => {
    userService._reset && userService._reset();
  });

  it('Login com sucesso (201)', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'admin@email.com', password: 'Admin123456!' });
    res.status.should.equal(201);
    res.body.message.should.equal('Login realizado com sucesso. Sessão criada.');
  });

  it('Login inválido (401)', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'errada' });
    res.status.should.equal(401);
    res.body.message.should.equal('Usuário ou senha inválidos.');
  });

  it('Bloquear senha após 3 tentativas (429)', async () => {
    for (let i = 0; i <= 2; i++) {
      await request(app)
        .post('/login')
        .send({ username: 'user@email.com', password: 'errada' });
    }
    const res = await request(app)
      .post('/login')
      .send({ username: 'user@email.com', password: 'errada' });
    res.status.should.equal(429);
    res.body.message.should.equal('Usuário bloqueado por excesso de tentativas.');
  });

  it('Lembrar senha (201)', async () => {
    const res = await request(app)
      .post('/remember-password')
      .send({ username: 'admin@email.com' });
    res.status.should.equal(201);
    res.body.message.should.equal('Instruções de recuperação enviadas. Solicitação criada.');
  });

  it('Lembrar senha para usuário inexistente (404)', async () => {
    const res = await request(app)
      .post('/remember-password')
      .send({ username: 'naoexiste' });
    res.status.should.equal(404);
    res.body.message.should.equal('Usuário não encontrado.');
  });

  it('Login com usuário proibido (403)', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'forbidden', password: 'qualquer' });
    res.status.should.equal(403);
    res.body.message.should.equal('Usuário não tem permissão para acessar este recurso.');
  });

  it('Lembrar senha com usuário proibido (403)', async () => {
    const res = await request(app)
      .post('/remember-password')
      .send({ username: 'forbidden' });
    res.status.should.equal(403);
    res.body.message.should.equal('Usuário não tem permissão para solicitar recuperação de senha.');
  });

  it('Login com resposta parcial (203)', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'partial', password: 'qualquer' });
    res.status.should.equal(203);
    res.body.message.should.equal('Login realizado, mas informações parciais retornadas.');
  });

  it('Lembrar senha com resposta parcial (203)', async () => {
    const res = await request(app)
      .post('/remember-password')
      .send({ username: 'partial' });
    res.status.should.equal(203);
    res.body.message.should.equal('Solicitação processada, mas informações parciais retornadas.');
  });

  it('Login com campos obrigatórios ausentes (400)', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'admin' });
    res.status.should.equal(400);
    res.body.message.should.equal('Username e senha são obrigatórios.');
  });

  it('Lembrar senha com campo obrigatório ausente (400)', async () => {
    const res = await request(app)
      .post('/remember-password')
      .send({});
    res.status.should.equal(400);
    res.body.message.should.equal('Username é obrigatório.');
  });
});

// Bloco de testes de alteração de senha do usuário comum

describe('Alteração de senha do Usuário Comum', () => {
  beforeEach(() => {
    userService._reset && userService._reset();
  });

  it('Altera a senha com sucesso (200)', async () => {
    const login = await request(app)
      .post('/login')
      .send({ username: 'user@email.com', password: 'User12345678!' });
    const token = login.body.token;
    const res = await request(app)
      .patch('/user')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'NovaSenha12345!' });
    res.status.should.equal(200);
    res.body.message.should.equal('Usuário atualizado com sucesso.');
  });

  it('Falha ao alterar senha sem token (401)', async () => {
    const res = await request(app)
      .patch('/user')
      .send({ password: 'NovaSenha12345!' });
    res.status.should.equal(401);
    res.body.message.should.equal('Token não fornecido.');
  });

  it('Falha ao alterar senha com token inválido (403)', async () => {
    const res = await request(app)
      .patch('/user')
      .set('Authorization', 'Bearer tokeninvalido')
      .send({ password: 'NovaSenha12345!' });
    res.status.should.equal(403);
    res.body.message.should.equal('Token inválido.');
  });

  it('Falha ao alterar senha fraca (400)', async () => {
    const login = await request(app)
      .post('/login')
      .send({ username: 'user@email.com', password: 'User12345678!' });
    const token = login.body.token;
    const res = await request(app)
      .patch('/user')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'fraca' });
    res.status.should.equal(400);
    res.body.message.should.match(/A senha deve ter entre 12 e 16 caracteres/);
  });
});

// Bloco de testes de permissão de usuário comum em endpoints de admin

describe('Permissão de Usuário Comum em Endpoints de Admin', () => {
  beforeEach(() => {
    userService._reset && userService._reset();
  });

  it('Usuário comum não pode alterar outro usuário (token válido)', async () => {
    // Garante que o usuário existe e o token é válido
    await request(app)
      .post('/register')
      .send({ username: 'user@email.com', password: 'User12345678!' });
    const resUser = await request(app)
      .post('/login')
      .send({ username: 'user@email.com', password: 'User12345678!' });
    const userToken = resUser.body.token;
    const res = await request(app)
      .patch('/admin/user')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ username: 'admin@email.com', password: 'Senha123456!' });
    res.status.should.equal(403);
    res.body.message.should.match(/Apenas administradores/);
  });

  it('Usuário comum não pode alterar outro usuário (token inválido)', async () => {
    const res = await request(app)
      .patch('/admin/user')
      .set('Authorization', 'Bearer tokeninvalido')
      .send({ username: 'admin@email.com', password: 'Senha123456!' });
    res.status.should.equal(403);
    res.body.message.should.equal('Token inválido.');
  });

  it('Usuário comum não pode alterar outro usuário (sem token)', async () => {
    const res = await request(app)
      .patch('/admin/user')
      .send({ username: 'admin@email.com', password: 'Senha123456!' });
    res.status.should.equal(401);
    res.body.message.should.equal('Token não fornecido.');
  });

  it('Usuário comum não pode deletar usuário (token válido)', async () => {
    const resUser = await request(app)
      .post('/login')
      .send({ username: 'user@email.com', password: 'User12345678!' });
    const userToken = resUser.body.token;
    const res = await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ username: 'admin@email.com' });
    res.status.should.equal(403);
    res.body.message.should.match(/Apenas administradores/);
  });

  it('Usuário comum não pode deletar usuário (token inválido)', async () => {
    const res = await request(app)
      .delete('/user')
      .set('Authorization', 'Bearer tokeninvalido')
      .send({ username: 'admin@email.com' });
    res.status.should.equal(403);
    res.body.message.should.equal('Token inválido.');
  });

  it('Usuário comum não pode deletar usuário (sem token)', async () => {
    const res = await request(app)
      .delete('/user')
      .send({ username: 'admin@email.com' });
    res.status.should.equal(401);
    res.body.message.should.equal('Token não fornecido.');
  });
});

// Bloco de testes de funcionalidades de usuário comum

describe('Funcionalidades de Usuário Comum', () => {
  beforeEach(() => {
    userService._reset && userService._reset();
  });

  it('Login com sucesso (201)', async () => {
    // Garante que o usuário existe após o reset
    await request(app)
      .post('/register')
      .send({ username: 'user@email.com', password: 'User12345678!' });
    const res = await request(app)
      .post('/login')
      .send({ username: 'user@email.com', password: 'User12345678!' });
    res.status.should.equal(201);
    res.body.message.should.equal('Login realizado com sucesso. Sessão criada.');
  });

  it('Login inválido (401)', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'user@email.com', password: 'errada' });
    res.status.should.equal(401);
    res.body.message.should.equal('Usuário ou senha inválidos.');
  });

  it('Cadastro com sucesso (201)', async () => {
    const res = await request(app)
      .post('/register')
      .send({ username: 'novo@email.com', password: 'SenhaForte123!' });
    res.status.should.equal(201);
    res.body.message.should.equal('Usuário cadastrado com sucesso.');
  });

  it('Cadastro com email já existente (400)', async () => {
    await request(app)
      .post('/register')
      .send({ username: 'existente@email.com', password: 'SenhaForte123!' });
    const res = await request(app)
      .post('/register')
      .send({ username: 'existente@email.com', password: 'SenhaForte123!' });
    res.status.should.equal(400);
    res.body.message.should.match(/já existe/i);
  });

  it('Cadastro com senha fraca (400)', async () => {
    const res = await request(app)
      .post('/register')
      .send({ username: 'fraco@email.com', password: '123' });
    res.status.should.equal(400);
    res.body.message.should.match(/senha/i);
  });
});

// Bloco de testes de funcionalidades de administrador

describe('Funcionalidades de Administrador', () => {
  let adminToken;
  let userToken;
  beforeEach(async () => {
    userService._reset && userService._reset();
    // Login como admin
    const resAdmin = await request(app)
      .post('/login')
      .send({ username: 'admin@email.com', password: 'Admin123456!' });
    adminToken = resAdmin.body.token;
    // Login como usuário comum
    const resUser = await request(app)
      .post('/login')
      .send({ username: 'user@email.com', password: 'User12345678!' });
    userToken = resUser.body.token;
  });

  it('Admin altera senha de outro usuário com sucesso', async () => {
    await request(app)
      .patch('/admin/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'user@email.com', newUsername: 'user@email.com' });
    const res = await request(app)
      .patch('/admin/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'user@email.com', password: 'NovaSenhaAdm123!' });
    res.status.should.equal(200);
    res.body.message.should.equal('Usuário atualizado com sucesso.');
  });

  it('Admin altera nome de outro usuário com sucesso', async () => {
    await request(app)
      .patch('/admin/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'user@email.com', newUsername: 'user@email.com' });
    const res = await request(app)
      .patch('/admin/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'user@email.com', newUsername: 'novo.user@email.com' });
    res.status.should.equal(200);
    res.body.message.should.equal('Usuário atualizado com sucesso.');
    await request(app)
      .patch('/admin/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'novo.user@email.com', newUsername: 'user@email.com' });
  });

  it('Usuário comum não pode alterar outro usuário (token válido)', async () => {
    // Gera token válido do usuário comum imediatamente antes do teste
    const resUser = await request(app)
      .post('/login')
      .send({ username: 'user@email.com', password: 'User12345678!' });
    const userToken = resUser.body.token;
    const res = await request(app)
      .patch('/admin/user')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ username: 'admin@email.com', password: 'Senha123456!' });
    res.status.should.equal(403);
    res.body.message.should.match(/Apenas administradores/);
  });

  it('Usuário comum não pode alterar outro usuário (token inválido)', async () => {
    const res = await request(app)
      .patch('/admin/user')
      .set('Authorization', 'Bearer tokeninvalido')
      .send({ username: 'admin@email.com', password: 'Senha123456!' });
    res.status.should.equal(403);
    res.body.message.should.equal('Token inválido.');
  });

  it('Usuário comum não pode alterar outro usuário (sem token)', async () => {
    const res = await request(app)
      .patch('/admin/user')
      .send({ username: 'admin@email.com', password: 'Senha123456!' });
    res.status.should.equal(401);
    res.body.message.should.equal('Token não fornecido.');
  });

  it('Admin deleta usuário com sucesso', async () => {
    await request(app)
      .patch('/admin/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'user@email.com', newUsername: 'user@email.com' });
    const res = await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'user@email.com' });
    res.status.should.equal(200);
    res.body.message.should.equal('Usuário deletado com sucesso.');
  });

  it('Usuário comum não pode deletar usuário (token válido)', async () => {
    // Gera token válido do usuário comum imediatamente antes do teste
    const resUser = await request(app)
      .post('/login')
      .send({ username: 'user@email.com', password: 'User12345678!' });
    const userToken = resUser.body.token;
    const res = await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ username: 'admin@email.com' });
    res.status.should.equal(403);
    res.body.message.should.match(/Apenas administradores/);
  });

  it('Usuário comum não pode deletar usuário (token inválido)', async () => {
    const res = await request(app)
      .delete('/user')
      .set('Authorization', 'Bearer tokeninvalido')
      .send({ username: 'admin@email.com' });
    res.status.should.equal(403);
    res.body.message.should.equal('Token inválido.');
  });

  it('Usuário comum não pode deletar usuário (sem token)', async () => {
    const res = await request(app)
      .delete('/user')
      .send({ username: 'admin@email.com' });
    res.status.should.equal(401);
    res.body.message.should.equal('Token não fornecido.');
  });

  it('Admin tenta deletar usuário inexistente', async () => {
    const res = await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'naoexiste@email.com' });
    res.status.should.equal(404);
    res.body.message.should.equal('Usuário não encontrado.');
  });
});

const chai = require('chai');
global.should = chai.should();

userService._reset = function() {
  const users = require('../src/services/userService').__getUsers && require('../src/services/userService').__getUsers();
  if (users) {
    users.forEach(u => {
      u.attempts = 0;
      u.blocked = false;
    });
  }
}; 