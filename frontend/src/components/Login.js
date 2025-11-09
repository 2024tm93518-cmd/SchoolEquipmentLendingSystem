import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { TextField, Button, Paper, Typography, Box, CircularProgress } from "@mui/material";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/Auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location = "/home";
    } catch (err) {
      setMsg(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        Login
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Email"
          fullWidth
          sx={{ mb: 2 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          sx={{ mb: 2 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" fullWidth type="submit" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Login'}
        </Button>
      </Box>
      {msg && (
        <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
          {msg}
        </Typography>
      )}
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="body2">
          Don't have an account?{" "}
          <Link to="/signup" style={{ textDecoration: "none", color: "#1976d2" }}>
            Sign up
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
}
