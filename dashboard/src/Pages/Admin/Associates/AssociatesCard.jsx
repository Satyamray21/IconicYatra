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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {useDispatch,useSelector} from "react-redux";
import {fetchAllAssociates} from "../../../features/associate/associateSlice";
const stats = [
  { title: "Today's", active: 0, confirmed: 0, cancelled: 0 },
  { title: "This Month", active: 0, confirmed: 0, cancelled: 0 },
  { title: "Last 3 Months", active: 0, confirmed: 0, cancelled: 0 },
  { title: "Last 6 Months", active: 0, confirmed: 0, cancelled: 0 },
  { title: "Last 12 Months", active: 15, confirmed: 0, cancelled: 0 },
];



const AssociateDashboard = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const{list:associateList=[]}=useSelector((state)=>(state.associate))
  useEffect(()=>{
    dispatch(fetchAllAssociates())
  },[dispatch])

  const handleAddClick = () => {
    navigate("/associatesform");
  };

  const handleEditClick = (row) => {
    navigate("/associates/associateseditform", { state: { associateData: row } });
  };

  const handleDeleteClick = (id) => {
    const updatedAssociates = associateList.filter((associate) => associate.id !== id);
    setAssociateList(updatedAssociates);
  };
const mappedAssociatefList = associateList.map((associate, index) => ({
  id: index + 1, // Required by DataGrid
  associateId: associate.associateId,
  associateType:associate.personalDetails?.associateType,
  associateName: associate.personalDetails?.fullName || "",
  mobile: associate.personalDetails?.mobileNumber || "",
  email: associate.personalDetails?.email || "",
  city: associate.staffLocation?.city || "",
  firm: associate.firm?.firmName || "",
}));
  const columns = [
    { field: "id", headerName: "Sr No.", width: 60 },
    { field: "associateId", headerName: "Associate Id", width: 150 },
    { field: "associateType", headerName: "Associate Type", width: 150 },
    { field: "associateName", headerName: "Associate Name", width: 180 },
    { field: "mobile", headerName: "Mobile", width: 120 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "city", headerName: "City", width: 90 },
    { field: "firm", headerName: "Firm", width: 150 },
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

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        {/* Stat Cards */}
        <Grid container spacing={2}>
          {stats.map((item, index) => (
            <Grid key={index} size={{xs:12, sm:6, md:4, lg:2.4}}>
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
                  <Typography variant="body2">Active: {item.active}</Typography>
                  <Typography variant="body2">
                    Confirmed: {item.confirmed}
                  </Typography>
                  <Typography variant="body2">
                    Cancelled: {item.cancelled}
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
              rows={mappedAssociatefList}
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

export default AssociateDashboard;
