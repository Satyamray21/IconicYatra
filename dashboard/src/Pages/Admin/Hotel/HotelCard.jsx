import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Container,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const initialData = [
  {
    id: 1,
    hotelId: 31,
    hotelName: "KFC",
    category: "",
    mobile: "9878786778",
    email: "hghgj@gmail.com",
    address: "Noida",
    city: "Noida",
    status: "active",
  },
  {
    id: 2,
    hotelId: 34,
    hotelName: "Resto",
    category: "",
    mobile: "8546256778",
    email: "hghgj12@gmail.com",
    address: "Delhi",
    city: "Delhi",
    status: "deactive",
  },
];

const HotelDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hotelList, setHotelList] = useState(initialData);

  const handleAddClick = () => {
    navigate("/hotelform");
  };

  const handleEditClick = (row) => {
    navigate("/hotel/hoteleditform", { state: { hotelData: row } });
  };

  const handleDeleteClick = (id) => {
    const updatedList = hotelList.filter((hotel) => hotel.id !== id);
    setHotelList(updatedList);
  };

  const columns = [
    { field: "id", headerName: "Sr No.", width: 60 },
    { field: "hotelId", headerName: "Hotel Id", width: 75 },
    { field: "hotelName", headerName: "Hotel Name", width: 120 },
    { field: "category", headerName: "Category", width: 80 },
    { field: "mobile", headerName: "Mobile", width: 150 },
    { field: "email", headerName: "Email", width: 150 },
    { field: "address", headerName: "Address", width: 120 },
    { field: "city", headerName: "City", width: 100 },
    { field: "status", headerName: "Status", width: 100 },
    {
      field: "action",
      headerName: "Action",
      width: 80,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleEditClick(params.row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteClick(params.row.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const filteredData = useMemo(() => {
    return hotelList.filter((h) => {
      const matchesStatus =
        statusFilter === "" || h.status.toLowerCase() === statusFilter;
      const matchesSearch =
        h.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, searchQuery, hotelList]);

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        {/* Action bar */}
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

          <Box
            display="flex"
            justifyContent="flex-end"
            gap={2}
            width="100%"
            flexDirection={{ xs: "column", sm: "row" }}
          >
            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="deactive">Deactive</MenuItem>
            </TextField>

            <TextField
              variant="outlined"
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: { xs: "100%", sm: 200 } }}
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
        </Box>

        {/* Scrollable Table */}
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Box sx={{ minWidth: "600px" }}>
            <DataGrid
              rows={filteredData}
              columns={columns}
              pageSize={7}
              rowsPerPageOptions={[7, 25, 50, 100]}
              autoHeight
              disableRowSelectionOnClick
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default HotelDashboard;
