import React from "react";

interface CompleteSetupProps {
  onFinish: () => void;
}

const CompleteSetup: React.FC<CompleteSetupProps> = ({ onFinish }) => {
  return (
    <div className="text-center">
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-4">Setup Complete!</h1>

      <p className="text-gray-600 mb-8 max-w-lg mx-auto">
        Congratulations! You've successfully set up your personal finance
        dashboard. You're now ready to start tracking your finances and reaching
        your financial goals.
      </p>

      <div className="bg-blue-50 p-6 rounded-lg max-w-lg mx-auto mb-8">
        <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
        <ul className="text-left text-blue-700 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Explore your dashboard to see your financial summary</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Track your expenses regularly to stay on budget</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Set up savings goals to plan for your future</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              Update your assets and liabilities to monitor your net worth
            </span>
          </li>
        </ul>
      </div>

      <button
        onClick={onFinish}
        className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default CompleteSetup;
