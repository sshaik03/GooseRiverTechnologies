const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const pool = require('./db');

app.use(express.json());

app.get("/status", (req, res) => {
  res.send({ Status: "Running" });
});

// === POLICY NOTIFICATIONS ===
app.post("/notifications/policy", async (req, res) => {
  const { policyId, userId, subject, body, isRead, isArchived } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO policy_notifications (policy_id, user_id, subject, body, is_read, is_archived)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [policyId, userId, subject, body, isRead, isArchived]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error inserting policy notification");
  }
});

// === NEWS NOTIFICATIONS ===
app.post("/notifications/news", async (req, res) => {
  const { userId, isRead, createdDate, expirationDate, type, title, details } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO news_notifications (user_id, is_read, created_date, expiration_date, type, title, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, isRead, createdDate, expirationDate, type, title, details]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error inserting news notification");
  }
});

// === CLAIMS NOTIFICATIONS ===
app.post("/notifications/claims", async (req, res) => {
  const { insuredName, claimantName, taskType, username, dueDate, lineOfBusiness, description, priority, isCompleted } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO claims_notifications (insured_name, claimant_name, task_type, username, due_date, line_of_business, description, priority, is_completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [insuredName, claimantName, taskType, username, dueDate, lineOfBusiness, description, priority, isCompleted]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error inserting claims notification");
  }
});

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});
