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
    packageId: 34,
    sector: "Goa",
    title: "Amazing Goa Weekend",
    noOfNight: "4",
    tourType: "Domestic",
    packageType: "Beach Holiday",
    status: "deactive",
    pkgType: "Own",
  },
  {
    id: 2,
    packageId: 36,
    sector: "Noida",
    title: "Amazing Noida Weekend",
    noOfNight: "6",
    tourType: "Domestic",
    packageType: "Club Holiday",
    status: "Active",
    pkgType: "Trv",
  },
];

const PackageDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [packageList, setPackageList] = useState(initialData);

  const handleAddClick = () => {
    navigate("/packageform");
  };

  const handleEditClick = (row) => {
    navigate("/tourpackage/packageeditform", { state: { packageData: row } });
  };

  const handleDeleteClick = (id) => {
    const updatedList = packageList.filter((pkg) => pkg.id !== id);
    setPackageList(updatedList);
  };

  const columns = [
    { field: "id", headerName: "Sr No.", width: 60 },
    { field: "packageId", headerName: "Package Id", width: 100 },
    { field: "sector", headerName: "Sector", width: 100 },
    { field: "title", headerName: "Title", width: 180 },
    { field: "noOfNight", headerName: "No of Night", width: 100 },
    { field: "tourType", headerName: "Tour Type", width: 100 },
    { field: "packageType", headerName: "Package Type", width: 120 },
    { field: "status", headerName: "Status", width: 100 },
    { field: "pkgType", headerName: "PKG Type", width: 100 },
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
    return packageList.filter((pkg) => {
      const matchesStatus =
        statusFilter === "" || pkg.status.toLowerCase() === statusFilter;
      const matchesSearch =
        pkg.tourType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.sector.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, searchQuery, packageList]);

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

export default PackageDashboard;
