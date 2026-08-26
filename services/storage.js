const { admin } = require("../config/firebase");

const PACKAGE_ID = "com.edson.deviceguardian";

/**
 * Lista todos os arquivos de captura do aparelho no Firebase Storage.
 * Retorna URLs assinadas (válidas por 1 hora) para acesso direto.
 *
 * @param {"foto"|"audio"|"todos"} tipo - Filtra por extensão
 * @returns {Array<{ nome, tipo, url, tamanho, criadoEm }>}
 */
async function listarCapturas(tipo = "todos") {
  const bucket = admin.storage().bucket();
  const prefix = `capturas/${PACKAGE_ID}/`;

  const [arquivos] = await bucket.getFiles({ prefix });

  const filtrados = arquivos.filter((f) => {
    if (tipo === "foto")  return f.name.endsWith(".jpg");
    if (tipo === "audio") return f.name.endsWith(".m4a");
    return true;
  });

  const capturas = await Promise.all(
    filtrados.map(async (arquivo) => {
      const [meta] = await arquivo.getMetadata();
      const [url] = await arquivo.getSignedUrl({
        action: "read",
        expires: Date.now() + 60 * 60 * 1000, // 1 hora
      });

      const nome = arquivo.name.split("/").pop();
      return {
        nome,
        tipo: nome.endsWith(".jpg") ? "foto" : "audio",
        url,
        tamanhoBytes: Number(meta.size),
        criadoEm: meta.timeCreated,
      };
    })
  );

  // Mais recente primeiro
  return capturas.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
}

/**
 * Deleta um arquivo de captura pelo nome do arquivo.
 */
async function deletarCaptura(nomeArquivo) {
  const bucket = admin.storage().bucket();
  await bucket.file(`capturas/${PACKAGE_ID}/${nomeArquivo}`).delete();
}

module.exports = { listarCapturas, deletarCaptura };
