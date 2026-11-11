const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const swaggerUi = require("swagger-ui-express");
const transactionRoutes = require("./routes/transactionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const swaggerSpec = require("./swagger");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Welcome To Expense Tracker API" });
});

app.listen(PORT, () => {
    console.log(`Expense Tracker API running on port ${PORT}`);
});