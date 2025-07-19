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

describe("Funcionalidades de Usuário Comum", () => {
  beforeEach(() => {
    userService._reset && userService._reset();
  });

  it("Login com sucesso (200)", async () => {
    // Garante que o usuário existe após o reset
    await request(app)
      .post("/register")
      .send({ username: "user@email.com", password: "User12345678!" });
    const res = await request(app)
      .post("/login")
      .send({ username: "user@email.com", password: "User12345678!" });
    res.status.should.equal(200);
    res.body.message.should.equal(
      "Login realizado com sucesso. Sessão criada.",
    );
  });

  it("Login inválido (401)", async () => {
    const res = await request(app)
      .post("/login")
      .send({ username: "user@email.com", password: "errada" });
    res.status.should.equal(401);
    res.body.message.should.equal("Usuário ou senha inválidos.");
  });

  it("Cadastro com sucesso (201)", async () => {
    const res = await request(app)
      .post("/register")
      .send({ username: "novo@email.com", password: "SenhaForte123!" });
    res.status.should.equal(201);
    res.body.message.should.equal("Usuário cadastrado com sucesso.");
  });

  it("Cadastro com email já existente (400)", async () => {
    await request(app)
      .post("/register")
      .send({ username: "existente@email.com", password: "SenhaForte123!" });
    const res = await request(app)
      .post("/register")
      .send({ username: "existente@email.com", password: "SenhaForte123!" });
    res.status.should.equal(400);
    res.body.message.should.match(/já existe/i);
  });

  it("Cadastro com senha fraca (400)", async () => {
    const res = await request(app)
      .post("/register")
      .send({ username: "fraco@email.com", password: "123" });
    res.status.should.equal(400);
    res.body.message.should.match(/senha/i);

  });

  it("Não permite GET em /register", async () => {
    const res = await request(app)
      .get("/register");
    expect([404, 405]).to.include(res.status);
  });

  it("Não permite PUT em /register", async () => {
    const res = await request(app)
      .put("/register")
      .send({ username: "alguem@email.com", password: "SenhaForte123!" });
    expect([404, 405]).to.include(res.status);
  });

  it("Não permite DELETE em /register", async () => {
    const res = await request(app)
      .delete("/register")
      .send({ username: "alguem@email.com" });
    expect([404, 405]).to.include(res.status);
  });

  it("Não permite GET em /login", async () => {
    const res = await request(app)
      .get("/login");
    expect([404, 405]).to.include(res.status);
  });

  it("Não permite PUT em /login", async () => {
    const res = await request(app)
      .put("/login")
      .send({ username: "alguem@email.com", password: "SenhaForte123!" });
    expect([404, 405]).to.include(res.status);
  });

  it("Não permite DELETE em /login", async () => {
    const res = await request(app)
      .delete("/login")
      .send({ username: "alguem@email.com" });
    expect([404, 405]).to.include(res.status);
  });
});
