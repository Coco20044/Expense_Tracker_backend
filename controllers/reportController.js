const db = require("../config/db");
const getReportSummary = async (req, res) => { try { const [result] = await db.promise().query( `SELECT COALESCE(SUM( CASE WHEN type = 'income' THEN amount ELSE 0 END ), 0) AS total_income,
            COALESCE(SUM(
                CASE WHEN type = 'expense'
                THEN amount ELSE 0 END
            ), 0) AS total_expenses,

            COUNT(*) AS transaction_count

         FROM transactions
         WHERE user_id = ?`,
        [req.user.id]
    );

    const totalIncome = Number(result[0].total_income);
    const totalExpenses = Number(result[0].total_expenses);

    return res.status(200).json({
        message: "Financial summary retrieved successfully",
        summary: {
            total_income: totalIncome,
            total_expenses: totalExpenses,
            balance: totalIncome - totalExpenses,
            transaction_count: Number(result[0].transaction_count)
        }
    });

} catch (error) {
    console.error("Financial summary error:", error.message);

    return res.status(500).json({
        message: "Internal server error"
    });
}
};
const getMonthlyReport = async (req, res) => { try { const [results] = await db.promise().query( `SELECT YEAR(transaction_date) AS year, MONTH(transaction_date) AS month, DATE_FORMAT(transaction_date, '%Y-%m') AS period,
            SUM(CASE
                WHEN type = 'income' THEN amount
                ELSE 0
            END) AS total_income,

            SUM(CASE
                WHEN type = 'expense' THEN amount
                ELSE 0
            END) AS total_expenses,

            COUNT(*) AS transaction_count

         FROM transactions
         WHERE user_id = ?
         GROUP BY
            YEAR(transaction_date),
            MONTH(transaction_date),
            DATE_FORMAT(transaction_date, '%Y-%m')
         ORDER BY year DESC, month DESC`,
        [req.user.id]
    );

    const monthlyReports = results.map((report) => {
        const totalIncome = Number(report.total_income);
        const totalExpenses = Number(report.total_expenses);

        return {
            year: report.year,
            month: report.month,
            period: report.period,
            total_income: totalIncome,
            total_expenses: totalExpenses,
            balance: totalIncome - totalExpenses,
            transaction_count: Number(report.transaction_count)
        };
    });

    return res.status(200).json({
        message: "Monthly reports retrieved successfully",
        count: monthlyReports.length,
        reports: monthlyReports
    });

} catch (error) {
    console.error("Monthly report error:", error.message);

    return res.status(500).json({
        message: "Internal server error"
    });
}
};
const getCategoryReport = async (req, res) => { try { const [results] = await db.promise().query( `SELECT category, SUM(amount) AS total_amount, COUNT(*) AS transaction_count
         FROM transactions
         WHERE user_id = ?
         AND type = 'expense'
         GROUP BY category
         ORDER BY total_amount DESC`,
        [req.user.id]
    );

    const categoryReports = results.map((report) => ({
        category: report.category,
        total_amount: Number(report.total_amount),
        transaction_count: Number(report.transaction_count)
    }));

    return res.status(200).json({
        message: "Category reports retrieved successfully",
        count: categoryReports.length,
        reports: categoryReports
    });

} catch (error) {
    console.error("Category report error:", error.message);

    return res.status(500).json({
        message: "Internal server error"
    });
}
};
module.exports = { getReportSummary, getMonthlyReport, getCategoryReport };