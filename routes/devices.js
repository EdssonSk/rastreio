const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

// Armazenamento em memória dos aparelhos conectados
const devices = new Map();

// Registrar aparelho (chamado pelo app Android)
router.post("/register", (req, res) => {
  const { deviceId, token, label } = req.body;

  if (!deviceId || !token) {
    return res.status(400).json({ erro: "deviceId e token são obrigatórios" });
  }

  devices.set(deviceId, {
    deviceId,
    token,
    label: label || "Dispositivo Android",
    updatedAt: new Date().toISOString()
  });

  console.log(`📱 Dispositivo registrado: ${deviceId} (${label || "Android"})`);
  res.json({ status: "registrado", deviceId });
});

// Listar aparelhos (Rota protegida)
router.get("/", authMiddleware, (req, res) => {
  res.json(Array.from(devices.values()));
});

// Deletar aparelho (Rota protegida)
router.delete("/:deviceId", authMiddleware, (req, res) => {
  const { deviceId } = req.params;
  if (devices.delete(deviceId)) {
    return res.json({ status: "removido", deviceId });
  }
  res.status(404).json({ erro: "Aparelho não encontrado" });
});

module.exports = router;
module.exports.devices = devices;