import { Router } from 'express';
import dicaController from '../controllers/dicaController.js';

// import loginRequired from '../middlewares/loginRequired'; futuro

const router = new Router();

router.get('/dicas', dicaController.index);
router.post('/dicas', dicaController.store);
router.put('/dicas/:codigo', dicaController.update);
router.get('/dicas/:codigo', dicaController.show);
router.delete('/dicas/:codigo', dicaController.delete);

export default router;

