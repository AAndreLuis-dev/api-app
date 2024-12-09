import { Router } from 'express';
import dicaController from '../controllers/dicaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import multer from 'multer';

const router = new Router();
// Configuração do Multer
const upload = multer();

// Middleware para processar form-data
const processFormData = (req, res, next) => {
    upload.array('subtemas', 5)(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                message: 'Erro',
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

/**
 * @swagger
 * /api/dicas:
 *   get:
 *     summary: Lista todas as dicas
 *     tags: [Dicas]
 *     responses:
 *       200:
 *         description: Lista de dicas
 *       400:
 *         description: Erro ao listar as dicas
 */
router.get('/dicas', dicaController.getAll);

/**
 * @swagger
 * /api/dicas:
 *   post:
 *     summary: Cria uma nova dica
 *     tags: [Dicas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título da dica
 *               descricao:
 *                 type: string
 *                 description: Descrição detalhada da dica
 *               tema:
 *                 type: string
 *                 description: Tema relacionado à dica
 *               subtema:
 *                 type: string
 *                 description: Subtema relacionado à dica
 *     responses:
 *       201:
 *         description: Dica criada com sucesso
 *       400:
 *         description: Erro ao criar a dica
 */
router.post('/dicas', authMiddleware, processFormData, dicaController.create);

/**
 * @swagger
 * /api/dicas/{id}:
 *   put:
 *     summary: Atualiza uma dica
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da dica
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título da dica
 *               descricao:
 *                 type: string
 *                 description: Descrição detalhada da dica
 *               tema:
 *                 type: string
 *                 description: Tema relacionado à dica
 *               subtema:
 *                 type: string
 *                 description: Subtema relacionado à dica
 *     responses:
 *       200:
 *         description: Dica atualizada com sucesso
 *       400:
 *         description: Erro ao atualizar a dica
 *       404:
 *         description: Dica não encontrada
 */
router.put('/dicas/:id', authMiddleware, processFormData, dicaController.update);

/**
 * @swagger
 * /api/dicas/{id}:
 *   get:
 *     summary: Obtém uma dica pelo ID
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da dica
 *     responses:
 *       200:
 *         description: Detalhes da dica
 *       404:
 *         description: Dica não encontrada
 */
router.get('/dicas/:id', dicaController.getByCode);

/**
 * @swagger
 * /api/dicas/{id}:
 *   delete:
 *     summary: Deleta uma dica pelo ID
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da dica
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dica deletada com sucesso
 *       404:
 *         description: Dica não encontrada
 */
router.delete('/dicas/:id', authMiddleware, dicaController.delete);

/**
 * @swagger
 * /api/dicas/{id}/verificar:
 *   patch:
 *     summary: Verifica uma dica
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da dica
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dica verificada com sucesso
 *       400:
 *         description: Erro ao verificar a dica
 *       404:
 *         description: Dica não encontrada
 */
router.patch('/dicas/:id/verificar', authMiddleware, dicaController.verify);

/**
 * @swagger
 * /api/{tema}/dicas:
 *   get:
 *     summary: Lista dicas por tema
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: tema
 *         required: true
 *         schema:
 *           type: string
 *         description: Tema da dica
 *     responses:
 *       200:
 *         description: Lista de dicas por tema
 *       400:
 *         description: Erro ao listar dicas por tema
 */
router.get('/:tema/dicas', dicaController.getAllByTheme);

/**
 * @swagger
 * /api/{tema}/dicas/verificadas:
 *   get:
 *     summary: Lista dicas verificadas por tema
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: tema
 *         required: true
 *         schema:
 *           type: string
 *         description: Tema da dica
 *     responses:
 *       200:
 *         description: Lista de dicas verificadas por tema
 *       400:
 *         description: Erro ao listar dicas verificadas por tema
 */
router.get('/:tema/dicas/verificadas', dicaController.getAllVerifiedByTheme);

/**
 * @swagger
 * /api/{tema}/dicas/nao-verificadas:
 *   get:
 *     summary: Lista dicas não verificadas por tema
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: tema
 *         required: true
 *         schema:
 *           type: string
 *         description: Tema da dica
 *     responses:
 *       200:
 *         description: Lista de dicas não verificadas por tema
 *       400:
 *         description: Erro ao listar dicas não verificadas por tema
 */
router.get('/:tema/dicas/nao-verificadas', dicaController.getAllNotVerifiedByTheme);

/**
 * @swagger
 * /api/dicas/{tema}/{subtema}:
 *   get:
 *     summary: Lista dicas por tema e subtema
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: tema
 *         required: true
 *         schema:
 *           type: string
 *         description: Tema da dica
 *       - in: path
 *         name: subtema
 *         required: true
 *         schema:
 *           type: string
 *         description: Subtema da dica
 *     responses:
 *       200:
 *         description: Lista de dicas por tema e subtema
 *       400:
 *         description: Erro ao listar dicas por tema e subtema
 */
router.get('/dicas/:tema/:subtema', dicaController.getDica);

router.get('/:tema/dicas/especialistas', dicaController.getSpecialistsDica);

export default router;
