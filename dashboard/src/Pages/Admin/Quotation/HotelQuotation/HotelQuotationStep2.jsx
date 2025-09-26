import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import HotelQuotationStep3 from "./HotelQuotationStep3";

const initialLocations = [
  "Aritar",
  "Baba Mandir",
  "Barsey",
  "Borong",
  "Chungthang",
  "Damthang",
  "Dentam",
  "Dzongu",
];

const HotelQuotationStep2 = () => {
  const [selectedState, setSelectedState] = useState("Sikkim");
  const [locations, setLocations] = useState(initialLocations);
  const [stayLocations, setStayLocations] = useState([]);
  const [showStep3, setShowStep3] = useState(false);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Same list reorder
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === "locations") {
        const updated = Array.from(locations);
        const [removed] = updated.splice(source.index, 1);
        updated.splice(destination.index, 0, removed);
        setLocations(updated);
      } else if (source.droppableId === "stayLocations") {
        const updated = Array.from(stayLocations);
        const [removed] = updated.splice(source.index, 1);
        updated.splice(destination.index, 0, removed);
        setStayLocations(updated);
      }
      return;
    }

    // Moving from Locations → Stay Locations
    if (source.droppableId === "locations" && destination.droppableId === "stayLocations") {
      const updatedLocations = Array.from(locations);
      const [movedItem] = updatedLocations.splice(source.index, 1);

      const updatedStay = Array.from(stayLocations);
      updatedStay.splice(destination.index, 0, { name: movedItem, nights: "" });

      setLocations(updatedLocations);
      setStayLocations(updatedStay);
    }

    // Moving from Stay Locations → Locations
    if (source.droppableId === "stayLocations" && destination.droppableId === "locations") {
      const updatedStay = Array.from(stayLocations);
      const [movedItem] = updatedStay.splice(source.index, 1);

      const updatedLocations = Array.from(locations);
      updatedLocations.splice(destination.index, 0, movedItem.name);

      setStayLocations(updatedStay);
      setLocations(updatedLocations);
    }
  };

  const handleNightsChange = (index, value) => {
    const updated = [...stayLocations];
    updated[index].nights = value;
    setStayLocations(updated);
  };

  if (showStep3) {
    return <HotelQuotationStep3 />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Quotation Itinerary 5N/6D
      </Typography>

      {/* Select State */}
      <Box sx={{ mb: 3 }}>
        <TextField
          select
          fullWidth
          label="Select Sector"
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
        >
          <MenuItem value="Sikkim">Sikkim</MenuItem>
          <MenuItem value="Darjeeling">Darjeeling</MenuItem>
          <MenuItem value="Bhutan">Bhutan</MenuItem>
        </TextField>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={2}>
          {/* Left: Locations */}
          <Grid size={{xs:12, md:6}}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Locations
            </Typography>
            <Typography variant="caption" color="error">
              Drag & drop between lists
            </Typography>

            <Droppable droppableId="locations">
              {(provided) => (
                <Paper
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    minHeight: 200,
                    maxHeight: 300,
                    overflowY: "auto",
                    mt: 1,
                    p: 1,
                    border: "1px solid #ddd",
                  }}
                >
                  {locations.map((loc, index) => (
                    <Draggable key={loc} draggableId={loc} index={index}>
                      {(provided) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{
                            p: 1,
                            mb: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            bgcolor: "#f9f9f9",
                            borderRadius: 1,
                            border: "1px solid #eee",
                            cursor: "grab",
                          }}
                        >
                          <RoomIcon color="warning" fontSize="small" />
                          <Typography>{loc}</Typography>
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Paper>
              )}
            </Droppable>
          </Grid>

          {/* Right: Stay Locations */}
          <Grid size={{xs:12, md:6}}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Stay Locations
            </Typography>
            <Typography variant="caption" color="error">
              Arrange cities in itinerary order
            </Typography>

            <Droppable droppableId="stayLocations">
              {(provided) => (
                <Paper
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    minHeight: 200,
                    maxHeight: 300,
                    overflowY: "auto",
                    mt: 1,
                    p: 1,
                    border: "1px solid #ddd",
                  }}
                >
                  {stayLocations.length === 0 && (
                    <Typography
                      variant="body2"
                      sx={{ p: 2, color: "text.secondary" }}
                    >
                      No cities added yet. Drag from the left.
                    </Typography>
                  )}
                  {stayLocations.map((loc, index) => (
                    <Draggable key={loc.name} draggableId={loc.name} index={index}>
                      {(provided) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{
                            p: 1,
                            mb: 2,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            bgcolor: "#e8f4ff",
                            borderRadius: 1,
                            border: "1px solid #cce4ff",
                            cursor: "grab",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <RoomIcon color="primary" fontSize="small" />
                            <Typography>{loc.name}</Typography>
                          </Box>
                          <TextField
                            type="number"
                            label="No. of Nights"
                            size="small"
                            value={loc.nights}
                            onChange={(e) => handleNightsChange(index, e.target.value)}
                          />
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Paper>
              )}
            </Droppable>
          </Grid>
        </Grid>
      </DragDropContext>

      {/* Save Button */}
      <Box textAlign="center" sx={{ mt: 3 }}>
        <Button
          variant="contained"
          sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          onClick={() => setShowStep3(true)}
        >
          Save & Continue
        </Button>
      </Box>
    </Box>
  );
};

export default HotelQuotationStep2;
