import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { TextField, Button, Paper, Typography, Box, Select, MenuItem, FormControl, InputLabel, CircularProgress, Snackbar, Alert } from "@mui/material";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/Auth/signup", { name, email, password, role });
      setSnackbar({ open: true, message: 'Signup successful! Please login.', severity: 'success' });
      setTimeout(() => window.location = "/login", 2000);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.msg || "Signup failed", severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        Signup
      </Typography>
      <Box component="form" onSubmit={submit}>
        <TextField
          label="Name"
          fullWidth
          sx={{ mb: 2 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Role</InputLabel>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" fullWidth type="submit" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Signup'}
        </Button>
      </Box>
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="body2">
          Already have an account?{" "}
          <Link to="/login" style={{ textDecoration: "none", color: "#1976d2" }}>
            Login
          </Link>
        </Typography>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
