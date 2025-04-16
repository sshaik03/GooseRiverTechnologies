const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;
const pool = require('./db');
//const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
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

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  try {
    // Check if user already exists
    const userCheck = await pool.query(
      "SELECT * FROM user_info WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "Username or email already in use." });
    }

    const uniqueId = uuidv4(); // generate a new unique ID for the user

    // Insert new user (including generated unique_id)
    const newUser = await pool.query(
      `INSERT INTO user_info (unique_id, username, email, password)
       VALUES ($1, $2, $3, $4)
       RETURNING unique_id, username, email`,
      [uniqueId, username, email, password]
    );

    res.status(201).json({
      message: "Account created successfully",
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Look up user by username OR email from user_info table
    const result = await pool.query(
      "SELECT * FROM user_info WHERE username = $1 OR email = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // Compare password directly (plaintext comparison)
    if (password !== user.password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Generate JWT token
    const payload = {
      user_id: user.unique_id, 
      username: user.username,
      email: user.email
    };
    const token = jwt.sign(payload, 'secKeyGooseRiver', { expiresIn: '1h' });

    // Send back token and some basic info
    res.json({
      message: "Login successful",
      token,
      user_id: user.unique_id, 
      username: user.username,
      email: user.email
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

/*
  1) Policy Notifications
     - Expects: policyId, user_id, subject, body, isRead, isArchived
*/
app.post("/notifications/policy", async (req, res) => {
  const { policyId, user_id, subject, body, isRead, isArchived } = req.body;
  const uniqueId = uuidv4(); // generate a new unique ID

  try {
    const result = await pool.query(
      `INSERT INTO policy (policy_id, user_id, subject, body, is_read, is_archived, unique_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [policyId, user_id, subject, body, isRead, isArchived, uniqueId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error inserting policy notification");
  }
});

/*
  2) News Notifications
     - Expects: user_id, isRead, createdDate, expirationDate, type, title, details
*/
app.post("/notifications/news", async (req, res) => {
  const { user_id, isRead, createdDate, expirationDate, type, title, details } = req.body;
  const uniqueId = uuidv4(); // generate a new unique ID

  try {
    const result = await pool.query(
      `INSERT INTO news (user_id, is_read, created_date, expiration_date, type, title, details, unique_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [user_id, isRead, createdDate, expirationDate, type, title, details, uniqueId]
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
  const uniqueId = uuidv4(); // generate a new unique ID

  try {
    const result = await pool.query(
      `INSERT INTO claims (insured_name, claimant_name, task_type, username, due_date, line_of_business, description, priority, is_completed, unique_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [insuredName, claimantName, taskType, username, dueDate, lineOfBusiness, description, priority, isCompleted, uniqueId]
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
  Optional filters: policyId, user_id, subject, body, isRead, isArchived
*/
app.get("/notifications/policy", async (req, res) => {
  const { policyId, user_id, subject, body, isRead, isArchived } = req.query;
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
      "SELECT * FROM policy WHERE id = $1",
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
  Optional filters: user_id, isRead, createdDate, expirationDate, type, title, details
*/
app.get("/notifications/news", async (req, res) => {
  const { user_id, isRead, createdDate, expirationDate, type, title, details } = req.query;
  try {
    let baseQuery = "SELECT * FROM news";
    const conditions = [];
    const values = [];

    if (user_id) {
      values.push(user_id);
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
      "SELECT * FROM news WHERE id = $1",
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
    let baseQuery = "SELECT * FROM claims";
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
      "SELECT * FROM claims WHERE id = $1",
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
