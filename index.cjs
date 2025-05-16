const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const router = require('./routes/routes.cjs');
const productRoute = require('./routes/productroute.cjs');
const orderRoutes = require("./routes/orders.cjs");
const adminRoutes = require("./routes/adminroute.cjs");
const cartRoute = require("./routes/cart.cjs");
const addressRoute = require("./routes/address.cjs");
// const paymentRoute = require("./routes/payment.cjs");
const verifyRoute = require("./routes/verifypay.cjs");
// const verifyPay = require("./routes/verifypay.cjs");
const searchRoutes = require('./routes/search.cjs');
const categoryRoutes = require('./routes/category.cjs');
const Message = require('./models/message.cjs'); // Your Mongoose message model
const { authenticateUser } = require('./middleware/authenticateUser.cjs');
const chatRoutes = require('./routes/chat.cjs');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "https://saucytee-eb6x.vercel.app", // ✅ your current frontend
  // add other domains if needed
];
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://saucytee-eb6x.vercel.app', // or restrict to your frontend origin
  },
});

// Store connected clients
const connectedUsers = {};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('register', (userId) => {
    connectedUsers[userId] = socket.id;
  });

  socket.on('sendMessage', async (data) => {
    const { userId, sender, message } = data;

    // Save to DB
    const newMsg = new Message({
      userId,
      sender,
      message,
      timestamp: new Date(),
    });
    await newMsg.save();

    // Emit to user or admin
    if (connectedUsers[userId]) {
      io.to(connectedUsers[userId]).emit('receiveMessage', newMsg);
    }

    // Emit to all admins (you can also filter by role if needed)
    socket.broadcast.emit('receiveMessage', newMsg);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
    // Optional: cleanup
    for (const [uid, sid] of Object.entries(connectedUsers)) {
      if (sid === socket.id) delete connectedUsers[uid];
    }
  });
});

// Middleware
app.use(express.json( {limit: '10mb'}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use((req, res, next) => {
  if (req.path === '/api/userInfo/signin' || req.path === '/api/userInfo/signup') {
    return next(); // skip authentication for these routes
  }
  authenticateUser(req, res, next);
});

app.use(authenticateUser);

// JWT Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// MongoDB connection
const mongoURI = process.env.MONGODB;

if (!mongoURI) {
  console.error('❌ MONGODB URI not found in environment variables');
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Test route
app.get('/', (req, res) => {
  res.send('Hello from backend with MongoDB!');
});

// Protected user route
app.get('/api/user', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'Protected route accessed successfully',
    user: req.user, // JWT payload (e.g., user ID)
  });
});

// Routes
app.use('/api/userInfo', router);
// In your main server file:
app.use('/api', productRoute);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoute);
app.use("/api/address", addressRoute);
// app.use("/api/payment", paymentRoute);
app.use("/api/verify", verifyRoute);
app.use("/api/admin", adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/chat', chatRoutes);

// <-- This is the fix: use `server.listen` instead of `app.listen`
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
