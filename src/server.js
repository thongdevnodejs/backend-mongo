const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();
console.log(process.env.port);

// Initialize express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

// Routes
app.use('/api/v1/', require('./routes/auth.routes.js'));
app.use('/api/v1/', require('./routes/product.routes.js'));
app.use('/api/v1/', require('./routes/category.routes.js'));
app.use('/api/v1/', require('./routes/order.routes.js'));
app.use('/api/v1/', require('./routes/cart.routes.js'));
app.use('/api/v1/', require('./routes/user.routes.js'));
app.use('/api/v1/', require('./routes/payment.routes.js'));

// Root route
app.get('/', (req, res) => {
  res.send('Express + MongoDB Server');
});

// // Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB and start server
connectDB();
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});