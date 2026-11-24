require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const origins = (process.env.CLIENT_ORIGINS || "").split(",").map(v => v.trim()).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true }));
app.use(express.json());

// GET / - API guide for marker
app.get("/", (req, res) => {
  res.send(`
  <h1>Study Support Requests - Activity 7 Backend</h1>
  <p><strong>Project:</strong> Study Support Requests</p>
  <p><strong>Student Name:</strong> Belisa Uwayo</p>
  <p><strong>Student Number:</strong> 202408771</p>
  <p>Request tutoring, study materials, counselling or exam help. Same data agreement as Activity 6.</p>
  <p><strong>Base URL:</strong> ${req.protocol}://${req.get("host")}</p>
  <p><a href="/health">/health</a> | <a href="/api/records">/api/records</a></p>
  <h2>Routes</h2>
  <table border="1" cellpadding="8"><tr><th>Method</th><th>Route</th><th>Purpose</th></tr>
  <tr><td>GET</td><td>/</td><td>API guide</td></tr>
  <tr><td>GET</td><td>/health</td><td>Server + DB check</td></tr>
  <tr><td>GET</td><td>/api/records</td><td>Read all</td></tr>
  <tr><td>GET</td><td>/api/records/:id</td><td>Read one</td></tr>
  <tr><td>POST</td><td>/api/records</td><td>Create</td></tr>
  <tr><td>PUT</td><td>/api/records/:id</td><td>Update all 4 fields</td></tr>
  <tr><td>DELETE</td><td>/api/records/:id</td><td>Delete</td></tr></table>
  <h2>Fields</h2>
  <p>title: 3-80 chars, category: 2-40 chars, description: 5-300 chars, status: Pending / In progress / Completed</p>
  <p>Categories: Tutoring, Study Materials, Counselling, Exam Preparation</p>
  <h2>Valid POST / PUT body (do NOT send id)</h2>
  <pre>{
  "title": "Need help with ICT251 JavaScript",
  "category": "Tutoring",
  "description": "I am struggling with functions and need extra lessons.",
  "status": "Pending"
}</pre>
  <h2>Status codes</h2>
  <p>200 OK, 201 Created, 400 Invalid input / bad id / malformed JSON, 404 Not found, 500 Server error, 503 DB failure on /health</p>
  <p><i>Note: On free hosting, an idle service may take up to 50 seconds to wake up on first request.</i></p>
  `);
});

app.get("/health", (req, res) => {
  try {
    db.prepare("SELECT 1").get();
    res.status(200).json({ status: "ok", database: "ok" });
  } catch (e) {
    res.status(503).json({ message: "Database unavailable." });
  }
});

app.use("/api/records", require("./routes/records"));

app.use((req, res) => res.status(404).json({ message: "Route not found." }));

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({ message: "Malformed JSON." });
  }
  console.error(err);
  res.status(500).json({ message: "Unexpected server failure." });
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));