import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import WelcomeStep from "./steps/WelcomeStep";
import IncomeSetupForm from "./steps/IncomeSetupForm";
import ExpenseSetupForm from "./steps/ExpenseSetupForm";
import SubscriptionSetupForm from "./steps/SubscriptionSetupForm";
import AssetsSetupForm from "./steps/AssetsSetupForm";
import LiabilitiesSetupForm from "./steps/LiabilitiesSetupForm";
import BudgetSetupForm from "./steps/BudgetSetupForm";
import CompleteSetup from "./steps/CompleteSetup";
import Button from "../buttons/Button";
import Card from "../cards/Card";

// Steps for the setup process
enum SetupStep {
  WELCOME = 0,
  INCOME = 1,
  EXPENSES = 2,
  SUBSCRIPTIONS = 3,
  ASSETS = 4,
  LIABILITIES = 5,
  BUDGET = 6,
  COMPLETE = 7,
}

// Placeholder component for steps we haven't created yet
const PlaceholderStep: React.FC<{
  title: string;
  description: string;
  onNext: () => void;
  onBack: () => void;
}> = ({ title, description, onNext, onBack }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>

      <Card variant="info" size="lg" className="mb-6">
        <p className="text-center text-gray-500 py-10">
          This step would normally collect your {title.toLowerCase()}{" "}
          information.
          <br />
          For this demo, we'll skip the actual form.
        </p>
      </Card>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="secondary" size="md">
          Back
        </Button>
        <Button onClick={onNext} variant="primary" size="md">
          Continue
        </Button>
      </div>
    </div>
  );
};

const SetupGuide: React.FC = () => {
  const { completeSetup } = useAppContext();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<SetupStep>(SetupStep.WELCOME);
  const [progress, setProgress] = useState<number>(0);

  const totalSteps = Object.keys(SetupStep).length / 2; // Enum has duplicate values (string and number)

  // Update progress percentage
  const updateProgress = (step: SetupStep) => {
    setProgress(Math.round((step / (totalSteps - 1)) * 100));
  };

  // Go to next step
  const nextStep = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    updateProgress(nextStep);
  };

  // Go to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateProgress(prevStep);
    }
  };

  // Skip to dashboard and mark setup as complete
  const skipSetup = async () => {
    try {
      // Mark setup as complete even if user skips
      await completeSetup();
      console.log("Setup skipped and marked as complete");

      // Redirect to dashboard
      navigate("/");
    } catch (error) {
      console.error("Error during setup skip:", error);
      // Redirect anyway
      navigate("/");
    }
  };

  // Complete setup process
  const finishSetup = async () => {
    try {
      // Call the completeSetup method from AppContext
      await completeSetup();
      console.log("Setup completed successfully");

      // Redirect to dashboard
      navigate("/");
    } catch (error) {
      console.error("Error during setup completion:", error);
      // Redirect anyway since we want to get the user to the app
      navigate("/");
    }
  };

  // Function to render the current step
  const renderStep = () => {
    switch (currentStep) {
      case SetupStep.WELCOME:
        return <WelcomeStep onNext={nextStep} onSkip={skipSetup} />;
      case SetupStep.INCOME:
        return <IncomeSetupForm onNext={nextStep} onBack={prevStep} />;
      case SetupStep.EXPENSES:
        return <ExpenseSetupForm onNext={nextStep} onBack={prevStep} />;
      case SetupStep.SUBSCRIPTIONS:
        return <SubscriptionSetupForm onNext={nextStep} onBack={prevStep} />;
      case SetupStep.ASSETS:
        return <AssetsSetupForm onNext={nextStep} onBack={prevStep} />;
      case SetupStep.LIABILITIES:
        return <LiabilitiesSetupForm onNext={nextStep} onBack={prevStep} />;
      case SetupStep.BUDGET:
        return <BudgetSetupForm onNext={nextStep} onBack={prevStep} />;
      case SetupStep.COMPLETE:
        return <CompleteSetup onFinish={finishSetup} />;
      default:
        return <WelcomeStep onNext={nextStep} onSkip={skipSetup} />;
    }
  };

  // Render step indicator
  const stepNames = [
    "Welcome",
    "Income",
    "Expenses",
    "Subscriptions",
    "Assets",
    "Liabilities",
    "Budget",
    "Complete",
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress bar */}
      <div className="max-w-4xl mx-auto p-4 sm:px-6 lg:px-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  Setup Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {Math.round((currentStep / SetupStep.COMPLETE) * 100)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div
                style={{
                  width: `${Math.round(
                    (currentStep / SetupStep.COMPLETE) * 100
                  )}%`,
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {Object.entries(SetupStep)
            .filter(([key]) => !isNaN(Number(key))) // Filter only numeric keys
            .map(([key, step]) => {
              const stepNum = Number(key);
              return (
                <Button
                  key={key}
                  variant={
                    stepNum === currentStep
                      ? "primary"
                      : stepNum < currentStep
                      ? "success"
                      : "secondary"
                  }
                  size="sm"
                  onClick={() => {
                    // Allow navigating to previous steps but not forward
                    if (stepNum < currentStep) {
                      // Go to the selected step
                      setCurrentStep(stepNum);
                    }
                  }}
                  disabled={stepNum > currentStep}
                >
                  {stepNum < currentStep ? "✓" : stepNames[stepNum]}
                </Button>
              );
            })}
        </div>

        {/* Current step content */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-8">
            {renderStep()}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between">
          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {totalSteps}
          </div>
          <div className="text-sm text-gray-500">
            {currentStep < SetupStep.COMPLETE && (
              <button
                onClick={skipSetup}
                className="text-blue-600 hover:text-blue-800"
              >
                Skip setup and use empty data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;
