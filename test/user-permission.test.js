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

describe("Permissão de Usuário Comum em Endpoints de Admin", () => {
  beforeEach(() => {
    userService._reset && userService._reset();
  });

  it("Usuário comum não pode alterar outro usuário (token válido)", async () => {
    // Garante que o usuário existe e o token é válido
    await request(app)
      .post("/register")
      .send({ username: "user@email.com", password: "User12345678!" });
    const resUser = await request(app)
      .post("/login")
      .send({ username: "user@email.com", password: "User12345678!" });
    const userToken = resUser.body.token;
    const res = await request(app)
      .patch("/admin/user")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ username: "admin@email.com", password: "Senha123456!" });
    res.status.should.equal(403);
    res.body.message.should.match(/Apenas administradores/);
  });

  it("Usuário comum não pode alterar outro usuário (token inválido)", async () => {
    const res = await request(app)
      .patch("/admin/user")
      .set("Authorization", "Bearer tokeninvalido")
      .send({ username: "admin@email.com", password: "Senha123456!" });
    res.status.should.equal(403);
    res.body.message.should.equal("Token inválido.");
  });

  it("Usuário comum não pode alterar outro usuário (sem token)", async () => {
    const res = await request(app)
      .patch("/admin/user")
      .send({ username: "admin@email.com", password: "Senha123456!" });
    res.status.should.equal(401);
    res.body.message.should.equal("Token não fornecido.");
  });

  it("Usuário comum não pode deletar usuário (token válido)", async () => {
    const resUser = await request(app)
      .post("/login")
      .send({ username: "user@email.com", password: "User12345678!" });
    const userToken = resUser.body.token;
    const res = await request(app)
      .delete("/user")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ username: "admin@email.com" });
    res.status.should.equal(403);
    res.body.message.should.match(/Apenas administradores/);
  });

  it("Usuário comum não pode deletar usuário (token inválido)", async () => {
    const res = await request(app)
      .delete("/user")
      .set("Authorization", "Bearer tokeninvalido")
      .send({ username: "admin@email.com" });
    res.status.should.equal(403);
    res.body.message.should.equal("Token inválido.");
  });

  it("Usuário comum não pode deletar usuário (sem token)", async () => {
    const res = await request(app)
      .delete("/user")
      .send({ username: "admin@email.com" });
    res.status.should.equal(401);
    res.body.message.should.equal("Token não fornecido.");
  });
});
