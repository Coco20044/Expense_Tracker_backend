const BASE_URL = "http://localhost:3000/api";
const EMAIL = "reporttester@example.com";
const PASSWORD = "ReportTest123!";
let token;
let createdIds = [];
let passed = 0;
let failed = 0;

const check = (name, condition, details) => {
  if (condition) {
      passed++;
      console.log(`Passed: ${name}`);
  } else {
      failed++;
      console.log(`Failed: ${name}: ${details}`);
  }
};
const request = async (endpoint, method = "GET", body = null) => {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            
        }
    };
    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }
    if (body) { options.body = JSON.stringify(body); };
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    let data = {};
    try {
        data = await response.json();
    } catch { }
    return { status: response.status, data };
};
const getTransactions = async () => {
    const result = await request("/api/transactions");
    return result.data.transactions || [];
};
const findTransaction = (transactions, description) => {
    return transactions.find((transaction) => transaction.description === description);
};
const runTests = async () => {
    console.log("\n========= EXPENSE TRACKER TEST SUITE ==========\n");
    const login = await request("/auth/login", "POST", { email: EMAIL, password: PASSWORD });
    token = login.data.token;
    check("User can log in", login.status === 200 && !!token);
    if (!token) {
        console.log("login failed. stopping tests.");
    }
    const oldToken = token;
    token = null;
    const unauthorized = await request("/api/reports/summary");
    check("Reports require authentication", unauthorized.status === 401);
    token = oldToken;
    const emptySummary = await request("/api/reports/summary");
    const emptyMonthly = await request("/api/reports/monthly");
    const emptyCategory = await request("/api/reports/categories");
    check(
        "Empty summary returns zero totals",
        emptySummary.status === 200 &&
        Number(emptySummary.data.summary?.transaction_count) === 0
    );
    
    check(
        "Empty monthly report  returns empty array",
        emptyMonthly.status === 200 &&
        emptyMonthly.data.reports?.length===0
    );
    
    check(
        "Empty category report  returns empty array",
        emptyCategory.status === 200 &&
        emptyCategory.data.reports?.length===0
    );
    const now = new Date();
    const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");
    const previousMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        15
    );
    const previousDate = [
        previousMonth.getFullYear(),
        String(previousMonth.getMonth() + 1).padStart(2, "0"),
        String(previousMonth.getDate()).padStart(2, "0")
    ].join("-");
    const testTransactions = [
        
        {
            type: "income",
            amount: 5000,
            category: "salary",
            description: "automated test income",
            transaction_date: today
        },
        {
            type: "expense",
            amount: 1000,
            category: "groceries",
            description: "automated test groceries",
            transaction_date: today
        },
        {
            type: "expense",
            amount: 500,
            category: "transport",
            description: "automated test transport",
            transaction_date: previousDate
        }
    ];
    for (const transaction of testTransactions) {
        const result = await request(
            "/api/transactions",
            "POST",
            transaction
        )
        check(
            `create ${transaction.type}:${transaction.description}`,
            result.status >= 200 && result.status < 300,
            result.data
        )
    }
    let trnsactions = await getTransactions();
    for (const transaction of testTransactions) {
        const found = findTransaction(
            transactions,
            testTransactions.description
        )
        if (found) {
            createdIds.push(found.id);
        }
    }
    const allTransactions = await request("/api/transactions");
    check(
        "Retrieve transactions",
        allTransactions.status === 200 &&
        allTransactions.data.trnsactions?.length === 3
    );
    const incomeFilter = await request("/api/transactions?type=income");

    check(
        "Filter transactions by income",
        incomeFilter.status === 200 &&
        incomeFilter.data.transactions?.length === 1
    );
    const categoryFilter = await request("/api/transactions?category=Groceries");
    check(
        "Filter transactions by category",
        categoryFilter.status === 200 &&
        categoryFilter.data.transactions?.length === 1
    );
    const dateFilter = await request(

        `api/transactions?start_date=${today}&end_date=${today}`

    );

    check(

        "filter transactions by date range",

        dateFilter.status === 200 &&

        dateFilter.data.transactions?.length === 2

    );

    // 7. GET ONE TRANSACTION

    const transactionId = createdIds[0];

    const singleTransaction = await request(

        `api/transactions/${transactionId}`

    );

    check(

        "retrieve individual transactions",

        singleTransaction.status === 200

    );

    const updatedTransaction = await request(

        `api/transactions/${transactionId}`,

        "PUT",

        {

            ...testTransactions[0],

            amount: 6000,

            description: "updated automated test income",

        }

    );

    check(

        "update transactions",

        updatedTransaction.status >= 200 &&

        updatedTransaction.status < 300

    );

    // 9. FINANCIAL SUMMARY

    const summary = await request('/api/reports/summary');

    const totals = summary.data.summary || {};

    check(

        "summary calculates totals income correctly",

        Number(totals.total_income) === 6000

    );

    check(

       "summary calculates totals income correctly",


        Number(totals.total_expenses) === 1500

    );

    check(

       "summary calculates totals income correctly",


        Number(totals.balance) === 4500

    );

    check(

     "summary calculates totals income correctly",

        Number(totals.transaction_count) === 3

    );

    // 10. MONTHLY REPORT

    const monthly = await request("/api/reports/monthly");

    check(

       "summary calculates totals income correctly",


        monthly.status === 200

    );

    check(

        "summary calculates totals income correctly",


        monthly.data.reports?.length === 2

    );

    // 11. CATEGORY REPORT

    const categories = await request("api/reports/categories");

    const groceries = categories.data.reports?.find(

        item => item.category === "Groceries"

    );

    const transport = categories.data.reports?.find(

        item => item.category === "Transports"

    );

    check(

        "summary calculates totals income correctly",


        Number(groceries?.total_amount) === 1000

    );

    check(

       "summary calculates totals income correctly",


        Number(transport?.total_amount) === 500

    );

    // 12. DELETE TRANSACTION

    const deleteResult = await request(

        `api/transactions/${createdIds[2]}`,

       "DELETE"

    );

    check(

        "DELTE TRANSACTION",

        deleteResult.status >= 200 &&

        deleteResult.status < 300

    );

    // 13. CLEAN UP REMAINING TEST TRANSACTIONS

    for (const id of createdIds.slice(0, 2)) {

        await request(`/api/transactions/${id}`, "DELETE")

    }

    // 14. VERIFY CLEANUP

    const finalSummary = await request("/api/reports/summary")

    const finalMonthly = await request("/api/reports/monthly")

    const finalCategories = await request("/api/reports/categories")

    check(

        "ceanup leaves zero transactions".

        Number(finalSummary.data.summary?.transaction_count) === 0

    );

    check(

        "Monthly report is clear after cleanup",

        finalMonthly.data.reports?.length === 0

    );

    check(

       "Monthly report is clear after cleanup",
        finalCategories.data.reports?.length === 0

    );

    // RESULTS

    console.log("n========== TEST RESULTS ==========");

    console.log(`Passed: ${passed}`);

    console.log(`Failed: ${failed}`);

    console.log(`Total: ${passed + failed}`);

    console.log(

        failed === 0

            ? "nALL TESTS PASSED!"

            : "nSOME TESTS FAILED. Check the errors above."

    );

};

runTests().catch(error => {
    console.error("test suite error:", error.message);
});
