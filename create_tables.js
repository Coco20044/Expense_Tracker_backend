const db = require("./config/db");
const createUsersTable = `CREATE TABLE IF NOT EXISTS users 
(id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL,
 email VARCHAR(255) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
 ENGINE=InnoDB;`;
db.query(createUsersTable, (error, results) => {
    if (error) {
        console.error("Error creating users table:", error.message);
    } else {
        console.log("Users table created successfully!");
    }
});
const createTransactionsTable = ` CREATE TABLE IF NOT EXISTS transactions ( id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id INT UNSIGNED NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
   amount DECIMAL(12, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
     description TEXT,
     transaction_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transactions_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
`;
db.query(createTransactionsTable, (error, results) => {
    if (error) { console.error("Error creating transactions table:", error.message); }
    else { console.log("Transactions table created successfully!"); }
    db.end();
});