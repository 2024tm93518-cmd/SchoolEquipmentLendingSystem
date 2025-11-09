import React, { useEffect, useState } from "react";
import API from "../api";
import { Container, Typography, Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, TextField, Select, MenuItem, FormControl, InputLabel, IconButton, RadioGroup, FormControlLabel, Radio, TablePagination, Snackbar, Alert, CircularProgress } from "@mui/material";
import { Add, Visibility, Edit } from "@mui/icons-material";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRequests, setTotalRequests] = useState(0);
  const [viewDialog, setViewDialog] = useState({ open: false, request: null });
  const [editDialog, setEditDialog] = useState({ open: false, request: null, action: '' });
  const [addDialog, setAddDialog] = useState({ open: false });
  const [items, setItems] = useState([]);
  const [newRequest, setNewRequest] = useState({
    itemId: '',
    quantity: 1,
    requestedFrom: '',
    requestedTo: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fetchRequests = async (pageNum = page, limit = rowsPerPage) => {
    try {
      const res = await API.get("/Requests", {
        params: { page: pageNum + 1, limit },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setRequests(res.data.requests || []);
      setTotalRequests(res.data.totalRequests || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests().finally(() => setLoading(false));
    API.get("/items")
      .then((res) => setItems(res.data.items || res.data))
      .catch(() => {});
  }, []);

  const handleAddRequest = () => {
    setAddDialog({ open: true });
  };

  const handleSubmitRequest = async () => {
    setLoading(true);
    try {
      const payload = {
        itemId: parseInt(newRequest.itemId),
        quantity: newRequest.quantity,
        requestedFrom: new Date(newRequest.requestedFrom).toISOString(),
        requestedTo: new Date(newRequest.requestedTo).toISOString(),
        notes: newRequest.notes
      };
      await API.post("/Requests", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSnackbar({ open: true, message: 'Request created successfully!', severity: 'success' });
      setAddDialog({ open: false });
      setNewRequest({
        itemId: '',
        quantity: 1,
        requestedFrom: '',
        requestedTo: '',
        notes: ''
      });
      // Refresh requests
      fetchRequests();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to create request', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (request) => {
    setViewDialog({ open: true, request });
  };

  const handleEdit = (request) => {
    setEditDialog({ open: true, request, action: '' });
  };

  const handleApproveReject = async (requestId, action) => {
    setLoading(true);
    try {
      await API.post(`/Requests/${requestId}/decide`, { action }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const status = action === 'approve' ? 'approved' : 'rejected';
      setRequests(requests.map(r => r.id === requestId ? { ...r, status } : r));
      setSnackbar({ open: true, message: `Request ${action}d successfully!`, severity: 'success' });
      setEditDialog({ open: false, request: null, action: '' });
    } catch (err) {
      setSnackbar({ open: true, message: `Failed to ${action} request`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (requestId) => {
    setLoading(true);
    try {
      await API.post(`/Requests/${requestId}/decide`, { action: 'return' }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'returned' } : r));
      setSnackbar({ open: true, message: 'Item returned successfully!', severity: 'success' });
      setEditDialog({ open: false, request: null, action: '' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to return item', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'issued':
        return 'success';
      case 'returned':
        return 'info';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome back, {user?.name}! Manage your equipment requests and view your activity.
      </Typography>
      <Typography variant="h5" gutterBottom>
        Your Requests
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {user?.role === "student" && (
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Tooltip title="Add New Request">
                <Button variant="contained" onClick={handleAddRequest}>
                  <Add />
                </Button>
              </Tooltip>
            </Box>
          )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Item</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
              <TableCell sx={{ color: 'white' }}>From</TableCell>
              <TableCell sx={{ color: 'white' }}>To</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.item?.name || r.itemId}</TableCell>
                <TableCell>
                  <Chip
                    label={r.status}
                    color={getStatusColor(r.status)}
                  />
                </TableCell>
                <TableCell>{new Date(r.requestedFrom).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(r.requestedTo).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleView(r)}>
                    <Visibility />
                  </IconButton>
                  {(user?.role === 'staff' || user?.role === 'admin') && (
                    <IconButton onClick={() => handleEdit(r)}>
                      <Edit />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalRequests}
          page={page}
          onPageChange={(event, newPage) => {
            setPage(newPage);
            fetchRequests(newPage, rowsPerPage);
          }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            const newRowsPerPage = parseInt(event.target.value, 10);
            setRowsPerPage(newRowsPerPage);
            setPage(0);
            fetchRequests(0, newRowsPerPage);
          }}
        />
      </TableContainer>
        </>
      )}

      {user?.role === 'admin' && (
        <Box sx={{ mt: 4 }}>
          <AdminDashboard />
        </Box>
      )}

      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, request: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>Request Details</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {viewDialog.request && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1"><strong>Item:</strong></Typography>
                <Typography variant="body1">{viewDialog.request.item?.name || viewDialog.request.itemId}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1"><strong>Status:</strong></Typography>
                <Chip label={viewDialog.request.status} color={viewDialog.request.status === "approved" ? "success" : viewDialog.request.status === "pending" ? "warning" : "error"} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1"><strong>Quantity:</strong></Typography>
                <Typography variant="body1">{viewDialog.request.quantity}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1"><strong>From:</strong></Typography>
                <Typography variant="body1">{new Date(viewDialog.request.requestedFrom).toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1"><strong>To:</strong></Typography>
                <Typography variant="body1">{new Date(viewDialog.request.requestedTo).toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1"><strong>Notes:</strong></Typography>
                <Typography variant="body1">{viewDialog.request.notes}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, request: null })} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, request: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>Manage Request</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {editDialog.request && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1"><strong>Item:</strong></Typography>
                <Typography variant="body1">{editDialog.request.item?.name || editDialog.request.itemId}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1"><strong>Requester:</strong></Typography>
                <Typography variant="body1">{editDialog.request.requester?.name || 'Unknown'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1"><strong>Current Status:</strong></Typography>
                <Chip label={editDialog.request.status} color={getStatusColor(editDialog.request.status)} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1"><strong>Quantity:</strong></Typography>
                <Typography variant="body1">{editDialog.request.quantity}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1"><strong>From:</strong></Typography>
                <Typography variant="body1">{new Date(editDialog.request.requestedFrom).toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1"><strong>To:</strong></Typography>
                <Typography variant="body1">{new Date(editDialog.request.requestedTo).toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1"><strong>Notes:</strong></Typography>
                <Typography variant="body1">{editDialog.request.notes}</Typography>
              </Box>
              {editDialog.request.status === 'pending' && (
                <FormControl component="fieldset">
                  <Typography variant="body1" sx={{ mb: 1 }}><strong>Action:</strong></Typography>
                  <RadioGroup
                    aria-label="action"
                    name="action"
                    value={editDialog.action || ''}
                    onChange={(e) => setEditDialog({ ...editDialog, action: e.target.value })}
                  >
                    <FormControlLabel value="approve" control={<Radio />} label="Approve" />
                    <FormControlLabel value="reject" control={<Radio />} label="Reject" />
                  </RadioGroup>
                </FormControl>
              )}
              {editDialog.request.status === 'approved' && (
                <Typography variant="body2" color="text.secondary">
                  Click "Return Item" to mark this item as returned.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {editDialog.request?.status === 'pending' && (
            <>
              <Button onClick={() => handleApproveReject(editDialog.request.id, editDialog.action)} variant="contained" color="primary" disabled={!editDialog.action || loading}>
                {loading ? <CircularProgress size={20} /> : (editDialog.action === 'approve' ? 'Approve' : 'Reject')}
              </Button>
            </>
          )}
          {editDialog.request?.status === 'approved' && (
            <Button onClick={() => handleReturn(editDialog.request.id)} variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Return Item'}
            </Button>
          )}
          <Button onClick={() => setEditDialog({ open: false, request: null, action: '' })} variant="outlined" disabled={loading}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>Add New Request</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Item</InputLabel>
              <Select
                value={newRequest.itemId}
                label="Item"
                onChange={(e) => setNewRequest({ ...newRequest, itemId: e.target.value })}
              >
                {items.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name} ({item.availableQuantity} available)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={newRequest.quantity}
              onChange={(e) => setNewRequest({ ...newRequest, quantity: parseInt(e.target.value) })}
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Requested From"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newRequest.requestedFrom}
              onChange={(e) => setNewRequest({ ...newRequest, requestedFrom: e.target.value })}
            />
            <TextField
              label="Requested To"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newRequest.requestedTo}
              onChange={(e) => setNewRequest({ ...newRequest, requestedTo: e.target.value })}
            />
            <TextField
              label="Notes"
              multiline
              rows={3}
              fullWidth
              value={newRequest.notes}
              onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog({ open: false })} variant="outlined" disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmitRequest} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
