const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");
const { z, ZodError } = require("zod");
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["VIEWER", "ANALYST", "ADMIN"]).optional(),
});

const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role || "VIEWER",
      },
    });
    res.status(201).json({
      success: true,
      message: `${user.role} registered successfully`,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors.map((e) => e.message).join(", "),
      });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    res.json({
      success: true,
      token,
      message: "Login successful",
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateUserStatus = async (req, res) => {
  try{
    const {id} = req.params;
    const {role, isActive} = req.body;
    const user = await prisma.user.findUnique({where: {id}});
    if(!user){
      return res.status(404).json({success: false, message: "User not found"});
    } 
    const updatedUser = await prisma.user.update({
      where: {id},
      data: {
        ...(role && {role}),
        ...(isActive !== undefined && {isActive}),
      },
      select: {id:true, email: true, role: true, isActive: true},
    });
    res.json({
      success: true,
      message: "User status updated successfully",
        user: updatedUser,
      });
  }catch (error) {
    console.error("UPDATE USER ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
module.exports = { register, login, updateUserStatus };
