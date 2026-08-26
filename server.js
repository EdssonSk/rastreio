require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { initFirebase } = require("./config/firebase");

// ─── Inicializar Firebase Admin ───────────────────────────────────────────────
initFirebase();

// ─── Rotas ────────────────────────────────────────────────────────────────────
const authRoutes     = require("./routes/auth");
const deviceRoutes   = require("./routes/devices");
const commandRoutes  = require("./routes/commands");
const captureRoutes  = require("./routes/captures");
const locationRoutes = require("./routes/location");

// ─── App Express ──────────────────────────────────────────────────────────────
const app = express();

app.use(cors());
app.use(express.json());

// Health check — útil para monitoramento e deploy
app.get("/", (_, res) =>
  res.json({ servico: "Device Guardian Backend", status: "online" })
);

app.use("/auth",     authRoutes);
app.use("/devices",  deviceRoutes);
app.use("/commands", commandRoutes);
app.use("/captures", captureRoutes);
app.use("/location", locationRoutes);

// Handler de erros genérico
app.use((err, req, res, _next) => {
  console.error("Erro interno:", err.message);
  res.status(500).json({ erro: "Erro interno do servidor" });
});

// ─── Iniciar servidor ─────────────────────────────────────────────────────────
const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`🚀  Device Guardian Backend rodando em http://localhost:${PORT}`);
  console.log("─".repeat(55));
  console.log("  POST  /auth/login             → obter token JWT");
  console.log("  POST  /devices/register       → registrar aparelho (app Android)");
  console.log("  GET   /devices                → listar aparelhos  [auth]");
  console.log("  POST  /commands/send          → enviar comando    [auth]");
  console.log("  POST  /location/update        → atualizar GPS (app Android)");
  console.log("  GET   /location/:deviceId     → ler localização   [auth]");
  console.log("  GET   /captures               → listar capturas   [auth]");
  console.log("  DELETE /captures/:arquivo     → deletar captura   [auth]");
  console.log("─".repeat(55));
});
