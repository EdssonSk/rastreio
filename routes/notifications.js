const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");

// Armazenamento em memória (ou conecte ao Supabase/banco)
const notificationsStore = {};

// Rota chamada pelo aplicativo Android (sem autenticação JWT, usa deviceId)
router.post("/save", (req, res) => {
  const { deviceId, app, sender, message, timestamp } = req.body;

  if (!deviceId || !message) {
    return res.status(400).json({ erro: "Dados incompletos" });
  }

  if (!notificationsStore[deviceId]) {
    notificationsStore[deviceId] = [];
  }

  notificationsStore[deviceId].unshift({
    app,
    sender,
    message,
    timestamp: timestamp || new Date().toISOString()
  });

  // Mantém apenas as últimas 100 notificações por dispositivo
  if (notificationsStore[deviceId].length > 100) {
    notificationsStore[deviceId].pop();
  }

  console.log(`📩 [${app}] ${sender}: ${message}`);
  return res.json({ status: "salvo" });
});

// Rota chamada pelo painel HTML (requer login)
router.get("/:deviceId", authMiddleware, (req, res) => {
  const { deviceId } = req.params;
  const lista = notificationsStore[deviceId] || [];
  return res.json(lista);
});

module.exports = router;