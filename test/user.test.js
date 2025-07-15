const request = require('supertest');
const express = require('express');
const userRoutes = require('../routes/userRoutes');
const userService = require('../services/userService');


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
      .send({ username: 'admin', password: '123456' });
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
    for (let i = 0; i < 2; i++) {
      await request(app)
        .post('/login')
        .send({ username: 'user', password: 'errada' });
    }
    const res = await request(app)
      .post('/login')
      .send({ username: 'user', password: 'errada' });
    res.status.should.equal(429);
    res.body.message.should.equal('Usuário bloqueado por excesso de tentativas.');
  });

  it('Lembrar senha (201)', async () => {
    const res = await request(app)
      .post('/remember-password')
      .send({ username: 'admin' });
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

const chai = require('chai');
global.should = chai.should();

userService._reset = function() {
  const users = require('../services/userService').__getUsers && require('../services/userService').__getUsers();
  if (users) {
    users.forEach(u => {
      u.attempts = 0;
      u.blocked = false;
    });
  }
}; 