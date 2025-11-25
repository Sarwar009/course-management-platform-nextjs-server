import { MongoClient, ObjectId } from "mongodb";

let cachedClient = null;
let cachedDb = null;

async function connectDB() {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb };
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db("CourseManagementDB");
  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

export default async function handler(req, res) {
  try {
    const { db } = await connectDB();
    const coursesCollection = db.collection("courses");

    const { method } = req;
    const { id } = req.query;

    if (method === "GET") {
      if (id) {
        // Single course
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid course ID format" });
        }
        const course = await coursesCollection.findOne({ _id: new ObjectId(id) });
        if (!course) return res.status(404).json({ error: "Course not found" });
        return res.status(200).json(course);
      } else {
        // All courses
        const courses = await coursesCollection.find().toArray();
        return res.status(200).json(courses);
      }
    }

    if (method === "POST") {
      const newCourse = {
        ...req.body,
        createdAt: new Date(),
        title: req.body.title || "Untitled Course",
      };
      const result = await coursesCollection.insertOne(newCourse);
      const insertedCourse = await coursesCollection.findOne({ _id: result.insertedId });
      return res.status(201).json(insertedCourse);
    }

    if (method === "DELETE") {
      if (!id) return res.status(400).json({ error: "ID required for deletion" });
      if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid course ID" });
      const result = await coursesCollection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 1) return res.status(204).end();
      return res.status(404).json({ error: "Course not found for deletion" });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (err) {
    console.error("Serverless function error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = app;










// const express = require ('express');
// const cors = require ('cors');
// const {MongoClient, ServerApiVersion, ObjectId} = require ('mongodb');
// require ('dotenv').config ();

// const app = express ();
// const port = process.env.PORT || 5000;

// app.use (cors ());
// app.use (express.json ());

// const uri = process.env.MONGODB_URI;

// const client = new MongoClient(process.env.MONGO_URI);

// let coursesCollection;

// async function connectDB () {
//   try {
//     // await client.connect();
//     // await client.db("admin").command({ ping: 1 });
//     console.log (
//       '✅ Pinged your deployment. Successfully connected to MongoDB!'
//     );

//     const database = client.db ('CourseManagementDB');
//     coursesCollection = database.collection ('courses');
//     console.log ("Database and Collection 'courses' ready.");

//     app.get ('/', (req, res) => {
//       res.send ('Freelance Job Portal Server is running');
//     });

//     app.listen (port, () => {
//       console.log (`Express server running on http://localhost:${port}`);
//     });
//   } catch (error) {
//     console.error ('❌ MongoDB connection error:', error);
//   }
// }

// connectDB ();

// app.get ('/api/courses', async (req, res) => {
//   if (!coursesCollection)
//     return res.status (503).send ('Database not initialized.');
//   try {
//     const courses = await coursesCollection.find ({}).toArray ();
//     res.json (courses);
//   } catch (error) {
//     res.status (500).send ('Internal Server Error.');
//   }
// });

// // GET Single Course
// app.get ('/api/courses/:id', async (req, res) => {
//   if (!coursesCollection) {
//     return res.status (503).json ({error: 'Database not initialized.'});
//   }

//   try {
//     const id = req.params.id;

//     if (!ObjectId.isValid (id)) {
//       return res.status (400).json ({error: 'Invalid course ID format.'});
//     }

//     const course = await coursesCollection.findOne ({_id: new ObjectId (id)});

//     if (!course) {
//       return res.status (404).json ({error: 'Course not found.'});
//     }

//     res.json (course);
//   } catch (error) {
//     res.status (500).json ({error: 'Internal Server Error.'});
//   }
// });

// app.post ('/api/courses', async (req, res) => {
//   if (!coursesCollection)
//     return res.status (503).send ('Database not initialized.');

//   const newCourse = {
//     ...req.body,
//     createdAt: new Date (),
//     title: req.body.title || 'Untitled Course',
//   };

//   try {
//     const result = await coursesCollection.insertOne (newCourse);
//     const insertedCourse = await coursesCollection.findOne ({
//       _id: result.insertedId,
//     });
//     res.status (201).json (insertedCourse);
//   } catch (error) {
//     res.status (500).send ('Error adding course.');
//   }
// });

// app.delete ('/api/courses/:id', async (req, res) => {
//   if (!coursesCollection)
//     return res.status (503).send ('Database not initialized.');

//   try {
//     const id = req.params.id;
//     if (!ObjectId.isValid (id)) {
//       return res.status (400).send ('Invalid course ID format.');
//     }

//     const result = await coursesCollection.deleteOne ({_id: new ObjectId (id)});

//     if (result.deletedCount === 1) {
//       res.status (204).send ();
//     } else {
//       res.status (404).send ('Course not found for deletion.');
//     }
//   } catch (error) {
//     res.status (500).send ('Error deleting course.');
//   }
// });
