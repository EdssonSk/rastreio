const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

const locations = new Map();

router.post("/update", (req, res) => {
  const { deviceId, lat, lng, accuracy, timestamp } = req.body;

  if (!deviceId || lat === undefined || lng === undefined) {
    return res.status(400).json({ erro: "deviceId, lat e lng são obrigatórios" });
  }

  const record = {
    lat: Number(lat),
    lng: Number(lng),
    accuracy: accuracy ? Number(accuracy) : null,
    timestamp: timestamp || new Date().toISOString()
  };

  locations.set(deviceId, record);
  console.log(`📍 Localização recebida [${deviceId}]: (${lat}, ${lng})`);
  res.json({ status: "localizacao_atualizada" });
});

router.get("/:deviceId", authMiddleware, (req, res) => {
  const { deviceId } = req.params;
  const loc = locations.get(deviceId);

  if (!loc) {
    return res.status(404).json({ erro: "Nenhuma localização registrada para este aparelho" });
  }

  res.json(loc);
});

module.exports = router;