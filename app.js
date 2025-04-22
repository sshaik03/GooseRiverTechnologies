require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// ───── app / db setup ─────
const app  = express();
const PORT = process.env.PORT || 4000;
const pool = require('./db');            // unchanged connection logic

// ───── security middleware ─────
app.use(helmet());
app.use(rateLimit({
  windowMs: 60_000,         // 1 minute
  max: 120,                 // 120 req / minute / IP
  standardHeaders: true,
  legacyHeaders: false
}));
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// ───── helper utils ─────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_TYPES = ['policy', 'news', 'claims', 'other'];

const isUUID   = str => UUID_RE.test(str);
const parseBool = v => {
  if (v === 'true'  || v === true)  return true;
  if (v === 'false' || v === false) return false;
  return null;   // invalid
};

/*─────────────────────────────────────
  Health‑check
─────────────────────────────────────*/
app.get('/status', (_, res) => res.json({ status: 'Running' }));

/*─────────────────────────────────────
  Auth: register & login
─────────────────────────────────────*/
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: 'Please fill in all fields.' });

  try {
    const dup = await pool.query(
      'SELECT 1 FROM user_info WHERE username=$1 OR email=$2',
      [username, email]
    );
    if (dup.rows.length)
      return res.status(400).json({ message: 'Username or email already in use.' });

    const newUser = await pool.query(
      `INSERT INTO user_info (unique_id, username, email, password)
       VALUES ($1,$2,$3,$4) RETURNING unique_id, username, email`,
      [uuidv4(), username, email, password]
    );
    res.status(201).json({ message: 'Account created', user: newUser.rows[0] });
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
    if (!rs.rows.length)
      return res.status(400).json({ message: 'User not found' });

    const user = rs.rows[0];
    if (password !== user.password)
      return res.status(400).json({ message: 'Incorrect password' });

    const token = jwt.sign(
      { user_id: user.unique_id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'secKeyGooseRiver',
      { expiresIn: '1h' }
    );
    res.json({ message: 'Login successful', token, ...user });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ message: 'Server error during login' });
  }
});

/*─────────────────────────────────────
  POST /notifications  — create
─────────────────────────────────────*/
app.post('/notifications', async (req, res) => {
  const {
    notification_type,
    sender_id,
    recipient_id,
    subject,
    body,
    is_important = false
  } = req.body;

  // ── basic validation ──
  if (!ALLOWED_TYPES.includes(notification_type))
    return res.status(400).json({ message: 'Invalid notification_type' });
  if (![sender_id, recipient_id].every(isUUID))
    return res.status(400).json({ message: 'Invalid sender_id or recipient_id' });
  if (!subject || !body)
    return res.status(400).json({ message: 'Missing subject/body' });

  try {
    const rs = await pool.query(
      `INSERT INTO notifications
         (_id, notification_type, sender_id, recipient_id,
          subject, body, is_read, is_archived, is_important, time_sent)
       VALUES ($1,$2,$3,$4,$5,$6,false,false,$7,NOW())
       RETURNING *`,
      [uuidv4(), notification_type, sender_id, recipient_id, subject, body, is_important]
    );
    res.status(201).json(rs.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error inserting notification');
  }
});

/*─────────────────────────────────────
  GET /notifications  — list / filter
─────────────────────────────────────*/
app.get('/notifications', async (req, res) => {
  const {
    _id,
    notification_type,
    sender_id,
    recipient_id,
    is_read,
    is_archived,
    is_important
  } = req.query;

  // validate scalars before touching SQL
  if (_id && !isUUID(_id)) return res.status(400).json({ message: 'Bad _id format' });
  if (notification_type && !ALLOWED_TYPES.includes(notification_type))
    return res.status(400).json({ message: 'Bad notification_type' });
  if (sender_id && !isUUID(sender_id))
    return res.status(400).json({ message: 'Bad sender_id' });
  if (recipient_id && !isUUID(recipient_id))
    return res.status(400).json({ message: 'Bad recipient_id' });

  const boolFilters = { is_read, is_archived, is_important };
  for (const [k, v] of Object.entries(boolFilters)) {
    if (v !== undefined && parseBool(v) === null)
      return res.status(400).json({ message: `Bad boolean for ${k}` });
  }

  try {
    let query = 'SELECT * FROM notifications';
    const cond = [];
    const vals = [];
    const add = (col, val) => { vals.push(val); cond.push(`${col} = $${vals.length}`); };

    if (_id)              add('_id', _id);
    if (notification_type) add('notification_type', notification_type);
    if (sender_id)         add('sender_id', sender_id);
    if (recipient_id)      add('recipient_id', recipient_id);
    if (is_read !== undefined)      add('is_read',      parseBool(is_read));
    if (is_archived !== undefined)  add('is_archived',  parseBool(is_archived));
    if (is_important !== undefined) add('is_important', parseBool(is_important));

    if (cond.length) query += ' WHERE ' + cond.join(' AND ');
    query += ' ORDER BY time_sent DESC';

    const rs = await pool.query(query, vals);
    res.json(rs.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error fetching notifications');
  }
});

/*─────────────────────────────────────
  GET /notifications/id/:id
─────────────────────────────────────*/
app.get('/notifications/id/:id', async (req, res) => {
  if (!isUUID(req.params.id))
    return res.status(400).json({ message: 'Bad _id format' });
  try {
    const rs = await pool.query(
      'SELECT * FROM notifications WHERE _id=$1',
      [req.params.id]
    );
    if (!rs.rows.length) return res.status(404).send('Notification not found');
    res.json(rs.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error fetching notification by ID');
  }
});

/*─────────────────────────────────────
  PATCH /notifications/:id
─────────────────────────────────────*/
app.patch('/notifications/:id', async (req, res) => {
  if (!isUUID(req.params.id))
    return res.status(400).json({ message: 'Bad _id format' });

  const { is_read, is_archived, is_important } = req.body;
  const updates = { is_read, is_archived, is_important };
  const fields = [];
  const vals   = [];

  for (const [col, val] of Object.entries(updates)) {
    if (val === undefined) continue;
    const parsed = parseBool(val);
    if (parsed === null)
      return res.status(400).json({ message: `Bad boolean for ${col}` });
    vals.push(parsed);
    fields.push(`${col} = $${vals.length}`);
  }
  if (!fields.length)
    return res.status(400).json({ message: 'No updatable fields provided' });

  vals.push(req.params.id); // where clause

  try {
    const rs = await pool.query(
      `UPDATE notifications SET ${fields.join(', ')}
       WHERE _id = $${vals.length} RETURNING *`,
      vals
    );
    if (!rs.rows.length) return res.status(404).send('Notification not found');
    res.json(rs.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error updating notification');
  }
});

/*─────────────────────────────────────
  Start server
─────────────────────────────────────*/
app.listen(PORT, () => console.log('Server listening on', PORT));
