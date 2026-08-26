const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const router = express.Router();

/** Limita 10 tentativas de login por IP a cada 15 minutos */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { erro: "Muitas tentativas de login. Tente novamente em 15 minutos." },
});

/**
 * POST /auth/login
 * Body: { "senha": "sua-senha" }
 * Retorna: { "token": "<JWT válido por 12h>" }
 *
 * Só existe um dono — a senha fica na variável de ambiente OWNER_PASSWORD.
 */
router.post("/login", loginLimiter, async (req, res) => {
  const { senha } = req.body ?? {};

  if (!senha) {
    return res.status(400).json({ erro: "Campo 'senha' obrigatório" });
  }

  // Suporte a senha em texto puro (dev) ou hash bcrypt (produção).
  // Para gerar o hash: node -e "console.log(require('bcryptjs').hashSync('sua-senha', 10))"
  const senhaEnv = process.env.OWNER_PASSWORD ?? "";
  const senhaValida = senhaEnv.startsWith("$2")
    ? await bcrypt.compare(senha, senhaEnv)
    : senha === senhaEnv;

  if (!senhaValida) {
    return res.status(401).json({ erro: "Senha incorreta" });
  }

  const token = jwt.sign({ role: "owner" }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });

  res.json({ token, expiresIn: "12h" });
});

module.exports = router;
