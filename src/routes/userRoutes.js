import { Router } from 'express';
import userController from '../controllers/userController.js';
import userUpload from "../middlewares/uploadMiddleware.js"; // Atualizado para usar userUpload

const router = new Router();

/**
 * @swagger
 * /api/usuario:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               tokens:
 *                  type: string
 *               password:
 *                 type: string
 *               nome:
 *                 type: string
 *               telefone:
 *                 type: string
 *               nivelDeConcientizacao:
 *                 type: integer
 *                 description: Nível de conscientização do usuário (0-5)
 *               isMonitor:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Erro na criação do usuário
 */
router.post('/usuario', userUpload.single('fotoUsu'), userController.store);

/**
 * @swagger
 * /api/usuario:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       400:
 *         description: Erro ao buscar usuários
 */
router.get('/usuario', userController.index);

/**
 * @swagger
 * /api/usuario/{email}:
 *   get:
 *     summary: Obtém um usuário pelo email
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email do usuário
 *     responses:
 *       200:
 *         description: Informações do usuário
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/usuario/:email', userController.show);

/**
 * @swagger
 * /api/usuario/{email}:
 *   put:
 *     summary: Atualiza um usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               telefone:
 *                 type: string
 *               nivelDeConcientizacao:
 *                 type: integer
 *                 description: Nível de conscientização do usuário (0-5)
 *               isMonitor:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Erro ao atualizar o usuário
 */
router.put('/usuario/:email', userUpload.single('fotoUsu'), userController.update);

/**
 * @swagger
 * /api/usuario/{email}:
 *   delete:
 *     summary: Deleta um usuário pelo email
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *       400:
 *         description: Erro ao deletar o usuário
 */
router.delete('/usuario/:email', userController.delete);


export default router;
