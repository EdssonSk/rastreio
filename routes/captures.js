const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const authMiddleware = require("../middleware/auth");

// Listar capturas
router.get("/", authMiddleware, async (req, res) => {
  const { tipo } = req.query;
  const pasta = tipo ? `${tipo}s` : "";

  try {
    const { data, error } = await supabase.storage
      .from("captures")
      .list(pasta, { sortBy: { column: "created_at", order: "desc" } });

    if (error) {
      return res.json([]);
    }

    const captures = (data || [])
      .filter((file) => file.name !== ".emptyFolderPlaceholder")
      .map((file) => {
        const caminho = pasta ? `${pasta}/${file.name}` : file.name;
        const { data: publicUrlData } = supabase.storage
          .from("captures")
          .getPublicUrl(caminho);

        return {
          nome: file.name,
          tamanho: file.metadata?.size ?? 0,
          criadoEm: file.created_at,
          url: publicUrlData.publicUrl
        };
      });

    res.json(captures);
  } catch (err) {
    res.json([]);
  }
});

// Deletar captura
router.delete("/:caminhoArquivo", authMiddleware, async (req, res) => {
  const caminhoArquivo = decodeURIComponent(req.params.caminhoArquivo);

  try {
    const { error } = await supabase.storage
      .from("captures")
      .remove([caminhoArquivo]);

    if (error) throw error;

    res.json({ status: "deletado", arquivo: caminhoArquivo });
  } catch (err) {
    res.status(500).json({ erro: "Falha ao excluir arquivo", detalhe: err.message });
  }
});

module.exports = router;