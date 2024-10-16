import { Router } from 'express';
import temaController from '../controllers/temaController.js'; // Importa o controller

const router = new Router();

router.get('/temas', temaController.index);
router.delete('/temas/:tema', temaController.delete);

export default router;
