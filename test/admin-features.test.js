const request = require('supertest');
const express = require('express');
const userRoutes = require('../src/routes/userRoutes');
const userService = require('../src/services/userService');
const chai = require('chai');
const expect = chai.expect;
global.should = chai.should();

const app = express();
app.use(express.json());
app.use('/', userRoutes);

describe('Funcionalidades de Administrador', () => {
  let adminToken;
  let userToken;
  beforeEach(async () => {
    userService._reset && userService._reset();
    // Login como admin
    const respostaAdmin = await request(app)
      .post('/login')
      .send({ username: 'admin@email.com', password: 'Admin123456!' });
    adminToken = respostaAdmin.body.token;
    // Login como usuário comum
    const respostaUser = await request(app)
      .post('/login')
      .send({ username: 'user@email.com', password: 'User12345678!' });
    userToken = respostaUser.body.token;
  });

  it('Admin altera senha de outro usuário com sucesso', async () => {
    await request(app)
      .post('/register')
      .send({ username: 'admin-teste1@email.com', password: 'SenhaForte123!' });
    const resposta = await request(app)
      .patch('/admin/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'admin-teste1@email.com', password: 'NovaSenhaAdm123!' });
    resposta.status.should.equal(200);
    resposta.body.message.should.equal('Usuário atualizado com sucesso.');
  });

  it('Admin altera nome de outro usuário com sucesso', async () => {
    await request(app)
      .post('/register')
      .send({ username: 'admin-teste2@email.com', password: 'SenhaForte123!' });
    const resposta = await request(app)
      .patch('/admin/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'admin-teste2@email.com', newUsername: 'novo.admin-teste2@email.com' });
    resposta.status.should.equal(200);
    resposta.body.message.should.equal('Usuário atualizado com sucesso.');
    await request(app)
      .patch('/admin/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'novo.admin-teste2@email.com', newUsername: 'admin-teste2@email.com' });
  });

  it('Usuário comum não pode alterar outro usuário (token válido)', async () => {
    await request(app)
      .post('/register')
      .send({ username: 'admin-teste3@email.com', password: 'SenhaForte123!' });
    const respostaUser = await request(app)
      .post('/login')
      .send({ username: 'admin-teste3@email.com', password: 'SenhaForte123!' });
    const userToken = respostaUser.body.token;
    const resposta = await request(app)
      .patch('/admin/user')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ username: 'admin@email.com', password: 'Admin123456!' });
    resposta.status.should.equal(403);
    resposta.body.message.should.match(/Apenas administradores/);
  });

  it('Usuário comum não pode alterar outro usuário (token inválido)', async () => {
    const resposta = await request(app)
      .patch('/admin/user')
      .set('Authorization', 'Bearer tokeninvalido')
      .send({ username: 'admin@email.com', password: 'Senha123456!' });
    resposta.status.should.equal(403);
    resposta.body.message.should.equal('Token inválido.');
  });

  it('Usuário comum não pode alterar outro usuário (sem token)', async () => {
    const resposta = await request(app)
      .patch('/admin/user')
      .send({ username: 'admin@email.com', password: 'Senha123456!' });
    resposta.status.should.equal(401);
    resposta.body.message.should.equal('Token não fornecido.');
  });

  it('Admin deleta usuário com sucesso', async () => {
    await request(app)
      .post('/register')
      .send({ username: 'admin-teste4@email.com', password: 'SenhaForte123!' });
    const resposta = await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'admin-teste4@email.com' });
    resposta.status.should.equal(200);
    resposta.body.message.should.equal('Usuário deletado com sucesso.');
  });

  it('Usuário comum não pode deletar usuário (token válido)', async () => {
    await request(app)
      .post('/register')
      .send({ username: 'admin-teste5@email.com', password: 'SenhaForte123!' });
    const respostaUser = await request(app)
      .post('/login')
      .send({ username: 'admin-teste5@email.com', password: 'SenhaForte123!' });
    const userToken = respostaUser.body.token;
    const resposta = await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ username: 'admin@email.com' });
    resposta.status.should.equal(403);
    resposta.body.message.should.match(/Apenas administradores/);
  });

  it('Usuário comum não pode deletar usuário (token inválido)', async () => {
    const resposta = await request(app)
      .delete('/user')
      .set('Authorization', 'Bearer tokeninvalido')
      .send({ username: 'admin@email.com' });
    resposta.status.should.equal(403);
    resposta.body.message.should.equal('Token inválido.');
  });

  it('Usuário comum não pode deletar usuário (sem token)', async () => {
    const resposta = await request(app)
      .delete('/user')
      .send({ username: 'admin@email.com' });
    resposta.status.should.equal(401);
    resposta.body.message.should.equal('Token não fornecido.');
  });

  it('Admin tenta deletar usuário inexistente', async () => {
    const resposta = await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'naoexiste@email.com' });
    resposta.status.should.equal(404);
    resposta.body.message.should.equal('Usuário não encontrado.');
  });
}); 