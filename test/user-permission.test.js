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

describe("Permissões de Usuário Comum", () => {
  let userToken;
  beforeEach(async () => {
    userService._reset && userService._reset();
    // Login como usuário comum
    const resUser = await request(app)
      .post("/login")
      .send({ username: "user@email.com", password: "User12345678!" });
    userToken = resUser.body.token;
  });

  it("Usuário comum não pode acessar lista de usuários de admin", async () => {
    const res = await request(app)
      .get("/admin/users")
      .set("Authorization", `Bearer ${userToken}`);
    res.status.should.equal(403);
    res.body.message.should.match(/Apenas administradores/);
  });

  it("Usuário comum não pode alterar outro usuário", async () => {
    const res = await request(app)
      .patch("/admin/user")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ username: "admin@email.com", password: "Admin123456!" });
    res.status.should.equal(403);
    res.body.message.should.match(/Apenas administradores/);
  });

  it("Usuário comum não pode deletar outro usuário", async () => {
    const res = await request(app)
      .delete("/admin/user")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ username: "admin@email.com" });
    res.status.should.equal(403);
    res.body.message.should.match(/Apenas administradores/);
  });

  it("Usuário comum não pode acessar endpoints de admin sem token", async () => {
    const res = await request(app)
      .get("/admin/users");
    res.status.should.equal(401);
    res.body.message.should.match(/Token não fornecido/);
  });
});
