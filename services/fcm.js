const { admin } = require("../config/firebase");

/**
 * Envia um comando de dados (data message) para um aparelho via FCM.
 * Data messages não mostram notificação — são processadas silenciosamente
 * pelo CommandFcmService do app Android.
 *
 * @param {string} token  - Token FCM do aparelho destino
 * @param {Object} data   - Par chave-valor a ser recebido pelo app
 * @returns {string}      - Message ID retornado pelo Firebase
 */
async function enviarComando(token, data) {
  // Todos os valores do payload FCM devem ser strings
  const payload = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, String(v)])
  );

  const message = {
    token,
    data: payload,
    android: {
      priority: "high",       // acorda o aparelho mesmo em modo Doze
      ttl: 60 * 1000,         // 60 segundos — se não entregar, descarta
    },
  };

  const messageId = await admin.messaging().send(message);
  return messageId;
}

module.exports = { enviarComando };
