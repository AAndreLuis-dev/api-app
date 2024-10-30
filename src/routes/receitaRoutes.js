import express from 'express';
import multer from 'multer';
import ReceitaController from '../controllers/receitaController.js';

const router = express.Router();

// Capacidade de imagem
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

router.get('/receitas', ReceitaController.getAll);
router.post('/receitas', upload.array('files', 10), ReceitaController.create);
router.put('/receitas/:codigo', upload.array('files', 10), ReceitaController.update);
router.get('/receitas/:codigo', ReceitaController.getByCode);
router.delete('/receitas/:codigo', ReceitaController.delete);
router.patch('/receitas/:codigo/verificar', ReceitaController.verify);
router.get('/:tema/receitas', ReceitaController.getAllByTheme);
router.get('/:tema/receitas/verificadas', ReceitaController.getAllVerifiedByTheme);
router.get('/:tema/receitas/nao-verificadas', ReceitaController.getAllNotVerifiedByTheme);

export default router;