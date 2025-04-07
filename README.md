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
- **State Management**: React Context API
- **Data Visualization**: Recharts
- **Routing**: React Router
- **Storage**: Currently using localStorage (with plans to migrate to a database)

## Current Data Storage

The application currently uses browser localStorage for data persistence. This means:

- Data is stored locally in the user's browser
- Data will persist between sessions on the same device/browser
- Data is NOT synchronized between different devices
- Data may be lost if the browser storage is cleared

## Future Database Plans

We plan to migrate from localStorage to a proper database solution. Options being considered:

1. **MongoDB** - A document-oriented database that works well with our existing data structure
2. **Firebase Firestore** - For real-time updates and built-in authentication
3. **PostgreSQL** - For more complex financial calculations and relationships

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/economy-tracker.git
   cd economy-tracker
   ```

2. Install dependencies:

   ```
   npm install
   ```

   or

   ```
   yarn install
   ```

3. Start the development server:

   ```
   npm start
   ```

   or

   ```
   yarn start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Building for Production

To build the app for production:

```
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

- `/src/components`: Reusable UI components
- `/src/context`: Application state and data management
- `/src/pages`: Main application pages
- `/src/types`: TypeScript type definitions
- `/src/utils`: Utility functions and helpers
- `/src/services`: Service layers for data processing

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
