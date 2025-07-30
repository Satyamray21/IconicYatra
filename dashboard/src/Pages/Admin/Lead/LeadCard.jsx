import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Container,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSelector, useDispatch } from "react-redux";
import { getAllLeads,fetchLeadsReports } from "../../../features/leads/leadSlice";

const stats = [
  { title: "Today's", active: 0, confirmed: 0, cancelled: 0 },
  { title: "This Month", active: 0, confirmed: 0, cancelled: 0 },
  { title: "Last 3 Months", active: 0, confirmed: 0, cancelled: 0 },
  { title: "Last 6 Months", active: 0, confirmed: 0, cancelled: 0 },
  { title: "Last 12 Months", active: 15, confirmed: 0, cancelled: 0 },
];

const LeadDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { list: leadList = [], status, error } = useSelector(
    (state) => state.leads
  );
  const { reports: stats = [], loading: statsLoading, error: statsError } = useSelector(
  (state) => state.leads
);


  useEffect(() => {
    dispatch(getAllLeads());
    dispatch(fetchLeadsReports());
  }, [dispatch]);

  const handleAddClick = () => {
    navigate("/lead/leadtourform");
  };

  const handleEditClick = (originalLead) => {
    navigate("/lead/leadeditform", { state: { leadData: originalLead } });
  };

  const handleDeleteClick = (id) => {
    // Add your delete dispatch here, or update Redux store
    console.log("Delete lead with id", id);
  };

  const mappedLeads = leadList.map((lead, index) => ({
    id: index + 1,
    leadId: lead.leadId || "-",
    status: lead.status || "New",
    source: lead.officialDetail?.source || "-",
    name: lead.personalDetails?.fullName || "-",
    mobile: lead.personalDetails?.mobile || "-",
    email: lead.personalDetails?.emailId || "-",
    destination: lead.location?.city || "-",
    arrivalDate: lead.arrivalDate || "-",
    priority: lead.officialDetail?.priority || "-",
    assignTo:
      lead.officialDetail?.assignedTo ||
      lead.officialDetail?.assinedTo || // fallback for typo
      "-",
    originalData: lead,
  }));

  const columns = [
    { field: "id", headerName: "Sr No.", width: 60 },
    { field: "leadId", headerName: "Lead Id", width: 100 },
    { field: "status", headerName: "Status", width: 90 },
    { field: "source", headerName: "Source", width: 90 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "mobile", headerName: "Mobile", width: 120 },
    { field: "email", headerName: "Email", width: 180 },
    { field: "destination", headerName: "Destination", width: 110 },
    { field: "arrivalDate", headerName: "Arrival Date", width: 110 },
    { field: "priority", headerName: "Priority", width: 100 },
    { field: "assignTo", headerName: "Assign To", width: 120 },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleEditClick(params.row.originalData)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteClick(params.row.originalData._id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        {/* Stat Cards */}
        <Grid container spacing={2}>
          {stats.map((item, index) => (
            <Grid size={{xs:12, sm:6, md:4, lg:2.4}} key={index}>
              <Card
                sx={{
                  backgroundColor: "#e91e63",
                  color: "#fff",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6">
                    {item.title}: {item.active}
                  </Typography>
                  <Typography variant="body2">Active: {item.Active}</Typography>
                  <Typography variant="body2">
                    Confirmed: {item.Confirmed}
                  </Typography>
                  <Typography variant="body2">
                    Cancelled: {item.Cancelled}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Actions */}
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
            placeholder="Search..."
            sx={{ width: { xs: "100%", sm: 300 } }}
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

        {/* Data Grid */}
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Box sx={{ minWidth: "600px" }}>
            <DataGrid
              rows={mappedLeads}
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

export default LeadDashboard;