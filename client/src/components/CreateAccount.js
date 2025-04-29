@import url('https://fonts.googleapis.com/css2?family=Jost:wght@400;500;700&display=swap');

body {
  margin: 0;
  padding: 0;
  font-family: 'Jost', sans-serif;
  background-color: #f0f0f0; /* Light gray background for the page */
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.create-account-container {
  background-color: white; /* Form container background */
  padding: 2.5rem;
  border-radius: 20px; /* Match MainWindow radius */
  box-shadow: 0px 4px 40px rgba(0, 0, 0, 0.2); /* Softer shadow */
  width: 100%;
  max-width: 450px; /* Slightly wider for more fields */
  text-align: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Spacing between elements */
}

.create-account-container h2 {
  margin-bottom: 1rem;
  font-weight: 700;
  color: #333;
}

.create-account-container form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

/* Style all input types used in the form */
.create-account-container input[type="text"],
.create-account-container input[type="email"],
.create-account-container input[type="password"] {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px; /* Slightly rounded corners */
  font-family: 'Jost', sans-serif;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.create-account-container input:focus {
  outline: none;
  border-color: #7D2CFF; /* Highlight focus */
}

/* Target the submit button specifically */
.create-account-container button[type="submit"] {
  border: none;
  background-color: #7D2CFF; /* Theme color (Policies) */
  color: white;
  font-family: 'Jost', sans-serif;
  font-size: 1.1rem; /* Slightly larger */
  font-weight: 500;
  padding: 0.75rem 1rem;
  margin-top: 0.5rem; /* Add some space above button */
  border-radius: 8px; /* Match input radius */
  cursor: pointer;
  transition: filter 0.3s ease;
  width: 100%; /* Make button full width */
}

.create-account-container button[type="submit"]:hover:not(:disabled) {
  filter: brightness(90%); /* Consistent hover effect */
}

.create-account-container button[type="submit"]:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.create-account-container p {
  margin-top: 1rem;
  font-size: 0.95rem;
  color: #555;
}

.link {
  color: #7D2CFF; /* Theme color */
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

/* Responsive adjustments if needed */
@media (max-width: 480px) {
  .create-account-container {
    padding: 1.5rem;
    max-width: 90%;
  }
  .create-account-container button[type="submit"] {
      font-size: 1rem;
      padding: 0.6rem 0.8rem;
  }
  .create-account-container input[type="text"],
  .create-account-container input[type="email"],
  .create-account-container input[type="password"] {
      font-size: 0.95rem;
  }
}
