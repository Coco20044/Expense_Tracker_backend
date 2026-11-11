const swaggerJsdoc = require("swagger-jsdoc");
const options = { definition: { openapi: "3.0.0",
    info: {
        title: "Expense Tracker API",
        version: "1.0.0",
        description: "API documentation for the Expense Tracker application"
    },

    servers: [
        {
            url: "http://localhost:3000",
            description: "Local development server"
        }
    ],

    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        }
    }
},

apis: ["./routes/*.js"]
};
const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;