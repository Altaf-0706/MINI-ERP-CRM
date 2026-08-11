# Mini ERP + CRM Operations Portal

This is a Full-Stack Mini ERP & CRM system built for a wholesale/distribution company. It covers customer management, product/inventory tracking, and sales challan creation with automated stock deduction.

## Tech Stack
- **Frontend**: React, Vite, TypeScript, Vanilla CSS
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: SQLite (Zero-config local database)

## Core Modules Implemented
1. **Authentication & Roles**: JWT-based auth with Admin, Sales, Warehouse, and Accounts roles.
2. **Customer CRM**: Add, Edit, Search, and track customer status (Lead/Active/Inactive).
3. **Product & Inventory**: SKU tracking, minimum stock alerts, and automated stock movement logs (IN/OUT).
4. **Sales Challan**: Multi-product selection, auto-generated challan numbers, draft vs confirmed states, and strict negative-stock prevention.

## Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/en/) (v16+)

### 2. Backend Setup
Navigate to the `backend` directory, install dependencies, and run Prisma migrations (which will automatically create the local SQLite database):
```bash
cd backend
npm install
npx prisma db push
```

Start the backend development server:
```bash
npm run dev
```
The API will be available at `http://localhost:5000/api`.

### 4. Frontend Setup
In a new terminal window, navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The React application will be available at `http://localhost:5173`.

## Demo Accounts
- **Admin**: admin@minierp.com / admin123
- **Sales**: sales@minierp.com / sales123

> Note: To use these demo accounts, you'll first need to register them through the `/api/auth/register` endpoint using Postman, as only the login UI is exposed in the frontend. Alternatively, you can create a simple Prisma seed script.
