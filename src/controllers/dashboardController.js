const prisma = require("../prisma");

const getDashboardSummary = async (req, res) => {
  try {
    const [incomeAggregate, expenseAggregate, recentActivity, categoryTotals] =
      await Promise.all([
        prisma.record.aggregate({
          _sum: { amount: true },
          where: { type: "INCOME" },
        }),
        prisma.record.aggregate({
          _sum: { amount: true },
          where: { type: "EXPENSE" },
        }),
        prisma.record.findMany({
          take: 5,
          orderBy: { date: "desc" },
          select: {
            id: true,
            amount: true,
            type: true,
            category: true,
            date: true,
          },
        }),
        prisma.record.groupBy({
          by: ["category", "type"],
          _sum: { amount: true },
        }),
      ]);

    const totalIncome = Number(incomeAggregate._sum.amount || 0);
    const totalExpense = Number(expenseAggregate._sum.amount || 0);
    const netBalance = totalIncome - totalExpense;

    const formattedCategories = categoryTotals.map((item) => ({
      category: item.category,
      type: item.type,
      total: Number(item._sum.amount || 0),
    }));

    res.json({
      success: true,
      data: {
        overview: {
          totalIncome,
          totalExpense,
          netBalance,
        },
        recentActivity,
        categoryBreakdown: formattedCategories,
      },
    });
  } catch (error) {
    console.error("DASHBOARD SUMMARY ERROR:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching summary" });
  }
};

module.exports = {
  getDashboardSummary,
}
