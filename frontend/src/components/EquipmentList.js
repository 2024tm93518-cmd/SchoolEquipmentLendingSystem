import React, { useEffect, useState } from "react";
import API from "../api";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Delete, Visibility } from "@mui/icons-material";

export default function EquipmentList() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [addDialog, setAddDialog] = useState({ open: false });
  const [editDialog, setEditDialog] = useState({ open: false, item: null });
  const [viewDialog, setViewDialog] = useState({ open: false, item: null });
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    condition: "",
    totalQuantity: 1,
    availableQuantity: 1,
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fetchItems = async (pageNum = page, limit = rowsPerPage, searchQuery = q) => {
    try {
      const res = await API.get("/items", {
        params: { page: pageNum + 1, limit, q: searchQuery },
      });
      setItems(res.data.items || []);
      setTotalItems(res.data.totalItems || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems().finally(() => setLoading(false));
  }, []);

  const search = async () => {
    if (q.trim()) {
      try {
        const res = await API.get(`/Items/search?q=${encodeURIComponent(q)}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setItems(res.data || []);
        setTotalItems(res.data.length || 0);
        setPage(0);
      } catch (err) {
        console.error(err);
        setItems([]);
        setTotalItems(0);
      }
    } else {
      setPage(0);
      fetchItems(0, rowsPerPage, q);
    }
  };

  const handleAddItem = () => {
    setNewItem({
      name: "",
      category: "",
      condition: "",
      totalQuantity: 1,
      availableQuantity: 1,
      description: "",
    });
    setAddDialog({ open: true });
  };

  const handleSubmitAdd = async () => {
    setLoading(true);
    try {
      const payload = {
        id: 0,
        name: newItem.name,
        category: newItem.category,
        condition: newItem.condition,
        totalQuantity: newItem.totalQuantity,
        availableQuantity: newItem.availableQuantity,
        description: newItem.description,
      };
      await API.post("/Items", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSnackbar({ open: true, message: 'Item added successfully!', severity: 'success' });
      setAddDialog({ open: false });
      setNewItem({
        name: "",
        category: "",
        condition: "",
        totalQuantity: 1,
        availableQuantity: 1,
        description: "",
      });
      fetchItems();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to add item', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item) => {
    setEditDialog({ open: true, item });
    setNewItem({
      name: item.name,
      category: item.category,
      condition: item.condition,
      totalQuantity: item.totalQuantity,
      availableQuantity: item.availableQuantity,
      description: item.description,
    });
  };

  const handleSubmitEdit = async () => {
    setLoading(true);
    try {
      const payload = {
        id: editDialog.item.id,
        name: newItem.name,
        category: newItem.category,
        condition: newItem.condition,
        totalQuantity: newItem.totalQuantity,
        availableQuantity: newItem.availableQuantity,
        description: newItem.description,
      };
      await API.put(`/Items/${editDialog.item.id}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSnackbar({ open: true, message: 'Item updated successfully!', severity: 'success' });
      setEditDialog({ open: false, item: null });
      setNewItem({
        name: "",
        category: "",
        condition: "",
        totalQuantity: 1,
        availableQuantity: 1,
        description: "",
      });
      fetchItems();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update item', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setLoading(true);
      try {
        await API.delete(`/Items/${itemId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setSnackbar({ open: true, message: 'Item deleted successfully!', severity: 'success' });
        fetchItems();
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to delete item', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewItem = (item) => {
    setViewDialog({ open: true, item });
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Equipment Lending System
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Browse and search for available equipment to request.
      </Typography>
      <Box sx={{ mb: 3, display: "flex", gap: 1, alignItems: "center" }}>
        <TextField
          label="Search equipment"
          variant="outlined"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          fullWidth
          sx={{ maxWidth: 400 }}
        />
        <Button variant="contained" onClick={search} sx={{ minWidth: 100 }}>
          Search
        </Button>
        {user?.role === 'admin' && (
          <Tooltip title="Add New Equipment">
            <Button variant="contained" color="secondary" onClick={handleAddItem}>
              <Add />
            </Button>
          </Tooltip>
        )}
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Category</TableCell>
              <TableCell sx={{ color: 'white' }}>Available Quantity</TableCell>
              <TableCell sx={{ color: 'white' }}>Description</TableCell>
              {user?.role === 'admin' && <TableCell sx={{ color: 'white' }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it) => (
              <TableRow key={it.id}>
                <TableCell>{it.name}</TableCell>
                <TableCell>{it.category}</TableCell>
                <TableCell>
                  <Chip
                    label={it.availableQuantity}
                    color={it.availableQuantity > 0 ? "success" : "error"}
                  />
                </TableCell>
                <TableCell>{it.description}</TableCell>
                {user?.role === 'admin' && (
                  <TableCell>
                    <Tooltip title="View">
                      <IconButton onClick={() => handleViewItem(it)} color="primary">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditItem(it)} color="secondary">
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteItem(it.id)} color="error">
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={(event, newPage) => {
            setPage(newPage);
            fetchItems(newPage, rowsPerPage);
          }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            const newRowsPerPage = parseInt(event.target.value, 10);
            setRowsPerPage(newRowsPerPage);
            setPage(0);
            fetchItems(0, newRowsPerPage);
          }}
        />
      </TableContainer>
      )}

      {/* Add Dialog */}
      <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false })}>
        <DialogTitle>Add New Equipment</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <TextField
            label="Category"
            fullWidth
            margin="dense"
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Condition</InputLabel>
            <Select
              value={newItem.condition}
              onChange={(e) => setNewItem({ ...newItem, condition: e.target.value })}
            >
              <MenuItem value="New">New</MenuItem>
              <MenuItem value="Good">Good</MenuItem>
              <MenuItem value="Fair">Fair</MenuItem>
              <MenuItem value="Poor">Poor</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Total Quantity"
            type="number"
            fullWidth
            margin="dense"
            value={newItem.totalQuantity}
            onChange={(e) => setNewItem({ ...newItem, totalQuantity: parseInt(e.target.value) })}
          />
          <TextField
            label="Available Quantity"
            type="number"
            fullWidth
            margin="dense"
            value={newItem.availableQuantity}
            onChange={(e) => setNewItem({ ...newItem, availableQuantity: parseInt(e.target.value) })}
          />
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            multiline
            rows={3}
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog({ open: false })} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmitAdd} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, item: null })}>
        <DialogTitle>Edit Equipment</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <TextField
            label="Category"
            fullWidth
            margin="dense"
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Condition</InputLabel>
            <Select
              value={newItem.condition}
              onChange={(e) => setNewItem({ ...newItem, condition: e.target.value })}
            >
              <MenuItem value="New">New</MenuItem>
              <MenuItem value="Good">Good</MenuItem>
              <MenuItem value="Fair">Fair</MenuItem>
              <MenuItem value="Poor">Poor</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Total Quantity"
            type="number"
            fullWidth
            margin="dense"
            value={newItem.totalQuantity}
            onChange={(e) => setNewItem({ ...newItem, totalQuantity: parseInt(e.target.value) })}
          />
          <TextField
            label="Available Quantity"
            type="number"
            fullWidth
            margin="dense"
            value={newItem.availableQuantity}
            onChange={(e) => setNewItem({ ...newItem, availableQuantity: parseInt(e.target.value) })}
          />
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            multiline
            rows={3}
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, item: null })} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmitEdit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, item: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>View Equipment Details</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ minWidth: 120 }}>Name:</Typography>
              <Typography>{viewDialog.item?.name}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ minWidth: 120 }}>Category:</Typography>
              <Typography>{viewDialog.item?.category}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ minWidth: 120 }}>Condition:</Typography>
              <Chip label={viewDialog.item?.condition} color="primary" />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ minWidth: 120 }}>Total Quantity:</Typography>
              <Typography>{viewDialog.item?.totalQuantity}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ minWidth: 120 }}>Available:</Typography>
              <Chip label={viewDialog.item?.availableQuantity} color={viewDialog.item?.availableQuantity > 0 ? "success" : "error"} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Typography variant="h6" sx={{ minWidth: 120 }}>Description:</Typography>
              <Typography sx={{ flex: 1 }}>{viewDialog.item?.description}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, item: null })} variant="contained">Close</Button>
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
