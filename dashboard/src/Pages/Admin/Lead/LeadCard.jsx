import React ,{useEffect}from "react";
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
  Menu,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllLeads,
  fetchLeadsReports,
  changeLeadStatus,
} from "../../../features/leads/leadSlice";

const stats = [
  { title: "Today's", active: 0, confirmed: 0, cancelled: 0 },
  { title: "This Month", active: 0, confirmed: 0, cancelled: 0 },
  { title: "Last 3 Months", active: 0, confirmed: 0, cancelled: 0 },
  { title: "Last 6 Months", active: 0, confirmed: 0, cancelled: 0 },
  { title: "Last 12 Months", active: 15, confirmed: 0, cancelled: 0 },
];



const LeadCard = () => {
  const navigate = useNavigate();
 
  const [anchorEls, setAnchorEls] = React.useState({});

  const dispatch = useDispatch();

  const {
    list: leadList = [],
    status,
    error,
  } = useSelector((state) => state.leads);
  const {
    reports: stats = [],
    loading: statsLoading,
    error: statsError,
  } = useSelector((state) => state.leads);

  useEffect(() => {
    dispatch(getAllLeads());
    dispatch(fetchLeadsReports());
  }, [dispatch]);

  const handleAddClick = () => {
    navigate("/lead/leadtourform");
  };

  const handleEditClick = (row) => {
    navigate("/lead/leadeditform", { state: { leadData: row } });
  };

  const handleDeleteClick = (id) => {
    const updatedLeads = leadList.filter((lead) => lead.id !== id);
    setLeadList(updatedLeads);
  };

  const handleMenuClick = (event, id) => {
    setAnchorEls((prev) => ({ ...prev, [id]: event.currentTarget }));
  };

  const handleMenuClose = (id) => {
    setAnchorEls((prev) => ({ ...prev, [id]: null }));
  };

  const handleStatusChange = (rowId, newStatus) => {
  const lead = mappedLeads.find((item) => item.id === rowId);

  if (!lead || lead.leadId === "-") {
    console.error("Invalid lead ID");
    return;
  }

  dispatch(changeLeadStatus({ leadId: lead.leadId, status: newStatus }))
    .unwrap()
    .then(() => {
      dispatch(getAllLeads()); // Refresh list after update
    })
    .catch((err) => {
      console.error("Failed to update lead status:", err);
    });

  handleMenuClose(rowId);
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
    { field: "status", headerName: "Status", width: 100 },
    { field: "source", headerName: "Source", width: 80 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "mobile", headerName: "Mobile", width: 100 },
    { field: "email", headerName: "Email", width: 150 },
    { field: "destination", headerName: "Destination", width: 100 },
    { field: "arrivalDate", headerName: "Arrival Date", width: 100 },
    { field: "priority", headerName: "Priority", width: 80 },
    { field: "assignTo", headerName: "Assign To", width: 100 },
    {
      field: "action",
      headerName: "Action",
      width: 120,
      renderCell: (params) => {
        const rowId = params.row.id;
        return (
          <Box display="flex" gap={1} alignItems="center">
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
            <IconButton size="small" onClick={(e) => handleMenuClick(e, rowId)}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEls[rowId]}
              open={Boolean(anchorEls[rowId])}
              onClose={() => handleMenuClose(rowId)}
            >
              <MenuItem onClick={() => handleStatusChange(rowId, "Active")}>
                Active
              </MenuItem>
              <MenuItem onClick={() => handleStatusChange(rowId, "Confirmed")}>
                Confirm
              </MenuItem>
              <MenuItem onClick={() => handleStatusChange(rowId, "Cancelled")}>
                Cancel
              </MenuItem>
            </Menu>
          </Box>
        );
      },
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        {/* Stat Cards */}
        <Grid container spacing={2}>
          {stats.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={index}>
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

export default LeadCard;