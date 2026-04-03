# Finance Data Processing and Access Control Backend

A robust, secure, and highly optimized REST API built for a finance dashboard system. This backend handles financial record management, user authentication, role-based access control (RBAC), and provides efficient data aggregation for dashboard insights.

## 🚀 Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** PostgreSQL
* **ORM:** Prisma (v6)
* **Authentication:** JSON Web Tokens (JWT) & bcryptjs
* **Validation:** Zod
* **Security:** Helmet & Express Rate Limit

## ✨ Key Features Implemented
* **User & Role Management:** Secure registration, login, and Admin-only user status updates.
* **Role-Based Access Control (RBAC):** Custom middleware to enforce strict permissions across different user roles (`VIEWER`, `ANALYST`, `ADMIN`).
* **Financial Records CRUD:** Full management of income and expense records with robust input validation.
* **Advanced Querying:** Implemented pagination (`page`, `limit`), date filtering, and case-insensitive search functionality.
* **High-Performance Dashboard Aggregations:** Utilized Prisma's native `aggregate` and `groupBy` functions to calculate net balances and category totals at the database level, avoiding heavy Node.js processing.
* **Security First:** Implemented rate-limiting (100 requests per 15 minutes), Helmet for HTTP header security, and password hashing.

## 📂 Project Structure

```text
├── prisma/
│   └── schema.prisma         # Database schema and models
├── src/
│   ├── controllers/          # Business logic and request handling
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   └── recordController.js
│   ├── middleware/           # Custom Express middlewares
│   │   └── authMiddleware.js # JWT verification and RBAC guards
│   ├── routes/               # API endpoint definitions
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── recordRoutes.js
│   ├── prisma.js             # Singleton Prisma client instance
│   └── server.js             # Express application entry point
├── .env                      # Environment variables (ignored in git)
└── package.json