require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const connectDB = require("./config/db");
const Transaction = require("./models/Transaction");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

connectDB();

// Runs once a day at midnight. For every recurring transaction (e.g. rent,
// subscriptions), if today matches its billing day and no entry exists yet
// this month, it auto-creates the new transaction so the user doesn't have
// to log it manually every month.
cron.schedule("0 0 * * *", async () => {
  try {
    const recurringTemplates = await Transaction.find({ isRecurring: true, recurringFrequency: "monthly" });
    const today = new Date();

    for (const template of recurringTemplates) {
      const billingDay = new Date(template.date).getDate();
      if (today.getDate() !== billingDay) continue;

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const alreadyExists = await Transaction.findOne({
        user: template.user,
        category: template.category,
        description: template.description,
        isRecurring: true,
        date: { $gte: startOfMonth },
      });

      if (!alreadyExists) {
        await Transaction.create({
          user: template.user,
          type: template.type,
          amount: template.amount,
          category: template.category,
          description: template.description,
          date: today,
          isRecurring: true,
          recurringFrequency: "monthly",
        });
      }
    }
  } catch (err) {
    console.error("Recurring transaction cron failed:", err.message);
  }
});

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);

app.get("/", (req, res) => {
  res.send("BudgetIQ API is running");
});

// basic error handler (catches anything thrown that isn't already handled)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
