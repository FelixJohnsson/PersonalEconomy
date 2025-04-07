import React from "react";
import Button from "../../buttons/Button";
import Card from "../../cards/Card";

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext, onSkip }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
        Welcome to EconomyTracker
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Let's set up your financial information to make the most of this app.
        You can always edit this information later.
      </p>

      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        We'll guide you through setting up:
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card
          title="Income Sources"
          text="Your salary and other earnings"
          variant="info"
          size="md"
          isHoverable
        />

        <Card
          title="Regular Expenses"
          text="Bills, rent, and other recurring costs"
          variant="info"
          size="md"
          isHoverable
        />

        <Card
          title="Subscriptions"
          text="Monthly services and memberships"
          variant="info"
          size="md"
          isHoverable
        />

        <Card
          title="Assets & Liabilities"
          text="Your belongings and debts"
          variant="info"
          size="md"
          isHoverable
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Button onClick={onNext} variant="primary" size="lg" fullWidth>
          Get Started
        </Button>
        <Button onClick={onSkip} variant="ghost" size="lg" fullWidth>
          Skip & Start with Empty Data
        </Button>
      </div>
    </div>
  );
};

export default WelcomeStep;
