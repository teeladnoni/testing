import express from 'express'
import mongoose from "mongoose"
import serverless from 'serverless-http'
import path from 'path'
const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Serve static files (if any) from the 'public' folder
app.use(express.static('public'));
app.set('views', path.join(__dirname, '../views'));

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb+srv://Adesinaola1234:5MBQFimZoV8Xe9ER@cluster0.jobmt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Define a Mongoose schema and model
const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
});

const Item = mongoose.model('Item', itemSchema);

// Home route: display a list of items
app.get('/', async (req, res) => {
  try {
    const items = await Item.find({});
    res.render('index', { items });
  } catch (err) {
    res.status(500).send('Error fetching items');
  }
});

// Route to add a sample item
app.get('/add', async (req, res) => {
  try {
    const newItem = new Item({
      name: "Sample Item",
      description: "This is a sample item added to the database."
    });
    await newItem.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Error adding item');
  }
});

module.exports = serverless(app); // 🔥 required for Vercel

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
