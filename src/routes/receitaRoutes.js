import express from 'express';
import multer from 'multer';
import ReceitaController from '../controllers/receitaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

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
router.post('/receitas', authMiddleware, processFormData, ReceitaController.create);
router.get('/receitas', authMiddleware, ReceitaController.getAll);
router.get('/receitas/:id', authMiddleware, ReceitaController.getById);
router.put('/receitas/:id', authMiddleware, processFormData, ReceitaController.update);
router.delete('/receitas/:id', authMiddleware, ReceitaController.delete);
router.patch('/receitas/:id/verificar', authMiddleware, ReceitaController.verify);
router.get('/:tema/receitas', authMiddleware, ReceitaController.getAllByTheme);
router.get('/:tema/receitas/verificadas', authMiddleware, ReceitaController.getAllVerifiedByTheme);
router.get('/:tema/receitas/nao-verificadas', authMiddleware, ReceitaController.getAllNotVerifiedByTheme);
router.get('/receitas/:tema/:subtema', authMiddleware, ReceitaController.getReceitasPorSubtemas);


export default router;