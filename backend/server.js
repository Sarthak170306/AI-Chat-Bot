const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize DB connection
connectDB();

// Mount API routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Backend server is running on port ' + PORT);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
