import { Router } from 'express';
import receitaController from '../controllers/receitaController.js';

const router = new Router();

router.get('/receitas', receitaController.getAll);
router.post('/receitas', receitaController.create);
router.put('/receitas/:codigo', receitaController.update);
router.get('/receitas/:codigo', receitaController.getByCode);
router.delete('/receitas/:codigo', receitaController.delete);
router.patch('/receitas/:codigo/verificar', receitaController.verify);
router.get('/:tema/receitas', receitaController.getAllByTheme);
router.get('/:tema/receitas/verificadas', receitaController.getAllVerifiedByTheme);
router.get('/:tema/receitas/nao-verificadas', receitaController.getAllNotVerifiedByTheme);

export default router;