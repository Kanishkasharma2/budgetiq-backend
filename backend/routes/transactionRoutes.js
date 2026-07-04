const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getMonthlyTrend,
} = require("../controllers/transactionController");
const { protect } = require("../middleware/auth");

// all routes below require login
router.use(protect);

router.route("/").post(createTransaction).get(getTransactions);
router.get("/summary", getSummary);
router.get("/monthly-trend", getMonthlyTrend);
router.route("/:id").put(updateTransaction).delete(deleteTransaction);

module.exports = router;
