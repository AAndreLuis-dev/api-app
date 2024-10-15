import { Router } from 'express';
import temaController from '../controllers/temaController.js';

const router = new Router();

router.get('/temas', temaController.index);
router.post('/temas', temaController.store);
router.put('/temas/:id', temaController.update);
router.get('/temas/:id', temaController.show);
router.delete('/temas/:id', temaController.delete);

export default router;