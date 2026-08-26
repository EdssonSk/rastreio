const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

function initFirebase() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./firebase-service-account.json";
  const resolvedPath = path.resolve(serviceAccountPath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ Arquivo de credencial não encontrado em: ${resolvedPath}`);
    console.error("Certifique-se de que o 'firebase-service-account.json' está na raiz do backend.");
    return;
  }

  const serviceAccount = require(resolvedPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log("🔥 Firebase Admin SDK inicializado com sucesso");
}

module.exports = { initFirebase, admin };