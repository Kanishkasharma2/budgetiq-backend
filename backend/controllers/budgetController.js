const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

// @route  POST /api/budgets   { category, monthlyLimit, month: "2026-07" }
const setBudget = async (req, res) => {
  try {
    const { category, monthlyLimit, month } = req.body;

    if (!category || !monthlyLimit || !month) {
      return res.status(400).json({ message: "Category, limit and month are required" });
    }

    // upsert: create if doesn't exist, update if it does
    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category, month },
      { monthlyLimit },
      { new: true, upsert: true }
    );

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/budgets?month=2026-07
// Returns each budget along with how much has been spent so far (for progress bars)
const getBudgets = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: "month query param is required (e.g. 2026-07)" });
    }

    const budgets = await Budget.find({ user: req.user._id, month });

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const results = await Promise.all(
      budgets.map(async (b) => {
        const spent = await Transaction.aggregate([
          {
            $match: {
              user: req.user._id,
              category: b.category,
              type: "expense",
              date: { $gte: startDate, $lt: endDate },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        return {
          _id: b._id,
          category: b.category,
          monthlyLimit: b.monthlyLimit,
          spent: spent[0]?.total || 0,
        };
      })
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { setBudget, getBudgets };
