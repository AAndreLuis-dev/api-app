import { Router } from 'express';
import userController from '../controllers/userController';

// import loginRequired from '../middlewares/loginRequired'; futuro

const router = new Router();

router.get('/usuario', userController.index);
router.post('/usuario', userController.store);
router.put('/usuario/:id', userController.update);
router.get('/usuario/:id', userController.show);
router.delete('/usuario/:id', userController.delete);

export default router;
