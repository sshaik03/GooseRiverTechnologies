// server.js  —  unified‑notifications version
const express = require('express');
const cors = require('cors');
const app   = express();
const PORT  = process.env.PORT || 4000;
const pool  = require('./db');
const jwt   = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

/* ────────────────────────────────────
   Health‑check
   ──────────────────────────────────── */
app.get('/status', (_, res) => res.send({ status: 'Running' }));

/* ────────────────────────────────────
   Auth: register & login  (unchanged)
   ──────────────────────────────────── */
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields.' });
  }
  try {
    const dup = await pool.query(
      'SELECT 1 FROM user_info WHERE username=$1 OR email=$2',
      [username, email]
    );
    if (dup.rows.length) {
      return res.status(400).json({ message: 'Username or email already in use.' });
    }
    const user = await pool.query(
      `INSERT INTO user_info (unique_id, username, email, password)
       VALUES ($1,$2,$3,$4)
       RETURNING unique_id, username, email`,
      [uuidv4(), username, email, password]
    );
    res.status(201).json({ message: 'Account created', user: user.rows[0] });
  } catch (e) {
    console.error('Registration error:', e);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const rs = await pool.query(
      'SELECT * FROM user_info WHERE username=$1 OR email=$1',
      [username]
    );
    if (!rs.rows.length) return res.status(400).json({ message: 'User not found' });
    const user = rs.rows[0];
    if (password !== user.password)
      return res.status(400).json({ message: 'Incorrect password' });

    const token = jwt.sign(
      { user_id: user.unique_id, username: user.username, email: user.email },
      'secKeyGooseRiver',
      { expiresIn: '1h' }
    );
    res.json({ message: 'Login successful', token, ...user });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ message: 'Server error during login' });
  }
});

/* ────────────────────────────────────
   POST /notifications  — create one
   Expects: notification_type, sender_id,
            recipient_id, subject, body,
            is_important  (bool, optional)
   ──────────────────────────────────── */
app.post('/notifications', async (req, res) => {
  const {
    notification_type,
    sender_id,
    recipient_id,
    subject,
    body,
    is_important = false
  } = req.body;

  if (!notification_type || !sender_id || !recipient_id || !subject || !body) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO notifications
         (notification_id, notification_type, sender_id, recipient_id,
          subject, body, is_read, is_archived, is_important, time_sent)
       VALUES ($1,$2,$3,$4,$5,$6,false,false,$7,NOW())
       RETURNING *`,
      [uuidv4(), notification_type, sender_id, recipient_id, subject, body, is_important]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error inserting notification');
  }
});

/* ────────────────────────────────────
   GET /notifications  — list / filter
   Optional query params:
     notification_id, notification_type,
     sender_id, recipient_id,
     is_read, is_archived, is_important
   ──────────────────────────────────── */
app.get('/notifications', async (req, res) => {
  const {
    notification_id,
    notification_type,
    sender_id,
    recipient_id,
    is_read,
    is_archived,
    is_important
  } = req.query;

  try {
    let query = 'SELECT * FROM notifications';
    const cond = [];
    const vals = [];

    const add = (col, val, transform = v => v) => {
      vals.push(transform(val));
      cond.push(`${col} = $${vals.length}`);
    };

    if (notification_id)   add('notification_id',   notification_id);
    if (notification_type) add('notification_type', notification_type);
    if (sender_id)         add('sender_id',         sender_id);
    if (recipient_id)      add('recipient_id',      recipient_id);
    if (is_read !== undefined)      add('is_read',      is_read,      v => v === 'true');
    if (is_archived !== undefined)  add('is_archived',  is_archived,  v => v === 'true');
    if (is_important !== undefined) add('is_important', is_important, v => v === 'true');

    if (cond.length) query += ' WHERE ' + cond.join(' AND ');
    query += ' ORDER BY time_sent DESC';

    const rs = await pool.query(query, vals);
    res.json(rs.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error fetching notifications');
  }
});

/* ────────────────────────────────────
   GET /notifications/:id  — by ID
   ──────────────────────────────────── */
app.get('/notifications/:id', async (req, res) => {
  try {
    const rs = await pool.query(
      'SELECT * FROM notifications WHERE notification_id=$1',
      [req.params.id]
    );
    if (!rs.rows.length) return res.status(404).send('Notification not found');
    res.json(rs.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error fetching notification by ID');
  }
});

/* ────────────────────────────────────
   PATCH /notifications/:id  — mark read,
                               archive, etc.
   Body may include: is_read, is_archived,
   is_important
   ──────────────────────────────────── */
app.patch('/notifications/:id', async (req, res) => {
  const { is_read, is_archived, is_important } = req.body;
  if (
    is_read === undefined &&
    is_archived === undefined &&
    is_important === undefined
  ) {
    return res.status(400).json({ message: 'No updatable fields provided.' });
  }
  try {
    const fields = [];
    const vals   = [];

    const add = (col, val) => {
      vals.push(val);
      fields.push(`${col} = $${vals.length}`);
    };

    if (is_read !== undefined)      add('is_read',      is_read);
    if (is_archived !== undefined)  add('is_archived',  is_archived);
    if (is_important !== undefined) add('is_important', is_important);

    vals.push(req.params.id); // for WHERE
    const rs = await pool.query(
      `UPDATE notifications SET ${fields.join(', ')}
       WHERE notification_id = $${vals.length}
       RETURNING *`,
      vals
    );
    if (!rs.rows.length) return res.status(404).send('Notification not found');
    res.json(rs.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error updating notification');
  }
});

/* ────────────────────────────────────
   Start server
   ──────────────────────────────────── */
app.listen(PORT, () => console.log('Server listening on', PORT));
