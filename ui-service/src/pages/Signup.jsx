import React, { useState } from "react";
import { TextField, Button, Card, CardContent, Typography, CardActions } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosConfig from "../utils/AxiosConfig";

const cardStyle = {
  display: "block",
  minWidth: "30%",
  boxShadow: "0px 4px 5px -2px rgba(0,0,0,0.2), 0px 7px 10px 1px rgba(0,0,0,0.14), 0px 2px 16px 1px rgba(0,0,0,0.12)",
  padding: "20px",
};

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");
    if (!email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await axiosConfig.post("/signup", { email, password });
      navigate("/login");
    } catch (err) {
      setError("Error signing up. Please try again.");
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
      <Card style={cardStyle}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Sign Up
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <Typography color="error">{error}</Typography>}
        </CardContent>
        <CardActions style={{ justifyContent: "center" }}>
          <Button variant="contained" color="primary" onClick={handleSignup}>
            Sign Up
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => navigate("/login")}>
            Login
          </Button>
        </CardActions>
      </Card>
    </div>
  );
};

export default Signup;
