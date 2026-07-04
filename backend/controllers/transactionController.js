const Transaction = require("../models/Transaction");

// @route  POST /api/transactions
const createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date, isRecurring, recurringFrequency } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({ message: "Type, amount and category are required" });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount,
      category,
      description,
      date: date || Date.now(),
      isRecurring: isRecurring || false,
      recurringFrequency: recurringFrequency || null,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/transactions   (supports ?category=&type=&startDate=&endDate=)
const getTransactions = async (req, res) => {
  try {
    const { category, type, startDate, endDate } = req.query;

    const filter = { user: req.user._id };
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    Object.assign(transaction, req.body);
    await transaction.save();

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/transactions/summary
// Returns totals needed for dashboard cards + category breakdown
const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const totals = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const income = totals.find((t) => t._id === "income")?.total || 0;
    const expense = totals.find((t) => t._id === "expense")?.total || 0;

    const categoryBreakdown = await Transaction.aggregate([
      { $match: { user: userId, type: "expense" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({
      balance: income - expense,
      totalIncome: income,
      totalExpense: expense,
      categoryBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/transactions/monthly-trend
// Returns total expense per month for the last 6 months (for the trend chart)
const getMonthlyTrend = async (req, res) => {
  try {
    const userId = req.user._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const trend = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: "expense",
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(trend);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getMonthlyTrend,
};
