import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User, { IUser, Income } from "../models/userModel";

interface UserRequest extends Request {
  user?: IUser;
}

/**
 * Get all user data
 * @route   GET /api/user-data
 * @access  Private
 */
const getUserData = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    incomes: user.incomes || [],
    expenses: user.expenses || [],
    assets: user.assets || [],
    liabilities: user.liabilities || [],
  });
});

/**
 * Add an income to user
 * @route   POST /api/user-data/incomes
 * @access  Private
 */
const addIncome = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const {
    name,
    grossAmount,
    netAmount,
    taxRate,
    frequency,
    date,
    type,
    isRecurring,
  } = req.body;

  if (
    !name ||
    !grossAmount ||
    !netAmount ||
    !taxRate ||
    !frequency ||
    !date ||
    !type
  ) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const newIncome = {
    name,
    grossAmount,
    netAmount,
    taxRate,
    frequency,
    date,
    type,
    isRecurring,
  };

  user.incomes.push(newIncome as Income);
  await user.save();

  res.status(201).json(user.incomes[user.incomes.length - 1]);
});

/**
 * Update an income
 * @route   PUT /api/user-data/incomes/:id
 * @access  Private
 */
const updateIncome = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const income = user.incomes.find(
    (inc) => inc._id?.toString() === req.params.id
  );

  if (!income) {
    res.status(404);
    throw new Error("Income not found");
  }

  const {
    name,
    grossAmount,
    netAmount,
    taxRate,
    frequency,
    date,
    type,
    isRecurring,
  } = req.body;

  // Update income fields if provided
  if (name) income.name = name;
  if (grossAmount !== undefined) income.grossAmount = grossAmount;
  if (netAmount !== undefined) income.netAmount = netAmount;
  if (taxRate !== undefined) income.taxRate = taxRate;
  if (frequency) income.frequency = frequency;
  if (date) income.date = date;
  if (type) income.type = type;
  if (isRecurring !== undefined) income.isRecurring = isRecurring;

  await user.save();

  res.status(200).json(income);
});

/**
 * Delete an income
 * @route   DELETE /api/user-data/incomes/:id
 * @access  Private
 */
const deleteIncome = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const incomeIndex = user.incomes.findIndex(
    (income) => income._id?.toString() === req.params.id
  );

  if (incomeIndex === -1) {
    res.status(404);
    throw new Error("Income not found");
  }

  user.incomes.splice(incomeIndex, 1);
  await user.save();

  res.status(200).json({ message: "Income removed" });
});

/**
 * Add an expense to user
 * @route   POST /api/user-data/expenses
 * @access  Private
 */
const addExpense = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const {
    name,
    amount,
    category,
    isRecurring,
    date,
    necessityLevel,
    frequency,
    notes,
  } = req.body;

  // Check if required fields are provided
  if (!name || !amount || !category || !date) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const newExpense = {
    name,
    amount,
    category,
    isRecurring: isRecurring || false,
    date,
    necessityLevel,
    frequency,
    notes,
  };

  user.expenses.push(newExpense);
  await user.save();

  res.status(201).json(user.expenses[user.expenses.length - 1]);
});

/**
 * Update an expense
 * @route   PUT /api/user-data/expenses/:id
 * @access  Private
 */
const updateExpense = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const expense = user.expenses.find(
    (exp) => exp?._id?.toString() === req.params.id
  );

  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }

  const {
    name,
    amount,
    category,
    isRecurring,
    date,
    necessityLevel,
    frequency,
    notes,
  } = req.body;

  // Update expense fields if provided
  if (name) expense.name = name;
  if (amount !== undefined) expense.amount = amount;
  if (category) expense.category = category;
  if (isRecurring !== undefined) expense.isRecurring = isRecurring;
  if (date) expense.date = date;
  if (necessityLevel !== undefined) expense.necessityLevel = necessityLevel;
  if (frequency !== undefined) expense.frequency = frequency;
  if (notes !== undefined) expense.notes = notes;

  await user.save();

  res.status(200).json(expense);
});

/**
 * Delete an expense
 * @route   DELETE /api/user-data/expenses/:id
 * @access  Private
 */
const deleteExpense = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const expenseIndex = user.expenses.findIndex(
    (expense) => expense?._id?.toString() === req.params.id
  );

  if (expenseIndex === -1) {
    res.status(404);
    throw new Error("Expense not found");
  }

  user.expenses.splice(expenseIndex, 1);
  await user.save();

  res.status(200).json({ message: "Expense removed" });
});

/**
 * Add an asset to user
 * @route   POST /api/user-data/assets
 * @access  Private
 */
const addAsset = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const {
    name,
    type,
    value,
    initialValue,
    purchaseDate,
    category,
    notes,
    savingsGoalId,
  } = req.body;

  // Check if required fields are provided
  if (!name || !type || value === undefined || !purchaseDate || !category) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const newAsset = {
    name,
    type,
    value,
    initialValue: initialValue || value,
    purchaseDate,
    category,
    notes,
    savingsGoalId: savingsGoalId || null,
    values: [],
    deposits: [],
  };

  user.assets.push(newAsset);
  await user.save();

  res.status(201).json(user.assets[user.assets.length - 1]);
});

/**
 * Update an asset
 * @route   PUT /api/user-data/assets/:id
 * @access  Private
 */
const updateAsset = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const asset = user.assets.find(
    (ast) => ast?._id?.toString() === req.params.id
  );

  if (!asset) {
    res.status(404);
    throw new Error("Asset not found");
  }

  const {
    name,
    type,
    value,
    initialValue,
    purchaseDate,
    category,
    notes,
    savingsGoalId,
  } = req.body;

  // Update asset fields if provided
  if (name) asset.name = name;
  if (type) asset.type = type;
  if (value !== undefined) asset.value = value;
  if (initialValue !== undefined) asset.initialValue = initialValue;
  if (purchaseDate) asset.purchaseDate = purchaseDate;
  if (category) asset.category = category;
  if (notes !== undefined) asset.notes = notes;
  if (savingsGoalId !== undefined) asset.savingsGoalId = savingsGoalId;

  await user.save();

  res.status(200).json(asset);
});

/**
 * Delete an asset
 * @route   DELETE /api/user-data/assets/:id
 * @access  Private
 */
const deleteAsset = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const assetIndex = user.assets.findIndex(
    (asset) => asset?._id?.toString() === req.params.id
  );

  if (assetIndex === -1) {
    res.status(404);
    throw new Error("Asset not found");
  }

  user.assets.splice(assetIndex, 1);
  await user.save();

  res.status(200).json({ message: "Asset removed" });
});

/**
 * Add a liability to user
 * @route   POST /api/user-data/liabilities
 * @access  Private
 */
const addLiability = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const { name, type, amount, interestRate, minimumPayment, dueDate, notes } =
    req.body;

  // Check if required fields are provided
  if (
    !name ||
    !type ||
    amount === undefined ||
    interestRate === undefined ||
    minimumPayment === undefined ||
    !dueDate
  ) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const newLiability = {
    name,
    type,
    amount,
    interestRate,
    minimumPayment,
    dueDate,
    notes,
  };

  user.liabilities.push(newLiability);
  await user.save();

  res.status(201).json(user.liabilities[user.liabilities.length - 1]);
});

/**
 * Update a liability
 * @route   PUT /api/user-data/liabilities/:id
 * @access  Private
 */
const updateLiability = asyncHandler(
  async (req: UserRequest, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, no user found");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const liability = user.liabilities.find(
      (lib) => lib?._id?.toString() === req.params.id
    );

    if (!liability) {
      res.status(404);
      throw new Error("Liability not found");
    }

    const { name, type, amount, interestRate, minimumPayment, dueDate, notes } =
      req.body;

    // Update liability fields if provided
    if (name) liability.name = name;
    if (type) liability.type = type;
    if (amount !== undefined) liability.amount = amount;
    if (interestRate !== undefined) liability.interestRate = interestRate;
    if (minimumPayment !== undefined) liability.minimumPayment = minimumPayment;
    if (dueDate) liability.dueDate = dueDate;
    if (notes !== undefined) liability.notes = notes;

    await user.save();

    res.status(200).json(liability);
  }
);

/**
 * Delete a liability
 * @route   DELETE /api/user-data/liabilities/:id
 * @access  Private
 */
const deleteLiability = asyncHandler(
  async (req: UserRequest, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, no user found");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const liabilityIndex = user.liabilities.findIndex(
      (liability) => liability?._id?.toString() === req.params.id
    );

    if (liabilityIndex === -1) {
      res.status(404);
      throw new Error("Liability not found");
    }

    user.liabilities.splice(liabilityIndex, 1);
    await user.save();

    res.status(200).json({ message: "Liability removed" });
  }
);

/**
 * Update an asset value
 * @route   PUT /api/user-data/assets/:id/value
 * @access  Private
 */
const updateAssetValue = asyncHandler(
  async (req: UserRequest, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, no user found");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const asset = user.assets.find(
      (ast) => ast?._id?.toString() === req.params.id
    );

    if (!asset) {
      res.status(404);
      throw new Error("Asset not found");
    }

    const { value, date } = req.body;

    if (value === undefined || !date) {
      res.status(400);
      throw new Error("Please provide value and date");
    }

    // Update asset's current value
    asset.value = value;

    // Add to value history array
    if (!asset.values) asset.values = [];

    asset.values.push({
      date,
      value,
    });

    await user.save();

    res.status(200).json(asset);
  }
);

/**
 * Add a deposit to an asset
 * @route   POST /api/user-data/assets/:id/deposit
 * @access  Private
 */
const addAssetDeposit = asyncHandler(
  async (req: UserRequest, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, no user found");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const asset = user.assets.find(
      (ast) => ast?._id?.toString() === req.params.id
    );

    if (!asset) {
      res.status(404);
      throw new Error("Asset not found");
    }

    const { amount, date, notes } = req.body;

    if (amount === undefined || !date) {
      res.status(400);
      throw new Error("Please provide amount and date");
    }

    // Initialize deposits array if it doesn't exist
    if (!asset.deposits) asset.deposits = [];

    // Add new deposit
    asset.deposits.push({
      date,
      amount,
      notes,
    });

    await user.save();

    res.status(201).json(asset);
  }
);

export {
  getUserData,
  addIncome,
  updateIncome,
  deleteIncome,
  addExpense,
  updateExpense,
  deleteExpense,
  addAsset,
  updateAsset,
  deleteAsset,
  addLiability,
  updateLiability,
  deleteLiability,
  updateAssetValue,
  addAssetDeposit,
};
