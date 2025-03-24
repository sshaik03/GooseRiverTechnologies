const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Temporary in-memory storage
const mockDB = {
  policy: [],
  news: [],
  claims: []
};

app.get("/status", (req, res) => {
  res.send({ Status: "Running" });
});

// === POLICY NOTIFICATIONS ===
app.post("/notifications/policy", (req, res) => {
  const notification = req.body;
  mockDB.policy.push(notification);
  res.status(201).json(notification);
});

app.get("/notifications/policy", (req, res) => {
  res.json(mockDB.policy);
});

// === NEWS NOTIFICATIONS ===
app.post("/notifications/news", (req, res) => {
  const notification = req.body;
  mockDB.news.push(notification);
  res.status(201).json(notification);
});

app.get("/notifications/news", (req, res) => {
  res.json(mockDB.news);
});

// === CLAIMS NOTIFICATIONS ===
app.post("/notifications/claims", (req, res) => {
  const notification = req.body;
  mockDB.claims.push(notification);
  res.status(201).json(notification);
});

app.get("/notifications/claims", (req, res) => {
  res.json(mockDB.claims);
});

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});
