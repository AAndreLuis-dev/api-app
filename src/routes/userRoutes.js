import { Router } from 'express';
import userController from '../controllers/userController.js';

// import loginRequired from '../middlewares/loginRequired'; futuro

const router = new Router();

router.get('/usuario', userController.index);
router.post('/usuario', userController.store);
router.put('/usuario/:email', userController.update);
router.get('/usuario/:email', userController.show);
router.delete('/usuario/:email', userController.delete);

export default router;
