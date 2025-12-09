You are an expert backend developer specializing in **Express.js** and Node.js best practices.

**Goal:** Create a complete, production-ready Express.js API project that follows a clean **MVC-like architecture** (Controllers, Services, Routes) and uses a **JSON Server** as a mock database backend via an `axios`-based service layer. The project must be configured with **Authentication (JWT & bcryptjs)**, **Authorization (Role-based)**, **Security (Helmet, CORS, Rate Limiting)**, **Logging**, and a robust **Testing** setup using **Jest** and **Supertest** for unit and integration tests. The project must also include a **GitHub Actions CI/CD workflow** file.

**Project Name:** `expresswithgithubactions`

**Deliverables:**

1.  **Project Structure:** Output the complete directory tree.
2.  **Setup and Dependencies:** List the `npm install` commands for production and dev dependencies.
3.  **Configuration Files:** Provide the content for `package.json`, `jest.config.js`, `.env.example`, `.eslintrc.js`, and `.prettierrc`.
4.  **Database & Scripts:** Provide the content for the initial `db/db.json` and the `scripts/reset-db.js` file.
5.  **Core API Files (Source Code):**
    * **Configuration:** `src/config/config.js`
    * **Database Service:** `src/services/db.service.js` (Axios client for JSON Server CRUD).
    * **Utils:** `src/utils/jwt.utils.js` and `src/utils/validation.js` (Express-validator setup).
    * **Middleware:** `src/middleware/logger.js`, `src/middleware/auth.js` (JWT protection and role authorization), and `src/middleware/errorHandler.js`.
    * **Services:** `src/services/auth.service.js` and `src/services/task.service.js`.
    * **Controllers:** `src/controllers/auth.controller.js` and `src/controllers/task.controller.js`.
    * **Routes:** `src/routes/auth.routes.js` and `src/routes/task.routes.js`.
    * **Entry Points:** `src/app.js` (Express setup) and `server.js` (Server startup).
6.  **Testing Files:**
    * `__tests__/setup.js` (Sets up a temporary JSON Server for isolated testing).
    * `__tests__/integration/auth.test.js` (Complete content for registration and login integration tests).
7.  **CI/CD Workflow:** Provide the content for the GitHub Actions workflow file: **`.github/workflows/ci.yml`** (or `.github/workflows/nodejs.yml` as you specified)

**Constraints & Details:**

* Authentication must use **JWT Bearer tokens** and **bcryptjs** for passwords.
* Authorization must implement a `protect` middleware and an `authorize` factory function to check user roles (`user` or `admin`).
* The `package.json` must include a `dev` script that uses `concurrently` to run both the main Express server with `nodemon` and the `json-server` simultaneously.
* All Express routes should be wrapped in **async/await** with `try/catch` blocks that call `next(error)`.
* The **GitHub Actions Workflow** file (`.github/workflows/ci.yml`) must be a standard Node.js CI setup that runs tests on `push` and `pull_request` to the `main` branch, targeting Node.js **version 18.x**.

---
**Content for .github/workflows/ci.yml:**

```yaml
name: Node.js CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x]

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test


