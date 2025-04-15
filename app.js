const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const pool = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

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
  0) Login Setup
     - Expects: email, password
*/

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Fetch the user by email
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).send("Invalid credentials");
    }

    const user = result.rows[0];

    // Compare the password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }

    // Generate a JWT token
    const payload = {
      user_id: user.id,
      email: user.email
    };
    const token = jwt.sign(payload, 'secKeyGooseRiver', { expiresIn: '1h' });
    // security key is secKeyGooseRiver
    // Respond with the token
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error during login");
  }
});

/*
  1) Policy Notifications
     - Expects: policyId, user_id, subject, body, is_read, isArchived
*/
app.post("/notifications/policy", async (req, res) => {
  const { policy_id, user_id, subject, body, is_read, is_archived } = req.body;
  const unique_id = uuidv4(); // generate a new unique ID

  try {
    const result = await pool.query(
      `INSERT INTO policy (policy_id, user_id, subject, body, is_read, is_archived, unique_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [policy_id, user_id, subject, body, is_read, is_archived, unique_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error inserting policy notification");
  }
});

/*
  2) News Notifications
     - Expects: user_id, is_read, created_date, expiration_date, type, title, details
*/
app.post("/notifications/news", async (req, res) => {
  const { user_id, is_read, created_date, expiration_date, type, title, details } = req.body;
  const unique_id = uuidv4(); // generate a new unique ID

  try {
    const result = await pool.query(
      `INSERT INTO news (user_id, is_read, created_date, expiration_date, type, title, details, unique_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [user_id, is_read, created_date, expiration_date, type, title, details, unique_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error inserting news notification");
  }
});

/*
  3) Claims Notifications
     - Expects: insured_name, claimant_name, task_type, username, due_date, line_of_business, description, priority, is_completed
*/
app.post("/notifications/claims", async (req, res) => {
  const { insured_name, claimant_name, task_type, username, due_date, line_of_business, description, priority, is_completed } = req.body;
  const unique_id = uuidv4(); // generate a new unique ID

  try {
    const result = await pool.query(
      `INSERT INTO claims (insured_name, claimant_name, task_type, username, due_date, line_of_business, description, priority, is_completed, unique_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [insured_name, claimant_name, task_type, username, due_date, line_of_business, description, priority, is_completed, unique_id]
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
  Optional filters: policyId, user_id, subject, body, is_read, isArchived
*/
app.get("/notifications/policy", async (req, res) => {
  const { policyId, user_id, subject, body, is_read, isArchived } = req.query;
  try {
    let baseQuery = "SELECT * FROM policy";
    const conditions = [];
    const values = [];

    if (policyId) {
      values.push(policyId);
      conditions.push(`policy_id = $${values.length}`);
    }
    if (user_id) {
      values.push(user_id);
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
    if (is_read !== undefined) {
      values.push(is_read === 'true');
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
      "SELECT * FROM policy WHERE unique_id = $1",
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
  Optional filters: user_id, is_read, created_date, expiration_date, type, title, details
*/
app.get("/notifications/news", async (req, res) => {
  const { user_id, is_read, created_date, expiration_date, type, title, details } = req.query;
  try {
    let baseQuery = "SELECT * FROM news";
    const conditions = [];
    const values = [];

    if (user_id) {
      values.push(user_id);
      conditions.push(`user_id = $${values.length}`);
    }
    if (is_read !== undefined) {
      values.push(is_read === 'true');
      conditions.push(`is_read = $${values.length}`);
    }
    if (created_date) {
      values.push(created_date);
      conditions.push(`created_date = $${values.length}`);
    }
    if (expiration_date) {
      values.push(expiration_date);
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
      "SELECT * FROM news WHERE unique_id = $1",
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
  Optional filters: insured_name, claimant_name, task_type, username, due_date,
                    line_of_business, description, priority, is_completed
*/
app.get("/notifications/claims", async (req, res) => {
  const { insured_name, claimant_name, task_type, username, due_date, line_of_business, description, priority, is_completed } = req.query;

  try {
    let baseQuery = "SELECT * FROM claims";
    const conditions = [];
    const values = [];

    if (insured_name) {
      values.push(insured_name);
      conditions.push(`insured_name = $${values.length}`);
    }
    if (claimant_name) {
      values.push(claimant_name);
      conditions.push(`claimant_name = $${values.length}`);
    }
    if (task_type) {
      values.push(task_type);
      conditions.push(`task_type = $${values.length}`);
    }
    if (username) {
      values.push(username);
      conditions.push(`username = $${values.length}`);
    }
    if (due_date) {
      values.push(due_date);
      conditions.push(`due_date = $${values.length}`);
    }
    if (line_of_business) {
      values.push(line_of_business);
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
    if (is_completed !== undefined) {
      values.push(is_completed === 'true');
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
      "SELECT * FROM claims WHERE unique_id = $1",
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
