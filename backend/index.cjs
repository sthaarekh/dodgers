const connectToMongo = require('./db.cjs');
const express = require('express');
const cors = require('cors');
connectToMongo();
const app = express()
const port = 9010

// Use CORS middleware with specific origin
app.use(cors({
  origin: `http://192.168.1.7:5173`, // Allow requests from this origin
  methods: ['GET', 'POST', 'DELETE'], // Specify allowed methods
  credentials: true // If your frontend needs to send cookies, you might need this
}));

app.use(express.json())
app.use('/api/auth',require('./routes/auth.cjs'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
