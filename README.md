# Finance Data Processing and Access Control Backend
🌍 **Live API Deployment:** [https://finance-backend-api-xxxx.onrender.com](https://finance-backend-api-xxxx.onrender.com)

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
```
## 🧠 Design Decisions, Assumptions, & Tradeoffs (Criteria 7)
* **Database Tradeoff:** PostgreSQL was chosen over NoSQL. While NoSQL is faster for unstructured data, a relational database is much safer for financial data to ensure strict relational integrity between Users and their Financial Records.
* **Access Control Assumption:** I assumed that `VIEWER` roles should only see aggregated dashboard data (not individual raw transactions), while `ANALYST` roles can view raw records but cannot modify them. Only `ADMIN` users can create, update, or delete records.
* **Dashboard Performance:** Instead of fetching all records and doing the math in Node.js (which would crash at scale), the `/api/dashboard/summary` endpoint utilizes Prisma's native database aggregation (`_sum`, `groupBy`).

## ⚙️ Local Setup Instructions (Criteria 7)

### 1. Clone the repository
```bash
git clone https://github.com/rahulvandrangi09/finance-dashboard-backend.git
cd finance-dashboard-backend
```
### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```bash
# PostgreSQL Connection String
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/finance_db?schema=public"

# Secret key for signing JWTs
JWT_SECRET="your_super_secret_key"

# Application Port
PORT=3000
```

### 4. Database Setup
Run the following commands to generate the Prisma client and push the schema to your PostgreSQL database:
```bash
npx prisma generate
npx prisma db push
```

### 5. Start the Server
```bash
npm run dev
# OR
node src/server.js
```


## 🎯 Additional Thoughtfulness (Criteria 8)
To improve usability, clarity, and system reliability beyond the core requirements, I implemented:
* **Pagination & Search:** Added `page`, `limit`, and case-insensitive search to the `GET /records` route to handle large datasets efficiently.
* **Partial Updates:** The `PUT` endpoint uses Zod's `.partial()` validation, allowing clients to update single fields seamlessly without sending the entire object payload.
* **Security & Rate Limiting:** Implemented `express-rate-limit` (100 requests / 15 mins) to prevent brute-force attacks, and `helmet` to secure HTTP headers.
