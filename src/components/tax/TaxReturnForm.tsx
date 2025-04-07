import React, { useState, useEffect } from "react";
import { TaxReturn } from "../../types";

interface TaxReturnFormProps {
  taxReturn?: TaxReturn;
  onSave: (taxReturn: Omit<TaxReturn, "id">) => void;
  onCancel: () => void;
}

const TaxReturnForm: React.FC<TaxReturnFormProps> = ({
  taxReturn,
  onSave,
  onCancel,
}) => {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [declaredIncome, setDeclaredIncome] = useState<number>(0);
  const [taxPaid, setTaxPaid] = useState<number>(0);
  const [returnAmount, setReturnAmount] = useState<number>(0);
  const [submissionDate, setSubmissionDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (taxReturn) {
      setYear(taxReturn.year);
      setDeclaredIncome(taxReturn.declaredIncome);
      setTaxPaid(taxReturn.taxPaid);
      setReturnAmount(taxReturn.returnAmount);
      setSubmissionDate(taxReturn.submissionDate);
      setNotes(taxReturn.notes || "");
    }
  }, [taxReturn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      year,
      declaredIncome,
      taxPaid,
      returnAmount,
      submissionDate,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700"
          >
            Tax Year
          </label>
          <input
            type="number"
            id="year"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            min={2000}
            max={new Date().getFullYear()}
          />
        </div>

        <div>
          <label
            htmlFor="submissionDate"
            className="block text-sm font-medium text-gray-700"
          >
            Submission Date
          </label>
          <input
            type="date"
            id="submissionDate"
            value={submissionDate}
            onChange={(e) => setSubmissionDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="declaredIncome"
            className="block text-sm font-medium text-gray-700"
          >
            Declared Income
          </label>
          <div className="relative rounded-md shadow-sm w-32">
            <input
              type="number"
              id="declaredIncome"
              value={declaredIncome}
              onChange={(e) => setDeclaredIncome(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 pl-2 focus:border-blue-500 focus:ring-blue-500"
              required
              min={0}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="taxPaid"
            className="block text-sm font-medium text-gray-700"
          >
            Tax Paid
          </label>
          <div className="w-32 relative rounded-md shadow-sm">
            <input
              type="number"
              id="taxPaid"
              value={taxPaid}
              onChange={(e) => setTaxPaid(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 pl-2 focus:border-blue-500 focus:ring-blue-500"
              required
              min={0}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="returnAmount"
            className="block text-sm font-medium text-gray-700"
          >
            Return Amount
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="number"
              id="returnAmount"
              value={returnAmount}
              onChange={(e) => setReturnAmount(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 pl-7 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Positive for refunds, negative for additional payments
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {taxReturn ? "Update" : "Add"} Tax Return
        </button>
      </div>
    </form>
  );
};

export default TaxReturnForm;
