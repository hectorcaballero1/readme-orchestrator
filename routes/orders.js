const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { createOrder, acceptOrder, rejectOrder, cancelOrder } = require('../controllers/orderController');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Orquestación de solicitudes de compra/intercambio
 */

/**
 * @swagger
 * /api/orders/solicitud:
 *   post:
 *     summary: Crear una nueva solicitud para un libro
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [book_id, message]
 *             properties:
 *               book_id:
 *                 type: integer
 *                 example: 10
 *               message:
 *                 type: string
 *                 example: "Hola, me interesa tu libro"
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
 *       400:
 *         description: Validación fallida (libro no disponible, mismo usuario, duplicado)
 *       401:
 *         description: Token inválido o ausente
 *       502:
 *         description: Error al comunicarse con un microservicio externo
 */
router.post('/solicitud', auth, createOrder);

/**
 * @swagger
 * /api/orders/{id}/accept:
 *   put:
 *     summary: El vendedor acepta una solicitud
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Solicitud aceptada
 *       400:
 *         description: La solicitud no está en estado pendiente
 *       403:
 *         description: Solo el vendedor puede aceptar
 *       502:
 *         description: Error al comunicarse con un microservicio externo
 */
router.put('/:id/accept', auth, acceptOrder);

/**
 * @swagger
 * /api/orders/{id}/reject:
 *   put:
 *     summary: El vendedor rechaza una solicitud
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Solicitud rechazada
 *       400:
 *         description: La solicitud no está en estado pendiente
 *       403:
 *         description: Solo el vendedor puede rechazar
 *       502:
 *         description: Error al comunicarse con un microservicio externo
 */
router.put('/:id/reject', auth, rejectOrder);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   put:
 *     summary: El comprador cancela su solicitud
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Solicitud cancelada
 *       400:
 *         description: La solicitud no está en estado pendiente
 *       403:
 *         description: Solo el comprador puede cancelar
 *       502:
 *         description: Error al comunicarse con un microservicio externo
 */
router.put('/:id/cancel', auth, cancelOrder);

module.exports = router;
