import { Router } from 'express';
import userController from '../controllers/userController.js';
import userUpload from "../middlewares/uploadMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               tokens:
 *                 type: string
 *               senha:
 *                 type: string
 *               nome:
 *                 type: string
 *               telefone:
 *                 type: string
 *               nivelConsciencia:
 *                 type: integer
 *                 description: Nível de conscientização do usuário (0-5)
 *               isMonitor:
 *                 type: boolean
 *               fotoUsu:
 *                 type: string
 *                 format: binary
 *                 description: Imagem de perfil do usuário
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Erro na criação do usuário
 */
router.post('/usuario', userUpload.single('fotoUsu'), userController.store);

/**
 * @swagger
 * /api/usuario/login:
 *   post:
 *     summary: Realiza o login do usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: E-mail do usuário para autenticação
 *               senha:
 *                 type: string
 *                 description: Senha do usuário para autenticação
 *     responses:
 *       200:
 *         description: Login bem-sucedido, retorna um token JWT
 *       400:
 *         description: Credenciais inválidas ou erro de autenticação
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/usuario/login', userController.loginUser);

/**
 * @swagger
 * /api/usuario/reset:
 *   post:
 *     summary: Inicia a solicitação de redefinição de senha
 *     tags: [Autenticação]
 *     description: Envia um token de redefinição para o e-mail do usuário.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@example.com
 *                 description: O e-mail do usuário que solicitou a redefinição de senha.
 *     responses:
 *       200:
 *         description: Token de redefinição enviado com sucesso
 *       400:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/usuario/reset', userController.resetPasswordRequest);

/**
 * @swagger
 * /api/usuario/reset/{token}:
 *   post:
 *     summary: Completa a redefinição de senha
 *     tags: [Autenticação]
 *     description: Permite ao usuário definir uma nova senha usando o token de redefinição.
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de redefinição de senha.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 description: A nova senha que o usuário deseja definir.
 *     responses:
 *       200:
 *         description: Senha atualizada com sucesso
 *       400:
 *         description: Token expirado ou inválido, ou erro ao atualizar a senha
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/usuario/reset/:token', userController.resetPassword);

/**
 * @swagger
 * /api/usuario:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       400:
 *         description: Erro ao buscar usuários
 */
router.get('/usuario', authMiddleware, userController.index);

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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informações do usuário
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/usuario/:email', authMiddleware, userController.show);

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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               telefone:
 *                 type: string
 *               nivelConsciencia:
 *                 type: integer
 *               isMonitor:
 *                 type: boolean
 *               senha:
 *                 type: string
 *                 description: Nova senha do usuário, caso queira alterar
 *               fotoUsu:
 *                 type: string
 *                 format: binary
 *                 description: Imagem de perfil do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Erro ao atualizar o usuário
 *       404:
 *         description: Usuário não encontrado
 */
router.put('/usuario/:email', authMiddleware, userUpload.single('fotoUsu'), userController.update);

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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       400:
 *         description: Erro ao deletar o usuário
 */
router.delete('/usuario/:email', authMiddleware, userController.delete);

export default router;
