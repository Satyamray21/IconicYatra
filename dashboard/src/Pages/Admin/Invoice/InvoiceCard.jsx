import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Container,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getInvoices,
  deleteInvoice,
} from "../../../features/invoice/invoiceSlice";

const InvoiceCard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { invoices, loading, error } = useSelector((state) => state.invoice);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  // ✅ Date formatter
  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "-";

  // ✅ Currency formatter
  const formatCurrency = (value) =>
    `₹${(Number(value) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  // ✅ Fetch invoices on mount
  useEffect(() => {
    dispatch(getInvoices());
  }, [dispatch]);

  // ✅ Add new invoice
  const handleAddClick = () => {
    navigate("/invoiceform");
  };

  // ✅ Edit invoice
  const handleEditClick = (invoice) => {
    navigate(`/invoice/edit/${invoice._id}`, { state: { invoiceData: invoice } });
  };

  // ✅ Delete invoice
  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      dispatch(deleteInvoice(id));
    }
  };

  // ✅ Navigate to invoice details
  const handleRowClick = (invoice) => {
    navigate(`/invoice/generate/${invoice._id}`);
  };

  // ✅ Prepare table data
  const filteredData = useMemo(() => {
    let source = [];
    
    if (Array.isArray(invoices)) {
      source = invoices;
    } else if (invoices?.data) {
      source = Array.isArray(invoices.data) ? invoices.data : [invoices.data];
    }

    if (!searchQuery.trim()) return source;

    return source.filter((item) =>
      item.partyName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [invoices, searchQuery]);

  // ✅ Pagination
  const paginatedData = useMemo(() => {
    return filteredData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredData, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ✅ Loading and Error states
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress color="warning" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        {/* 🔸 Action Bar */}
        <Box
          mt={3}
          mb={2}
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          gap={2}
        >
          <Button
            variant="contained"
            color="warning"
            sx={{ minWidth: 100 }}
            onClick={handleAddClick}
          >
            Add
          </Button>

          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by party name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: { xs: "100%", sm: 250 } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* 🔸 Custom Table */}
        <TableContainer component={Paper} sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 900 }} aria-label="invoices table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "grey.100" }}>
                <TableCell><strong>Sr No.</strong></TableCell>
                <TableCell><strong>Invoice No</strong></TableCell>
                <TableCell><strong>Invoice Date</strong></TableCell>
                <TableCell><strong>Due Date</strong></TableCell>
                <TableCell><strong>Party Name</strong></TableCell>
                <TableCell align="right"><strong>Total (₹)</strong></TableCell>
                <TableCell align="right"><strong>Received (₹)</strong></TableCell>
                <TableCell align="right"><strong>Balance (₹)</strong></TableCell>
                <TableCell align="center"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((invoice, index) => (
                  <TableRow 
                    key={invoice._id}
                    hover
                    sx={{ 
                      cursor: 'pointer',
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                    onClick={() => handleRowClick(invoice)}
                  >
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{invoice.invoiceNo || "-"}</TableCell>
                    <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell>{invoice.partyName || "-"}</TableCell>
                    <TableCell align="right">{formatCurrency(invoice.totalAmount)}</TableCell>
                    <TableCell align="right">{formatCurrency(invoice.receivedAmount)}</TableCell>
                    <TableCell align="right">{formatCurrency(invoice.balanceAmount)}</TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(invoice);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(invoice._id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <Typography variant="h6" color="textSecondary">
                      No invoices found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 🔸 Pagination */}
        <TablePagination
          rowsPerPageOptions={[7, 25, 50, 100]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </Container>
  );
};

export default InvoiceCard;