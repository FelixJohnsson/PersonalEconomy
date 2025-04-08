# Economy Tracker

Economy Tracker is a comprehensive personal finance management application built with React and TypeScript. It helps users track their finances, plan their budget, monitor their net worth, and set savings goals.

![Economy Tracker](public/economy-tracker-screenshot.png)

## Features

Economy Tracker offers a wide range of financial management tools:

- **Dashboard**: Overview of your financial status including income, expenses, and savings rate
- **Expense Tracking**: Monitor and categorize your daily expenses
- **Income Management**: Track all your income sources
- **Asset Management**: Monitor your assets and their value changes over time
- **Liability Tracking**: Keep track of your debts and loans
- **Net Worth Calculation**: Automatically calculate your net worth based on assets and liabilities
- **Budget Planning**: Create and manage your monthly budget by category
- **Subscription Management**: Track recurring subscriptions and their renewal dates
- **Savings Goals**: Set financial goals and track your progress
- **Future Tracker**: Project future savings and calculate required savings rates
- **What-If Calculator**: Run financial scenarios to plan your financial future
- **Tax Return History**: Keep records of your tax returns
- **Notes**: Save financial notes and ideas

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **State Management**: React Context API
- **Data Visualization**: Recharts
- **Routing**: React Router
- **Authentication**: JWT (JSON Web Tokens)

## Data Storage

The application now uses MongoDB for data persistence, replacing the previous localStorage implementation. This provides several benefits:

- Secure storage of financial data
- Multi-device access through user authentication
- Data backup and recovery capabilities
- Scalability for growing financial data
- Ability to share data with family members (future feature)

### MongoDB Database Structure

The MongoDB database contains collections for all financial data categories:

- Users (with authentication)
- Incomes
- Expenses
- Assets
- Liabilities
- Savings Goals
- Subscriptions
- Budget Items
- Notes
- Tax Returns

Each data collection is secured with user-specific access control.

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/economy-tracker.git
   cd economy-tracker
   ```

2. Install frontend dependencies:

   ```
   npm install
   ```

3. Install backend dependencies:

   ```
   cd server
   npm install
   cd ..
   ```

4. Configure environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/economy-tracker

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # JWT Secret for Authentication
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRE=30d

   # CORS Configuration
   CLIENT_URL=http://localhost:3000
   ```

5. Start the backend server:

   ```
   cd server
   npm run dev
   ```

6. In a new terminal, start the frontend:

   ```
   npm start
   ```

7. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Building for Production

To build the app for production:

```
# Build the frontend
npm run build

# Prepare the backend for production
cd server
npm install --production
```

## Project Structure

- `/src` - Frontend application code

  - `/components`: Reusable UI components
  - `/context`: Application state and data management
  - `/pages`: Main application pages
  - `/types`: TypeScript type definitions
  - `/utils`: Utility functions and helpers
  - `/services`: API service layers for backend communication

- `/server` - Backend application code
  - `/src/config`: Configuration files
  - `/src/controllers`: Request handlers
  - `/src/middleware`: Custom middleware functions
  - `/src/models`: Mongoose data models
  - `/src/routes`: API route definitions
  - `/src/utils`: Utility functions

## API Endpoints

The backend provides the following API endpoints:

- **Authentication**

  - `POST /api/users` - Register a new user
  - `POST /api/users/login` - Login and get token
  - `GET /api/users/profile` - Get user profile
  - `PUT /api/users/profile` - Update user profile

- **Financial Data** (all require authentication)
  - `/api/incomes` - Income management
  - `/api/expenses` - Expense tracking
  - `/api/assets` - Asset management
  - `/api/liabilities` - Liability tracking
  - `/api/savings-goals` - Savings goal management
  - `/api/subscriptions` - Subscription management
  - `/api/budget` - Budget planning
  - `/api/notes` - Notes management
  - `/api/tax-returns` - Tax return records

Each resource supports standard CRUD operations.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons from [Heroicons](https://heroicons.com/)
- Charts powered by [Recharts](https://recharts.org/)
- UI styled with [TailwindCSS](https://tailwindcss.com/)
