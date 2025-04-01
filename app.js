const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const pool = require('./db');

app.use(express.json());

// Health check
app.get("/status", (req, res) => {
  res.send({ Status: "Running" });
});

/*
  =========================
  = POST: CREATE NOTIFICATIONS
  =========================
*/

/*
  1) Policy Notifications
     - Expects: policyId, userId, subject, body, isRead, isArchived
*/
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

/*
  2) News Notifications
     - Expects: userId, isRead, createdDate, expirationDate, type, title, details
*/
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

/*
  3) Claims Notifications
     - Expects: insuredName, claimantName, taskType, username, dueDate, lineOfBusiness, description, priority, isCompleted
*/
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

/*
  =========================
  = GET: RETRIEVE NOTIFICATIONS (with optional filters)
  =========================
*/

/*
  POLICY NOTIFICATIONS
  Optional filters: policyId, userId, subject, body, isRead, isArchived
*/
app.get("/notifications/policy", async (req, res) => {
  const { policyId, userId, subject, body, isRead, isArchived } = req.query;
  try {
    let baseQuery = "SELECT * FROM policy_notifications";
    const conditions = [];
    const values = [];

    if (policyId) {
      values.push(policyId);
      conditions.push(`policy_id = $${values.length}`);
    }
    if (userId) {
      values.push(userId);
      conditions.push(`user_id = $${values.length}`);
    }
    if (subject) {
      values.push(subject);
      conditions.push(`subject = $${values.length}`);
    }
    if (body) {
      values.push(body);
      conditions.push(`body = $${values.length}`);
    }
    if (isRead !== undefined) {
      values.push(isRead === 'true');
      conditions.push(`is_read = $${values.length}`);
    }
    if (isArchived !== undefined) {
      values.push(isArchived === 'true');
      conditions.push(`is_archived = $${values.length}`);
    }

    if (conditions.length > 0) {
      baseQuery += " WHERE " + conditions.join(" AND ");
    }

    const result = await pool.query(baseQuery, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching policy notifications");
  }
});

app.get("/notifications/policy/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM policy_notifications WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Policy notification not found");
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching policy notification by ID");
  }
});

/*
  NEWS NOTIFICATIONS
  Optional filters: userId, isRead, createdDate, expirationDate, type, title, details
*/
app.get("/notifications/news", async (req, res) => {
  const { userId, isRead, createdDate, expirationDate, type, title, details } = req.query;
  try {
    let baseQuery = "SELECT * FROM news_notifications";
    const conditions = [];
    const values = [];

    if (userId) {
      values.push(userId);
      conditions.push(`user_id = $${values.length}`);
    }
    if (isRead !== undefined) {
      values.push(isRead === 'true');
      conditions.push(`is_read = $${values.length}`);
    }
    if (createdDate) {
      values.push(createdDate);
      conditions.push(`created_date = $${values.length}`);
    }
    if (expirationDate) {
      values.push(expirationDate);
      conditions.push(`expiration_date = $${values.length}`);
    }
    if (type) {
      values.push(type);
      conditions.push(`type = $${values.length}`);
    }
    if (title) {
      values.push(title);
      conditions.push(`title = $${values.length}`);
    }
    if (details) {
      values.push(details);
      conditions.push(`details = $${values.length}`);
    }

    if (conditions.length > 0) {
      baseQuery += " WHERE " + conditions.join(" AND ");
    }

    const result = await pool.query(baseQuery, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching news notifications");
  }
});

app.get("/notifications/news/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM news_notifications WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("News notification not found");
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching news notification by ID");
  }
});

/*
  CLAIMS NOTIFICATIONS
  Optional filters: insuredName, claimantName, taskType, username, dueDate,
                    lineOfBusiness, description, priority, isCompleted
*/
app.get("/notifications/claims", async (req, res) => {
  const { insuredName, claimantName, taskType, username, dueDate, lineOfBusiness, description, priority, isCompleted } = req.query;

  try {
    let baseQuery = "SELECT * FROM claims_notifications";
    const conditions = [];
    const values = [];

    if (insuredName) {
      values.push(insuredName);
      conditions.push(`insured_name = $${values.length}`);
    }
    if (claimantName) {
      values.push(claimantName);
      conditions.push(`claimant_name = $${values.length}`);
    }
    if (taskType) {
      values.push(taskType);
      conditions.push(`task_type = $${values.length}`);
    }
    if (username) {
      values.push(username);
      conditions.push(`username = $${values.length}`);
    }
    if (dueDate) {
      values.push(dueDate);
      conditions.push(`due_date = $${values.length}`);
    }
    if (lineOfBusiness) {
      values.push(lineOfBusiness);
      conditions.push(`line_of_business = $${values.length}`);
    }
    if (description) {
      values.push(description);
      conditions.push(`description = $${values.length}`);
    }
    if (priority) {
      values.push(priority);
      conditions.push(`priority = $${values.length}`);
    }
    if (isCompleted !== undefined) {
      values.push(isCompleted === 'true');
      conditions.push(`is_completed = $${values.length}`);
    }

    if (conditions.length > 0) {
      baseQuery += " WHERE " + conditions.join(" AND ");
    }

    const result = await pool.query(baseQuery, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching claims notifications");
  }
});

app.get("/notifications/claims/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM claims_notifications WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Claims notification not found");
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching claims notification by ID");
  }
});

// Start server
app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});
