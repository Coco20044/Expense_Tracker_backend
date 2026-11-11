const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const { createTransaction,getTransactions,getTransactionById,updateTransaction,deleteTransaction } = require("../controllers/transactionController");
/** 
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: ["Transactions"]
 *     description: Create a new transaction for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *               - category
 *               - transaction_date
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               amount:
 *                 type: number
 *                 description: The amount of the transaction
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               transaction_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Invalid transaction data
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       500:
 *         description: Internal server error
 */
router.post("/", verifyToken, createTransaction);
/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions for the authenticated user
 *     tags: ["Transactions"]
 *     description: Retrieve a list of transactions for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: type
 *        required: false
 *        schema:
 *          type: string
 *          enum: [income, expense]
 *        description: Filter transactions by type (income or expense)
 *      - in: query
 *        name: category
 *        required: false
 *        schema:
 *          type: string
 *        description: Filter transactions by category
 *      - in: query
 *        name: start_date
 *        required: false
 *        schema:
 *          type: string
 *          format: date
 *        description: Filter transactions by start date
 *      - in: query
 *        name: end_date
 *        required: false
 *        schema:
 *          type: string
 *          format: date
 *        description: Filter transactions by end date
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       500:
 *         description: Internal server error
 */
router.get("/", verifyToken, getTransactions);
/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get a specific transaction by ID
 *     tags: ["Transactions"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID of the transaction to retrieve
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", verifyToken, getTransactionById);
/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Update an existing transaction by ID
 *     tags: ["Transactions"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID of the transaction to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *               - category
 *               - transaction_date
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               transaction_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
*         description: Transaction not found
*       500:
*         description: Internal server error
 */
router.put("/:id", verifyToken, updateTransaction);
/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete a transaction 
 *     tags: ["Transactions"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID 
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", verifyToken, deleteTransaction);
module.exports = router;