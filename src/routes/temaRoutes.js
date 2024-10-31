import { Router } from 'express';
import temaController from '../controllers/temaController.js';

const router = new Router();

router.get('/tema', temaController.index);
router.get('/tema/existe/:tema', temaController.checkIfExists);
router.delete('/tema/:tema', temaController.delete);
router.get('/:tema/subtemas', temaController.getSubtemas);

export default router;
