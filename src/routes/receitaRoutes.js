import express from 'express';
import multer from 'multer';
import ReceitaController from '../controllers/receitaController.js';

const router = express.Router();

// Configuração do Multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Middleware para processar form-data
const processFormData = (req, res, next) => {
    upload.array('files', 8)(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                message: 'Erro no upload',
                detail: err.message
            });
        } else if (err) {
            return res.status(500).json({
                message: 'Erro',
                detail: err.message
            });
        }
        next();
    });
};

// Rotas

/**
 * @swagger
 * /api/receitas:
 *   post:
 *     summary: Cria uma nova receita
 *     tags: [Receitas]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               ingredientes:
 *                 type: string
 *               preparo:
 *                 type: string
 *               tempoPreparo:
 *                 type: integer
 *                 description: Tempo de preparo em minutos
 *               categoria:
 *                 type: string
 *                 description: Categoria da receita
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Imagens da receita (até 8 arquivos)
 *     responses:
 *       201:
 *         description: Receita criada com sucesso
 *       400:
 *         description: Erro ao criar a receita
 */
router.post('/receitas', processFormData, ReceitaController.create);

/**
 * @swagger
 * /api/receitas:
 *   get:
 *     summary: Lista todas as receitas
 *     tags: [Receitas]
 *     responses:
 *       200:
 *         description: Lista de receitas
 *       400:
 *         description: Erro ao listar as receitas
 */
router.get('/receitas', ReceitaController.getAll);

/**
 * @swagger
 * /api/receitas/{id}:
 *   get:
 *     summary: Obtém uma receita pelo ID
 *     tags: [Receitas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da receita
 *     responses:
 *       200:
 *         description: Detalhes da receita
 *       404:
 *         description: Receita não encontrada
 */
router.get('/receitas/:id', ReceitaController.getById);

/**
 * @swagger
 * /api/receitas/{id}:
 *   put:
 *     summary: Atualiza uma receita pelo ID
 *     tags: [Receitas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da receita
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               ingredientes:
 *                 type: string
 *               preparo:
 *                 type: string
 *               tempoPreparo:
 *                 type: integer
 *               categoria:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Novas imagens da receita (opcional)
 *     responses:
 *       200:
 *         description: Receita atualizada com sucesso
 *       400:
 *         description: Erro ao atualizar a receita
 *       404:
 *         description: Receita não encontrada
 */
router.put('/receitas/:id', processFormData, ReceitaController.update);

/**
 * @swagger
 * /api/receitas/{id}:
 *   delete:
 *     summary: Deleta uma receita pelo ID
 *     tags: [Receitas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da receita
 *     responses:
 *       200:
 *         description: Receita deletada com sucesso
 *       404:
 *         description: Receita não encontrada
 */
router.delete('/receitas/:id', ReceitaController.delete);

/**
 * @swagger
 * /api/receitas/{id}/verificar:
 *   patch:
 *     summary: Verifica uma receita
 *     tags: [Receitas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da receita
 *     responses:
 *       200:
 *         description: Receita verificada com sucesso
 *       400:
 *         description: Erro ao verificar a receita
 *       404:
 *         description: Receita não encontrada
 */
router.patch('/receitas/:id/verificar', ReceitaController.verify);

/**
 * @swagger
 * /api/{tema}/receitas:
 *   get:
 *     summary: Lista receitas por tema
 *     tags: [Receitas]
 *     parameters:
 *       - in: path
 *         name: tema
 *         required: true
 *         schema:
 *           type: string
 *         description: Tema das receitas
 *     responses:
 *       200:
 *         description: Lista de receitas por tema
 *       400:
 *         description: Erro ao listar receitas por tema
 */
router.get('/:tema/receitas', ReceitaController.getAllByTheme);

/**
 * @swagger
 * /api/{tema}/receitas/verificadas:
 *   get:
 *     summary: Lista receitas verificadas por tema
 *     tags: [Receitas]
 *     parameters:
 *       - in: path
 *         name: tema
 *         required: true
 *         schema:
 *           type: string
 *         description: Tema das receitas
 *     responses:
 *       200:
 *         description: Lista de receitas verificadas por tema
 *       400:
 *         description: Erro ao listar receitas verificadas por tema
 */
router.get('/:tema/receitas/verificadas', ReceitaController.getAllVerifiedByTheme);

/**
 * @swagger
 * /api/{tema}/receitas/nao-verificadas:
 *   get:
 *     summary: Lista receitas não verificadas por tema
 *     tags: [Receitas]
 *     parameters:
 *       - in: path
 *         name: tema
 *         required: true
 *         schema:
 *           type: string
 *         description: Tema das receitas
 *     responses:
 *       200:
 *         description: Lista de receitas não verificadas por tema
 *       400:
 *         description: Erro ao listar receitas não verificadas por tema
 */
router.get('/:tema/receitas/nao-verificadas', ReceitaController.getAllNotVerifiedByTheme);

/**
 * @swagger
 * /api/receitas/{tema}/{subtema}:
 *   get:
 *     summary: Lista receitas por tema e subtema
 *     tags: [Receitas]
 *     parameters:
 *       - in: path
 *         name: tema
 *         required: true
 *         schema:
 *           type: string
 *         description: Tema das receitas
 *       - in: path
 *         name: subtema
 *         required: true
 *         schema:
 *           type: string
 *         description: Subtema das receitas
 *     responses:
 *       200:
 *         description: Lista de receitas por tema e subtema
 *       400:
 *         description: Erro ao listar receitas por tema e subtema
 */
router.get('/receitas/:tema/:subtema', ReceitaController.getReceitasPorSubtemas);

export default router;
