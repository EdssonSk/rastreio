const express = require("express");
const router = express.Router();
const { admin } = require("../config/firebase");
const authMiddleware = require("../middleware/auth");
const { devices } = require("./devices");

router.post("/send", authMiddleware, async (req, res) => {
  const { deviceId, comando, duracao } = req.body;

  if (!deviceId || !comando) {
    return res.status(400).json({ erro: "deviceId e comando são obrigatórios" });
  }

  const device = devices.get(deviceId);
  if (!device || !device.token) {
    return res.status(404).json({ erro: "Aparelho não encontrado ou sem token FCM registrado" });
  }

  const message = {
    token: device.token,
    data: {
      comando: String(comando),
      duracao: duracao ? String(duracao) : "10",
      timestamp: new Date().toISOString()
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(`📡 Comando '${comando}' enviado para ${deviceId} -> FCM ID: ${response}`);
    res.json({ status: "enviado", comando, messageId: response });
  } catch (error) {
    console.error("Erro ao enviar comando FCM:", error.message);
    res.status(500).json({ erro: "Falha ao enviar mensagem FCM", detalhe: error.message });
  }
});

module.exports = router;