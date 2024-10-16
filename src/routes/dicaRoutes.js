import { Router } from 'express';
import dicaController from '../controllers/dicaController.js';

// import loginRequired from '../middlewares/loginRequired'; futuro

const router = new Router();

router.get('/dicas', dicaController.getAll);
router.post('/dicas', dicaController.create);
router.put('/dicas/:codigo', dicaController.update);
router.get('/dicas/:codigo', dicaController.getByCode);
router.delete('/dicas/:codigo', dicaController.delete);
router.patch('/dicas/:codigo/verificar', dicaController.verify);
router.get('/:tema/dicas', dicaController.getAllByTheme);
router.get('/:tema/dicas/verificadas', dicaController.getAllVerifiedByTheme);
router.get('/:tema/dicas/nao-verificadas', dicaController.getAllNotVerifiedByTheme);

export default router;

