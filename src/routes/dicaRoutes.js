// import { Router } from 'express';
// import dicaController from '../controllers/dicaController.js';
// import authMiddleware from '../middlewares/authMiddleware.js';


// // import loginRequired from '../middlewares/loginRequired'; futuro

// const router = new Router();

// /**
//  * @swagger
//  * tags:
//  *   name: Dicas
//  *   description: Operações relacionadas a dicas
//  */

// /**
//  * @swagger
//  * /dicas:
//  *   get:
//  *     summary: Obter todas as dicas
//  *     tags: [Dicas]
//  *     responses:
//  *       200:
//  *         description: Lista de dicas retornada com sucesso
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   id:
//  *                     type: integer
//  *                     description: ID da dica
//  *                   conteudo:
//  *                     type: string
//  *                     description: Conteúdo da dica
//  *       500:
//  *         description: Erro ao obter dicas
//  */

// router.get('/dicas', authMiddleware, dicaController.getAll);

// /**
//  * @swagger
//  * /dicas:
//  *   post:
//  *     summary: Criar uma nova dica
//  *     tags: [Dicas]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               conteudo:
//  *                 type: string
//  *                 description: O conteúdo da dica
//  *               tema:
//  *                 type: string
//  *                 description: Tema da dica
//  *               subtemas:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *                   description: Subtemas relacionados à dica
//  *     responses:
//  *       201:
//  *         description: Dica criada com sucesso
//  *       400:
//  *         description: Dados inválidos
//  *       500:
//  *         description: Erro interno do servidor
//  */


// router.post('/dicas', authMiddleware, dicaController.create);

// /**
//  * @swagger
//  * /dicas/{id}:
//  *   put:
//  *     summary: Atualizar uma dica existente
//  *     tags: [Dicas]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: ID da dica
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               conteudo:
//  *                 type: string
//  *                 description: O novo conteúdo da dica
//  *               tema:
//  *                 type: string
//  *               subtemas:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *     responses:
//  *       200:
//  *         description: Dica atualizada com sucesso
//  *       400:
//  *         description: Dados inválidos
//  *       404:
//  *         description: Dica não encontrada
//  *       500:
//  *         description: Erro interno do servidor
//  */


// router.put('/dicas/:id', authMiddleware, dicaController.update);

// /**
//  * @swagger
//  * /dicas/{id}:
//  *   get:
//  *     summary: Obter uma dica pelo ID
//  *     tags: [Dicas]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: ID da dica
//  *     responses:
//  *       200:
//  *         description: Dica retornada com sucesso
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *       404:
//  *         description: Dica não encontrada
//  *       500:
//  *         description: Erro ao buscar a dica
//  */

// router.get('/dicas/:id', authMiddleware, dicaController.getByCode);

// /**
//  * @swagger
//  * /dicas/{id}:
//  *   delete:
//  *     summary: Excluir uma dica
//  *     tags: [Dicas]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: ID da dica
//  *     responses:
//  *       204:
//  *         description: Dica excluída com sucesso
//  *       404:
//  *         description: Dica não encontrada
//  *       500:
//  *         description: Erro ao excluir dica
//  */

// router.delete('/dicas/:id', authMiddleware, dicaController.delete);

// /**
//  * @swagger
//  * /dicas/{id}/verificar:
//  *   patch:
//  *     summary: Verificar uma dica
//  *     tags: [Dicas]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: ID da dica
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               verifyBy:
//  *                 type: string
//  *                 description: Email do usuário que verificou
//  *     responses:
//  *       200:
//  *         description: Dica verificada com sucesso
//  *       400:
//  *         description: Dados inválidos ou usuário não é monitor
//  *       404:
//  *         description: Dica ou usuário não encontrados
//  *       500:
//  *         description: Erro ao verificar dica
//  */


// router.patch('/dicas/:id/verificar', authMiddleware, dicaController.verify);

// /**
//  * @swagger
//  * /{tema}/dicas:
//  *   get:
//  *     summary: Obter dicas por tema
//  *     tags: [Dicas]
//  *     parameters:
//  *       - in: path
//  *         name: tema
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Tema das dicas
//  *     responses:
//  *       200:
//  *         description: Lista de dicas retornada com sucesso
//  *       400:
//  *         description: Tema inválido
//  *       404:
//  *         description: Nenhuma dica encontrada
//  *       500:
//  *         description: Erro ao buscar dicas
//  */

// router.get('/:tema/dicas', authMiddleware, dicaController.getAllByTheme);

// /**
//  * @swagger
//  * /{tema}/dicas/verificadas:
//  *   get:
//  *     summary: Obter dicas verificadas por tema
//  *     tags: [Dicas]
//  *     parameters:
//  *       - in: path
//  *         name: tema
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Tema das dicas verificadas
//  *     responses:
//  *       200:
//  *         description: Lista de dicas verificadas retornada com sucesso
//  *       400:
//  *         description: Tema inválido
//  *       404:
//  *         description: Nenhuma dica encontrada
//  *       500:
//  *         description: Erro ao buscar dicas
//  */


// router.get('/:tema/dicas/verificadas', authMiddleware, dicaController.getAllVerifiedByTheme);

// /**
//  * @swagger
//  * /{tema}/dicas/nao-verificadas:
//  *   get:
//  *     summary: Obter dicas não verificadas por tema
//  *     tags: [Dicas]
//  *     parameters:
//  *       - in: path
//  *         name: tema
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Tema das dicas não verificadas
//  *     responses:
//  *       200:
//  *         description: Lista de dicas não verificadas retornada com sucesso
//  *       400:
//  *         description: Tema inválido
//  *       404:
//  *         description: Nenhuma dica encontrada
//  *       500:
//  *         description: Erro ao buscar dicas
//  */


// router.get('/:tema/dicas/nao-verificadas', authMiddleware, dicaController.getAllNotVerifiedByTheme);
// router.get('/dicas/:tema/:subtema', authMiddleware, dicaController.getDica);


// export default router;


import { Router } from 'express';
import dicaController from '../controllers/dicaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = new Router();

/**
 * @swagger
 * /api/dicas:
 *   get:
 *     summary: Lista todas as dicas
 *     tags: [Dicas]
 *     responses:
 *       200:
 *         description: Lista de dicas
 *       400:
 *         description: Erro ao listar as dicas
 */
router.get('/dicas', dicaController.getAll);

/**
 * @swagger
 * /api/dicas:
 *   post:
 *     summary: Cria uma nova dica
 *     tags: [Dicas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título da dica
 *               descricao:
 *                 type: string
 *                 description: Descrição detalhada da dica
 *               tema:
 *                 type: string
 *                 description: Tema relacionado à dica
 *               subtema:
 *                 type: string
 *                 description: Subtema relacionado à dica
 *     responses:
 *       201:
 *         description: Dica criada com sucesso
 *       400:
 *         description: Erro ao criar a dica
 */
router.post('/dicas', authMiddleware, dicaController.create);

/**
 * @swagger
 * /api/dicas/{id}:
 *   put:
 *     summary: Atualiza uma dica
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da dica
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título da dica
 *               descricao:
 *                 type: string
 *                 description: Descrição detalhada da dica
 *               tema:
 *                 type: string
 *                 description: Tema relacionado à dica
 *               subtema:
 *                 type: string
 *                 description: Subtema relacionado à dica
 *     responses:
 *       200:
 *         description: Dica atualizada com sucesso
 *       400:
 *         description: Erro ao atualizar a dica
 *       404:
 *         description: Dica não encontrada
 */
router.put('/dicas/:id', authMiddleware, dicaController.update);

/**
 * @swagger
 * /api/dicas/{id}:
 *   get:
 *     summary: Obtém uma dica pelo ID
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da dica
 *     responses:
 *       200:
 *         description: Detalhes da dica
 *       404:
 *         description: Dica não encontrada
 */
router.get('/dicas/:id', dicaController.getByCode);

/**
 * @swagger
 * /api/dicas/{id}:
 *   delete:
 *     summary: Deleta uma dica pelo ID
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da dica
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dica deletada com sucesso
 *       404:
 *         description: Dica não encontrada
 */
router.delete('/dicas/:id', authMiddleware, dicaController.delete);

/**
 * @swagger
 * /api/dicas/{id}/verificar:
 *   patch:
 *     summary: Verifica uma dica
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da dica
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dica verificada com sucesso
 *       400:
 *         description: Erro ao verificar a dica
 *       404:
 *         description: Dica não encontrada
 */
router.patch('/dicas/:id/verificar', authMiddleware, dicaController.verify);

/**
 * @swagger
 * /api/{tema}/dicas:
 *   get:
 *     summary: Lista dicas por tema
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: tema
 *         required: true
 *         schema:
 *           type: string
 *         description: Tema da dica
 *     responses:
 *       200:
 *         description: Lista de dicas por tema
 *       400:
 *         description: Erro ao listar dicas por tema
 */
router.get('/:tema/dicas', dicaController.getAllByTheme);

/**
 * @swagger
 * /api/{tema}/dicas/verificadas:
 *   get:
 *     summary: Lista dicas verificadas por tema
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: tema
 *         required: true
 *         schema:
 *           type: string
 *         description: Tema da dica
 *     responses:
 *       200:
 *         description: Lista de dicas verificadas por tema
 *       400:
 *         description: Erro ao listar dicas verificadas por tema
 */
router.get('/:tema/dicas/verificadas', dicaController.getAllVerifiedByTheme);

/**
 * @swagger
 * /api/{tema}/dicas/nao-verificadas:
 *   get:
 *     summary: Lista dicas não verificadas por tema
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: tema
 *         required: true
 *         schema:
 *           type: string
 *         description: Tema da dica
 *     responses:
 *       200:
 *         description: Lista de dicas não verificadas por tema
 *       400:
 *         description: Erro ao listar dicas não verificadas por tema
 */
router.get('/:tema/dicas/nao-verificadas', dicaController.getAllNotVerifiedByTheme);

/**
 * @swagger
 * /api/dicas/{tema}/{subtema}:
 *   get:
 *     summary: Lista dicas por tema e subtema
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: tema
 *         required: true
 *         schema:
 *           type: string
 *         description: Tema da dica
 *       - in: path
 *         name: subtema
 *         required: true
 *         schema:
 *           type: string
 *         description: Subtema da dica
 *     responses:
 *       200:
 *         description: Lista de dicas por tema e subtema
 *       400:
 *         description: Erro ao listar dicas por tema e subtema
 */
router.get('/dicas/:tema/:subtema', dicaController.getDica);

export default router;
