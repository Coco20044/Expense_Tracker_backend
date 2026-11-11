const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    getReportSummary,
    getMonthlyReport,
    getCategoryReport
} = require("../controllers/reportController");

router.get("/summary", verifyToken, getReportSummary);

router.get("/monthly", verifyToken, getMonthlyReport);

router.get("/categories", verifyToken, getCategoryReport);

module.exports = router;