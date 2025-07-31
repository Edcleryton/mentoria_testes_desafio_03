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

describe("Alteração de senha do Usuário Comum", () => {
  beforeEach(() => {
    userService._reset && userService._reset();
  });

  it("Altera a senha com sucesso (200)", async () => {
    const login = await request(app)
      .post("/login")
      .send({ username: "user@email.com", password: "User12345678!" });
    const token = login.body.token;
    const res = await request(app)
      .patch("/user")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "NovaSenha12345!" });
    res.status.should.equal(200);
    res.body.message.should.equal("Usuário atualizado com sucesso.");
  });

  it("Falha ao alterar senha sem token (401)", async () => {
    const res = await request(app)
      .patch("/user")
      .send({ password: "NovaSenha12345!" });
    res.status.should.equal(401);
    res.body.message.should.equal("Token não fornecido.");
  });

  it("Falha ao alterar senha com token inválido (403)", async () => {
    const res = await request(app)
      .patch("/user")
      .set("Authorization", "Bearer tokeninvalido")
      .send({ password: "NovaSenha12345!" });
    res.status.should.equal(403);
    res.body.message.should.equal("Token inválido.");

  });

  it("Falha ao alterar senha fraca (400)", async () => {
    const login = await request(app)
      .post("/login")
      .send({ username: "user@email.com", password: "User12345678!" });
    const token = login.body.token;
    const res = await request(app)
      .patch("/user")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "fraca" });
    res.status.should.equal(400);
    res.body.message.should.match(/A senha deve ter entre 12 e 16 caracteres/);

  });

  it("Não permite GET em /user", async () => {
    const res = await request(app)
      .get("/user");
    expect([404, 405]).to.include(res.status);
  });

  it("Não permite POST em /user", async () => {
    const res = await request(app)
      .post("/user")
      .send({ password: "NovaSenha12345!" });
    expect([404, 405]).to.include(res.status);
  });

  it("Não permite DELETE em /user", async () => {
    const res = await request(app)
      .delete("/user")
      .send({ username: "user@email.com" });
    expect([404, 405]).to.include(res.status);
  });
});
