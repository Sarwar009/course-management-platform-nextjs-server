const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, 
    {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);

let coursesCollection;

async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged your deployment. Successfully connected to MongoDB!");

    const database = client.db("CourseManagementDB"); 
    coursesCollection = database.collection("courses");
    console.log("Database and Collection 'courses' ready.");

    app.listen(port, () => {
        console.log(`Express server running on http://localhost:${port}`);
    });

  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    
  }
}

connectDB();

app.get('/api/courses', async (req, res) => {
  if (!coursesCollection) return res.status(503).send("Database not initialized.");
  try {
    const courses = await coursesCollection.find({}).toArray();
    res.json(courses);
  } catch (error) {
    res.status(500).send("Internal Server Error.");
  }
});

// GET Single Course
app.get('/api/courses/:id', async (req, res) => {
  if (!coursesCollection) {
      return res.status(503).json({ error: "Database not initialized." });
  }

  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid course ID format." });
    }

    const course = await coursesCollection.findOne({ _id: new ObjectId(id) });

    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    res.json(course);

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error." });
  }
});

app.post('/api/courses', async (req, res) => {
  if (!coursesCollection) return res.status(503).send("Database not initialized.");
  
  const newCourse = {
    ...req.body,
    createdAt: new Date(),
    title: req.body.title || 'Untitled Course'
  };

  try {
    const result = await coursesCollection.insertOne(newCourse);
    const insertedCourse = await coursesCollection.findOne({ _id: result.insertedId });
    res.status(201).json(insertedCourse);
  } catch (error) {
    res.status(500).send("Error adding course.");
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  if (!coursesCollection) return res.status(503).send("Database not initialized.");

  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid course ID format.");
    }
    
    const result = await coursesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.status(204).send();
    } else {
      res.status(404).send("Course not found for deletion.");
    }
  } catch (error) {
    res.status(500).send("Error deleting course.");
  }
}); 