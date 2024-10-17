import { Router } from 'express';
import temaController from '../controllers/temaController.js';

const router = new Router();

router.get('/temas', temaController.index);
router.get('/temas/existe/:tema', temaController.checkIfExists);
router.delete('/temas/:tema', temaController.delete);

export default router;
