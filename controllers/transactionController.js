const db = require("../config/db");
const createTransaction = async (req, res) => {
    try
    {
        const { type, amount, category, description, transaction_date } = req.body;
        if (!type || !amount || !category || !transaction_date) {
            return res.status(400).json({
                message: "Type, amount, category and transaction date are required"
            });
    }
    if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
            message: "Type must be either income or expense"
        });
    }
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({
            message: "Amount must be a positive number"
        });
    }
    const [result] = await db.promise().query(
        `INSERT INTO transactions
        (user_id, type, amount, category, description, transaction_date)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            req.user.id,
            type,
            amount,
            category.trim(),
            description || null,
            transaction_date
        ]
    );

    return res.status(201).json({
        message: "Transaction created successfully",
        transaction: {
            id: result.insertId,
            user_id: req.user.id,
            type,
            amount,
            category: category.trim(),
            description: description || null,
            transaction_date
        }
    });

} catch (error) {
    console.error("Transaction creation error:", error.message);

    return res.status(500).json({
        message: "Internal server error"
    });
}
}; 

const getTransactions = async (req, res) => { try { let query = `SELECT * FROM transactions WHERE user_id = ?`;
    const params = [req.user.id];
    if (req.query.type) {
        if (!["income", "expense"].includes(req.query.type)) {
            return res.status(400).json({
                message: "Type must be either income or expense"
            });
        }

        query += " AND type = ?";
        params.push(req.query.type);
    }
    if (req.query.category) {
        const category = req.query.category.trim();

        if (!category) {
            return res.status(400).json({
                message: "Category cannot be empty"
            });
        }

        query += " AND category = ?";
        params.push(category);
    }
    if (req.query.start_date) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(req.query.start_date) ||
            Number.isNaN(Date.parse(req.query.start_date))) {
            return res.status(400).json({
                message: "Invalid start_date. Use YYYY-MM-DD format"
            });
        }

        query += " AND transaction_date >= ?";
        params.push(req.query.start_date);
    }
    if (req.query.end_date) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(req.query.end_date) ||
            Number.isNaN(Date.parse(req.query.end_date))) {
            return res.status(400).json({
                message: "Invalid end_date. Use YYYY-MM-DD format"
            });
        }

        query += " AND transaction_date <= ?";
        params.push(req.query.end_date);
    }
    if (
        req.query.start_date &&
        req.query.end_date &&
        req.query.start_date > req.query.end_date
    ) {
        return res.status(400).json({
            message: "start_date cannot be later than end_date"
        });
    }
    query += " ORDER BY transaction_date DESC";
    const [transactions] = await db.promise().query(
        query,
        params
    );

    return res.status(200).json({
        message: "Transactions retrieved successfully",
        count: transactions.length,
        transactions
    });

} catch (error) {
    console.error("Fetching transactions error:", error.message);

    return res.status(500).json({
        message: "Internal server error"
    });
}
};
const getTransactionById = async (req, res) => { try { const { id } = req.params;
    const [transactions] = await db.promise().query(
        `SELECT * FROM transactions
         WHERE id = ? AND user_id = ?`,
        [id, req.user.id]
    );

    if (transactions.length === 0) {
        return res.status(404).json({
            message: "Transaction not found"
        });
    }

    return res.status(200).json({
        message: "Transaction retrieved successfully",
        transaction: transactions[0]
    });

} catch (error) {
    console.error("Fetching transaction error:", error.message);

    return res.status(500).json({
        message: "Internal server error"
    });
}
};
const updateTransaction = async (req, res) => { try { const { id } = req.params;
    const {
        type,
        amount,
        category,
        description,
        transaction_date
    } = req.body;

    if (!type || !amount || !category || !transaction_date) {
        return res.status(400).json({
            message: "Type, amount, category and transaction date are required"
        });
    }

    if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
            message: "Type must be either income or expense"
        });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({
            message: "Amount must be a positive number"
        });
    }

    const [result] = await db.promise().query(
        `UPDATE transactions
         SET type = ?, amount = ?, category = ?,
             description = ?, transaction_date = ?
         WHERE id = ? AND user_id = ?`,
        [
            type,
            amount,
            category.trim(),
            description || null,
            transaction_date,
            id,
            req.user.id
        ]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({
            message: "Transaction not found"
        });
    }

    return res.status(200).json({
        message: "Transaction updated successfully"
    });

} catch (error) {
    console.error("Updating transaction error:", error.message);

    return res.status(500).json({
        message: "Internal server error"
    });
}
};
const deleteTransaction = async (req, res) => { try { const { id } = req.params;
    const [result] = await db.promise().query(
        `DELETE FROM transactions
         WHERE id = ? AND user_id = ?`,
        [id, req.user.id]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({
            message: "Transaction not found"
        });
    }

    return res.status(200).json({
        message: "Transaction deleted successfully"
    });

} catch (error) {
    console.error("Deleting transaction error:", error.message);

    return res.status(500).json({
        message: "Internal server error"
    });
}
};
module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
};