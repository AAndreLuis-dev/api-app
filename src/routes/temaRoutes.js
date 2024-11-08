import { Router } from 'express';
import temaController from '../controllers/temaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = new Router();

router.get('/tema', temaController.index);
router.get('/tema/:id', temaController.checkIfExists);
router.delete('/tema/:id', authMiddleware, temaController.delete);
/*router.get('/tema/:tema/subtemas', temaController.getSubtemas);*/

export default router;