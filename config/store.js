/**
 * Armazenamento dos tokens FCM dos aparelhos registrados.
 *
 * Para produção, troque por Firestore (o código alternativo está comentado
 * abaixo de cada função). O mapa em memória é perdido ao reiniciar o servidor.
 *
 * Estrutura: Map<deviceId, { token: string, registeredAt: Date, label: string }>
 */
const devices = new Map();

/** Registra ou atualiza o token FCM de um aparelho */
function upsertDevice(deviceId, token, label = "") {
  devices.set(deviceId, { token, label, registeredAt: new Date() });

  // ── Alternativa Firestore ──────────────────────────────────────────────────
  // const { admin } = require("./firebase");
  // await admin.firestore().collection("devices").doc(deviceId).set(
  //   { token, label, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
  //   { merge: true }
  // );
}

/** Retorna o token FCM pelo ID do aparelho */
function getDevice(deviceId) {
  return devices.get(deviceId) ?? null;
}

/** Lista todos os aparelhos registrados */
function listDevices() {
  return Array.from(devices.entries()).map(([id, data]) => ({ id, ...data }));
}

/** Remove um aparelho */
function removeDevice(deviceId) {
  devices.delete(deviceId);
}

module.exports = { upsertDevice, getDevice, listDevices, removeDevice };
