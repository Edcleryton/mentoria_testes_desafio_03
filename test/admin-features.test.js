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