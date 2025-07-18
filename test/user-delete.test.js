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

describe('DELETE /user (admin e permissões)', () => {
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

  it('Admin deleta usuário com sucesso', async () => {
    // Garante que o usuário existe
    await request(app)
      .post('/register')
      .send({ username: 'novo@email.com', password: 'SenhaForte123!' });
    const resposta = await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'novo@email.com' });
    expect(resposta.status).to.equal(200);
    expect(resposta.body.message).to.equal('Usuário deletado com sucesso.');
  });

  it('Admin tenta deletar usuário inexistente', async () => {
    const resposta = await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'naoexiste@email.com' });
    expect(resposta.status).to.equal(404);
    expect(resposta.body.message).to.equal('Usuário não encontrado.');
  });

  it('Usuário comum não pode deletar usuário', async () => {
    const resposta = await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ username: 'admin@email.com' });
    expect(resposta.status).to.equal(403);
    expect(resposta.body.message).to.match(/Apenas administradores/);
  });

  it('Falha ao deletar usuário com token inválido', async () => {
    const resposta = await request(app)
      .delete('/user')
      .set('Authorization', 'Bearer tokeninvalido')
      .send({ username: 'admin@email.com' });
    expect(resposta.status).to.equal(403);
    expect(resposta.body.message).to.equal('Token inválido.');
  });

  it('Falha ao deletar usuário sem token', async () => {
    const resposta = await request(app)
      .delete('/user')
      .send({ username: 'admin@email.com' });
    expect(resposta.status).to.equal(401);
    expect(resposta.body.message).to.equal('Token não fornecido.');
  });

  it('Falha ao deletar usuário sem informar username', async () => {
    const resposta = await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(resposta.status).to.equal(400);
    expect(resposta.body.message).to.match(/Username do usuário a ser deletado é obrigatório/);
  });
}); 