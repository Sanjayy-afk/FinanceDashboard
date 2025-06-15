require("dotenv").config();
const express    = require("express");
const mongoose   = require("mongoose");
const bcrypt     = require("bcrypt");
const cors       = require("cors");
const path       = require("path");
const User       = require("./Models/User");
const jwt = require("jsonwebtoken");
const Transaction = require('./Models/Transaction');
const MonthlyPayment = require('./Models/MonthlyPayment'); 
const cron = require("node-cron"); //Monthly payments 
const Message = require("./Models/Message");

  
const app = express();
const PORT = process.env.PORT || 5500;

console.log("typeof MONGO_URI:", typeof process.env.MONGO_URI);
console.log("MONGO_URI:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


app.post("/api/register", async (req, res) => {
  const { username, password, role } = req.body;

  try {
    if (role === "primary") {
      const existingPrimary = await User.findOne({ role: "primary" });
      if (existingPrimary) {
        return res.status(400).json({ error: "Primary user already exists" });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      passwordHash,
      role,
      balance: 0
    });

    res.json({ message: "User registered successfully", username: user.username });

  } catch (err) {
    // Handle duplicate username error
    if (err.code === 11000) {
      return res.status(400).json({ error: "Username already exists" });
    }

    console.error("Registration failed:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});


  app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return res.json({ token }); // ✅ only one response
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  








  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
};

app.post("/api/add-member", verifyToken, async (req, res) => {
  const { username, password, amount } = req.body;
  const primaryUser = await User.findById(req.user.id);

  if (!primaryUser || primaryUser.role !== "primary") {
    return res.status(403).json({ error: "Only primary user can add members" });
  }

  if (await User.exists({ username })) {
    return res.status(400).json({ error: "Username already exists" });
  }

  if (amount > primaryUser.balance) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    username,
    passwordHash,
    role: "secondary",
    balance: amount
  });

  primaryUser.balance -= amount;
  await primaryUser.save();

  res.json({ message: "Secondary user added successfully" });
});

app.get("/api/currentUser", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id); // exclude password
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    username: user.username,
    balance: user.balance,
    role: user.role
  });
});

app.get("/api/members", verifyToken, async (req, res) => {
  const primaryUser = await User.findById(req.user.id);
  if (!primaryUser || primaryUser.role !== "primary") {
    return res.status(403).json({ error: "Only primary user can view members" });
  }

  const members = await User.find({ role: "secondary" }).select("username balance");
  res.json({ members });
});

app.get("/api/all-users", verifyToken, async (req, res) => {
  const users = await User.find().select("username");
  res.json({ users });
});


app.post("/api/topup", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || user.role !== "primary") {
    return res.status(403).json({ error: "Access denied" });
  }

  user.balance += 10000;
  await user.save();

  res.json({ message: "Balance updated to ₹10,000", balance: user.balance });
});

app.post('/api/log-expense', verifyToken, async (req, res) => {
  const { description, amount, category, date, note } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance. Expense not logged." });
    }

    // Log the transaction
    const transaction = await Transaction.create({
      userId: user._id,
      description,
      amount,
      category,
      date,
      note
    });

    // Deduct from balance
    user.balance -= amount;
    await user.save();

    res.json({ message: "Transaction logged", transaction, newBalance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to log transaction" });
  }
});

app.delete("/api/remove-member/:username", verifyToken, async (req, res) => {
  const primaryUser = await User.findById(req.user.id);
  if (!primaryUser || primaryUser.role !== "primary") {
    return res.status(403).json({ error: "Only primary user can remove members" });
  }

  const { username } = req.params;

  const result = await User.deleteOne({ username, role: "secondary" });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Member not found" });
  }

  res.json({ message: "Member removed successfully" });
});

app.post("/api/monthly-payment", verifyToken, async (req, res) => {
  const { description, amount, category, startMonth, endMonth, note } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance to initiate monthly payment" });
    }

    // First month's deduction
    user.balance -= amount;
    await user.save();

    const payment = await MonthlyPayment.create({
      userId: user._id,
      description,
      amount,
      category,
      startMonth,
      endMonth,
      note
    });

    res.json({ message: "Monthly payment added and first installment deducted", payment });
  } catch (err) {
    console.error("❌ Monthly payment error:", err);
    res.status(500).json({ error: "Failed to add monthly payment" });
  }
});

cron.schedule("0 0 1 * *", async () => {
  console.log("🔁 Running monthly deduction...");

  const thisMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const payments = await MonthlyPayment.find({ startMonth: { $lte: thisMonth } });

  for (let p of payments) {
    if (p.endMonth && p.endMonth < thisMonth) continue;

    const user = await User.findById(p.userId);
    if (!user || user.balance < p.amount) continue;

    user.balance -= p.amount;
    await user.save();

    await Transaction.create({
      userId: p.userId,
      description: `[Monthly] ${p.description}`,
      amount: p.amount,
      category: p.category,
      date: new Date(),
      note: p.note
    });

    // 🟡 Add message
    await Message.create({
      userId: p.userId,
      content: `₹${p.amount} deducted for "${p.description}"`,
      read: false
    });

    console.log(`✅ Deducted ₹${p.amount} from ${user.username} for ${p.description}`);
  }
});

// 📨 Get all messages for current user
app.get("/api/messages", verifyToken, async (req, res) => {
  const messages = await Message.find({ userId: req.user.id }).sort({ timestamp: -1 });
  res.json({ messages });
});

// 🔴 Get unread count
app.get("/api/messages/unread-count", verifyToken, async (req, res) => {
  const count = await Message.countDocuments({ userId: req.user.id, read: false });
  res.json({ unread: count });
});

// ✅ Mark all as read
app.post("/api/messages/mark-read", verifyToken, async (req, res) => {
  await Message.updateMany({ userId: req.user.id, read: false }, { $set: { read: true } });
  res.json({ success: true });
});

app.get("/api/transactions", verifyToken, async (req, res) => {
  const { username, category, date, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (username) {
    const user = await User.findOne({ username });
    if (user) filter.userId = user._id;
  }

  if (category) {
    filter.category = category;
  }

  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  }

  const transactions = await Transaction.find(filter)
    .populate("userId", "username")
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const count = await Transaction.countDocuments(filter);

  res.json({
    transactions,
    totalPages: Math.ceil(count / limit),
    currentPage: Number(page),
  });
});

app.get("/api/expense-stats", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  let transactions;
  if (user.role === "primary") {
    transactions = await Transaction.find().populate("userId", "username");
  } else {
    transactions = await Transaction.find({ userId: user._id }).populate("userId", "username");
  }

  const allUsersCategory = {};
  const primaryCategory = {};
  let added = 0;
  let spent = 0;

  for (let t of transactions) {
    const category = t.category || "Other";
    const isPrimary = String(t.userId._id) === String(user._id);

    allUsersCategory[category] = (allUsersCategory[category] || 0) + t.amount;

    if (isPrimary) {
      primaryCategory[category] = (primaryCategory[category] || 0) + t.amount;
      spent += t.amount;
    }

    if (user.role === "secondary") {
      spent += t.amount;
    }
  }

  added = spent + user.balance;

  res.json({
    allUsersCategory,
    primaryCategory,
    spent,
    added
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});



app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});




// // server.js
// const express    = require("express");
// const bodyParser = require("body-parser");
// const cors       = require("cors");
// const path       = require("path");
// const app        = express();
// const PORT       = process.env.PORT || 5500;

// // 1) In-memory “database”
// const users = [
//   { id: 1, username: "user", password: "1234", balance: 5000 },
//   { id: 2, username: "sanjay",   password: "4567",   balance: 2500 }
// ];
// let currentSessions = {}; // simple session store: { sessionId: userId }

// // 2) Middleware
// app.use(cors());
// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, "public")));

// // 3) Login endpoint
// app.post("/api/login", (req, res) => {
//   const { username, password } = req.body;
//   const user = users.find(u => u.username === username && u.password === password);
//   if (!user) return res.status(401).json({ error: "Invalid credentials" });

//   // create a “session” (insecure, just for demo)
//   const sessionId = Date.now().toString();
//   currentSessions[sessionId] = user.id;

//   // send back user data + session token
//   res.json({
//     sessionId,
//     user: { id: user.id, username: user.username, balance: user.balance }
//   });
// });
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });
// // 4) Fetch current user (via sessionId header)
// app.get("/api/currentUser", (req, res) => {
//   const sessionId = req.header("X-Session-Id");
//   const userId    = currentSessions[sessionId];
//   if (!userId) return res.status(401).json({ error: "Not logged in" });

//   const user = users.find(u => u.id === userId);
//   res.json({ id: user.id, username: user.username, balance: user.balance });
// });

