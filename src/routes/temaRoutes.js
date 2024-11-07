import { Router } from 'express';
import temaController from '../controllers/temaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = new Router();
const authMiddleware = require('../middlewares/authMiddleware.js');

router.get('/temas', temaController.index);
router.get('/temas/existe/:tema', temaController.checkIfExists);
router.delete('/temas/:tema', authMiddleware,
     temaController.delete);

export default router;
