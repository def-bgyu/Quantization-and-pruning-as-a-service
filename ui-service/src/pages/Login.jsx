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

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await axiosConfig.post("/login", { email, password });
      localStorage.setItem("logged_in", true);
      localStorage.setItem("user_id", response.data.user_id);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
      <Card style={cardStyle}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Login
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
          {error && <Typography color="error">{error}</Typography>}
        </CardContent>
        <CardActions style={{ justifyContent: "center" }}>
          <Button variant="contained" color="primary" onClick={handleLogin}>
            Login
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => navigate("/signup")}>
            Sign Up
          </Button>
        </CardActions>
      </Card>
    </div>
  );
};

export default Login;
