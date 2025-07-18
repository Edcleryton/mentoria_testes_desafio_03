const request = require("supertest");
const express = require("express");
const userRoutes = require("../src/routes/userRoutes");
const userService = require("../src/services/userService");
const chai = require("chai");
const expect = chai.expect;
global.should = chai.should();

const app = express();
app.use(express.json());
app.use("/", userRoutes);

describe("DELETE /admin/user (admin e permissões)", () => {
  let adminToken;
  let userToken;
  beforeEach(async () => {
    userService._reset && userService._reset();
    // Login como admin
    const resAdmin = await request(app)
      .post("/login")
      .send({ username: "admin@email.com", password: "Admin123456!" });
    adminToken = resAdmin.body.token;
    // Login como usuário comum
    const resUser = await request(app)
      .post("/login")
      .send({ username: "user@email.com", password: "User12345678!" });
    userToken = resUser.body.token;
  });

  it("Admin deleta usuário com sucesso", async () => {
    // Garante que o usuário existe
    await request(app)
      .post("/register")
      .send({ username: "novo@email.com", password: "SenhaForte123!" });
    const res = await request(app)
      .delete("/admin/user")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ username: "novo@email.com" });
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Usuário deletado com sucesso.");
  });

  it("Admin tenta deletar usuário inexistente", async () => {
    const res = await request(app)
      .delete("/admin/user")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ username: "naoexiste@email.com" });
    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal("Usuário não encontrado.");
  });

  it("Usuário comum não pode deletar usuário", async () => {
    const res = await request(app)
      .delete("/admin/user")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ username: "admin@email.com" });
    expect(res.status).to.equal(403);
    expect(res.body.message).to.match(/Apenas administradores/);
  });

  it("Falha ao deletar usuário com token inválido", async () => {
    const res = await request(app)
      .delete("/admin/user")
      .set("Authorization", "Bearer tokeninvalido")
      .send({ username: "admin@email.com" });
    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal("Token inválido.");
  });

  it("Falha ao deletar usuário sem token", async () => {
    const res = await request(app)
      .delete("/admin/user")
      .send({ username: "admin@email.com" });
    expect(res.status).to.equal(401);
    expect(res.body.message).to.equal("Token não fornecido.");
  });

  it("Falha ao deletar usuário sem informar username", async () => {
    const res = await request(app)
      .delete("/admin/user")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});
    expect(res.status).to.equal(400);
    expect(res.body.message).to.match(
      /Username do usuário a ser deletado é obrigatório/,
    );
  });
});
