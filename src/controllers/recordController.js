const prisma = require("../prisma");
const { z, ZodError } = require("zod");

// validation schema
const recordSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Category is required"),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// creating records
const createRecord = async (req, res) => {
  try {
    const validatedData = recordSchema.parse(req.body);
    const record = await prisma.record.create({
      data: {
        ...validatedData,
        userId: req.user.userId,
      },
    });
    res.status(201).json({
      success: true,
      message: "Record Created",
      data: record,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors,
      });
    }
    console.error("Error creating record:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating record",
    });
  }
};

// getting records
const getRecords = async (req, res) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause = {};
    if (type) whereClause.type = type;
    if (category) whereClause.category = category;
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    if (search) {
      whereClause.OR = [
        { notes: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const [totalRecords, records] = await Promise.all([
      prisma.record.count({ where: whereClause }),
      prisma.record.findMany({
        where: whereClause,
        orderBy: { date: "desc" },
        skip: skip,
        take: limitNumber,
      }),
    ]);

    res.status(200).json({
      success: true,
      metadata: {
        totalRecords,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalRecords / limitNumber),
        hasNextPage: pageNumber * limitNumber < totalRecords,
      },
      data: records,
    });
  } catch (error) {
    console.error("GET RECORDS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// updating records
const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = recordSchema.partial().parse(req.body);
    const existingRecord = await prisma.record.findUnique({ where: { id } });
    if (!existingRecord) {
      return res
        .status(404)
        .json({ success: false, message: "Record not found" });
    }

    const updatedRecord = await prisma.record.update({
      where: { id },
      data: validatedData,
    });

    res.json({
      success: true,
      message: "Record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error("UPDATE RECORD ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// deleting records
const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const exisingRecord = await prisma.record.findUnique({
      where: { id: id },
    });
    if (!exisingRecord) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }
    await prisma.record.delete({ where: { id: id } });
    res.status(200).json({
      success: true,
      message: "Record deleted successfully",
    });
  } catch (error) {
    console.error("DELETE RECORD ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
};
