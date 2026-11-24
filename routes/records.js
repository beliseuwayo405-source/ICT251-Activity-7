const router = require("express").Router();
const db = require("../db");

function validate(body) {
  if (!body || typeof body !== "object") return "Invalid request body.";
  const { title, category, description, status } = body;
  if (typeof title !== "string" || title.trim().length < 3 || title.trim().length > 80)
    return "Title must have 3 to 80 characters.";
  if (typeof category !== "string" || category.trim().length < 2 || category.trim().length > 40)
    return "Category must have 2 to 40 characters.";
  if (!["Tutoring","Study Materials","Counselling","Exam Preparation"].includes(category.trim()))
    return "Category must be Tutoring, Study Materials, Counselling or Exam Preparation.";
  if (typeof description !== "string" || description.trim().length < 5 || description.trim().length > 300)
    return "Description must have 5 to 300 characters.";
  if (!["Pending","In progress","Completed"].includes(status))
    return "Status must be Pending, In progress or Completed.";
  return null;
}

function validId(id) {
  const n = Number(id);
  return Number.isInteger(n) && n > 0;
}

// GET all
router.get("/", (req, res, next) => {
  try {
    const rows = db.prepare("SELECT id, title, category, description, status FROM records ORDER BY id").all();
    res.status(200).json(rows);
  } catch (e) { next(e); }
});

// GET one
router.get("/:id", (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Id must be a positive whole number." });
    const row = db.prepare("SELECT id, title, category, description, status FROM records WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ message: "Record not found." });
    res.status(200).json(row);
  } catch (e) { next(e); }
});

// POST
router.post("/", (req, res, next) => {
  try {
    const err = validate(req.body);
    if (err) return res.status(400).json({ message: err });
    const { title, category, description, status } = req.body;
    const info = db.prepare("INSERT INTO records (title, category, description, status) VALUES (?,?,?,?)")
      .run(title.trim(), category.trim(), description.trim(), status);
    const row = db.prepare("SELECT * FROM records WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json(row);
  } catch (e) { next(e); }
});

// PUT - replaces all 4 fields, does NOT create if missing
router.put("/:id", (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Id must be a positive whole number." });
    const err = validate(req.body);
    if (err) return res.status(400).json({ message: err });
    const { title, category, description, status } = req.body;
    const info = db.prepare("UPDATE records SET title=?, category=?, description=?, status=? WHERE id=?")
      .run(title.trim(), category.trim(), description.trim(), status, req.params.id);
    if (info.changes === 0) return res.status(404).json({ message: "Record not found." });
    const row = db.prepare("SELECT * FROM records WHERE id = ?").get(req.params.id);
    res.status(200).json(row);
  } catch (e) { next(e); }
});

// DELETE
router.delete("/:id", (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Id must be a positive whole number." });
    const info = db.prepare("DELETE FROM records WHERE id = ?").run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ message: "Record not found." });
    res.status(200).json({ message: "Record deleted." });
  } catch (e) { next(e); }
});

module.exports = router;