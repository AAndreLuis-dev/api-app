import { Router } from 'express';
import temaController from '../controllers/temaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = new Router();

router.get('/tema', authMiddleware, temaController.index);
router.get('/tema/:id', authMiddleware, temaController.checkIfExists);
router.delete('/tema/:id', authMiddleware, temaController.delete);
router.get('/tema/:tema/subtemas', authMiddleware, temaController.getSubtemasByTema);

export default router;