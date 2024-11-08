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
 * /api/login:
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login bem-sucedido
 *                 token:
 *                   type: string
 *                   description: Token JWT gerado após login
 *       400:
 *         description: Erro de autenticação, credenciais inválidas
 *       401:
 *         description: Credenciais inválidas ou usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
/**
 * @swagger
 * /api/login:
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login bem-sucedido
 *                 token:
 *                   type: string
 *                   description: Token JWT gerado após login
 *       400:
 *         description: Erro de autenticação, credenciais inválidas
 *       401:
 *         description: Credenciais inválidas ou usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/usuario/login', userController.loginUser);

/**
 * @swagger
 * /api/usuario/reset:
 *   post:
 *     summary: Inicia a solicitação de redefinição de senha
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token de redefinição de senha enviado com sucesso"
 *       400:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuário não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro interno do servidor"
 */

/**
 * @swagger
 * /api/usuario/reset:
 *   post:
 *     summary: Inicia a solicitação de redefinição de senha
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token de redefinição de senha enviado com sucesso"
 *       400:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuário não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro interno do servidor"
 */

router.post('/usuario/reset', userController.resetPasswordRequest);

/**
 * @swagger
 * /api/usuario/reset/{token}:
 *   post:
 *     summary: Completa a redefinição de senha
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
 *                 example: "novaSenhaSegura123"
 *                 description: A nova senha que o usuário deseja definir.
 *     responses:
 *       200:
 *         description: Senha atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Senha atualizada com sucesso"
 *       400:
 *         description: Token expirado ou inválido, ou erro ao atualizar a senha
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token expirado" # ou "Token inválido" ou "Erro ao atualizar a senha"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro interno do servidor"
 */


router.post('/usuario/reset/:token', userController.resetPassword);

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
router.delete('/usuario/:email', authMiddleware, userController.delete);


export default router;
