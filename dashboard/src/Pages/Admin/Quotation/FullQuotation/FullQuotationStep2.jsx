import React, { useState, useEffect } from "react";
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
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { step2Update } from "../../../../features/quotation/fullQuotationSlice";

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

const FullQuotationStep2 = ({ quotationId }) => {
  const [selectedState, setSelectedState] = useState("Sikkim");
  const [locations, setLocations] = useState(initialLocations);
  const [stayLocations, setStayLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Debug effect
  useEffect(() => {
    console.log("Step 2 - Current quotationId:", quotationId);
    console.log("Step 2 - Current stay locations:", stayLocations);
  }, [quotationId, stayLocations]);

  // ---------- DRAG & DROP ----------
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
      updatedStay.splice(destination.index, 0, { name: movedItem, nights: 1 }); // Default to 1 night

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

  // ---------- Handle Nights ----------
  const handleNightsChange = (index, value) => {
    // Ensure value is positive number between 1-30
    const numericValue = Math.max(1, Math.min(30, parseInt(value) || 1));
    
    const updated = [...stayLocations];
    updated[index].nights = numericValue;
    setStayLocations(updated);
  };

  // ---------- Remove Stay Location ----------
  const handleRemoveStayLocation = (index) => {
    const updatedStay = [...stayLocations];
    const removedLocation = updatedStay.splice(index, 1)[0];
    
    // Add back to available locations
    setLocations(prev => [...prev, removedLocation.name]);
    setStayLocations(updatedStay);
  };

  // ---------- Save & Continue ----------
  const handleSave = async () => {
    if (!quotationId || quotationId === "new") {
      toast.error("Please complete Step 1 first!");
      return;
    }

    // Validation for empty stay locations
    if (stayLocations.length === 0) {
      toast.error("Please add at least one stay location by dragging from the left panel");
      return;
    }

    // Validate that all nights are filled and valid
    const incompleteNights = stayLocations.some(loc => !loc.nights || loc.nights === "" || loc.nights < 1);
    if (incompleteNights) {
      toast.error("Please enter a valid number of nights (1-30) for all stay locations");
      return;
    }

    setLoading(true);

    // Transform data to match backend expectations
    const transformedStayLocations = stayLocations.map((loc, index) => ({
      name: loc.name,
      nights: parseInt(loc.nights) || 1
    }));

    try {
      const resultAction = await dispatch(
        step2Update({ quotationId, stayLocation: transformedStayLocations })
      );

      if (step2Update.fulfilled.match(resultAction)) {
        toast.success("Step 2 saved successfully!");
        navigate(`/fullquotation/${quotationId}/step/3`);
      } else {
        const errorMessage = resultAction.payload?.message || "Failed to save Step 2";
        toast.error(errorMessage);
        console.error("Error:", resultAction.payload);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An unexpected error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total nights
  const totalNights = stayLocations.reduce((total, loc) => total + (parseInt(loc.nights) || 0), 0);
  const totalDays = totalNights + 1; // Nights + 1 = Days

  // ---------- UI ----------
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Quotation Itinerary {totalNights}N/{totalDays}D
      </Typography>

      {/* Quotation ID Display */}
      {quotationId && quotationId !== "new" && (
        <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
          Quotation ID: <strong>{quotationId}</strong>
        </Typography>
      )}

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
          <MenuItem value="Nepal">Nepal</MenuItem>
          <MenuItem value="Assam">Assam</MenuItem>
        </TextField>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={2}>
          {/* Left: Available Locations */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Available Locations ({locations.length})
            </Typography>
            <Typography variant="caption" color="error">
              Drag & drop to add to itinerary
            </Typography>

            <Droppable droppableId="locations">
              {(provided, snapshot) => (
                <Paper
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    minHeight: 200,
                    maxHeight: 400,
                    overflowY: "auto",
                    mt: 1,
                    p: 1,
                    border: "1px solid #ddd",
                    backgroundColor: snapshot.isDraggingOver ? "#f0f0f0" : "#ffffff",
                  }}
                >
                  {locations.length === 0 ? (
                    <Typography
                      variant="body2"
                      sx={{ p: 2, color: "text.secondary", textAlign: "center" }}
                    >
                      All locations added to itinerary
                    </Typography>
                  ) : (
                    locations.map((loc, index) => (
                      <Draggable key={loc} draggableId={loc} index={index}>
                        {(provided, snapshot) => (
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
                              bgcolor: snapshot.isDragging ? "#e0e0e0" : "#f9f9f9",
                              borderRadius: 1,
                              border: "1px solid #eee",
                              cursor: "grab",
                              transform: snapshot.isDragging ? "rotate(5deg)" : "none",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <RoomIcon color="warning" fontSize="small" />
                            <Typography variant="body2">{loc}</Typography>
                          </Box>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </Paper>
              )}
            </Droppable>
          </Grid>

          {/* Right: Stay Locations */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Itinerary Locations ({stayLocations.length})
              </Typography>
              {totalNights > 0 && (
                <Typography variant="caption" color="primary">
                  Total: {totalNights} nights, {totalDays} days
                </Typography>
              )}
            </Box>
            <Typography variant="caption" color="error">
              Arrange cities in itinerary order
            </Typography>

            <Droppable droppableId="stayLocations">
              {(provided, snapshot) => (
                <Paper
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    minHeight: 200,
                    maxHeight: 400,
                    overflowY: "auto",
                    mt: 1,
                    p: 1,
                    border: "1px solid #ddd",
                    backgroundColor: snapshot.isDraggingOver ? "#e8f4ff" : "#ffffff",
                  }}
                >
                  {stayLocations.length === 0 ? (
                    <Typography
                      variant="body2"
                      sx={{ p: 2, color: "text.secondary", textAlign: "center" }}
                    >
                      No cities added yet. Drag from the left panel to build your itinerary.
                    </Typography>
                  ) : (
                    stayLocations.map((loc, index) => (
                      <Draggable key={`${loc.name}-${index}`} draggableId={`${loc.name}-${index}`} index={index}>
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              p: 1.5,
                              mb: 1.5,
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                              bgcolor: snapshot.isDragging ? "#d4e6ff" : "#e8f4ff",
                              borderRadius: 1,
                              border: "2px solid #cce4ff",
                              cursor: "grab",
                              transform: snapshot.isDragging ? "rotate(5deg)" : "none",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <RoomIcon color="primary" fontSize="small" />
                                <Typography variant="body1" fontWeight="medium">
                                  {loc.name}
                                </Typography>
                              </Box>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleRemoveStayLocation(index)}
                                sx={{ minWidth: 'auto', p: 0.5 }}
                              >
                                ✕
                              </Button>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <TextField
                                type="number"
                                label="No. of Nights"
                                size="small"
                                value={loc.nights}
                                onChange={(e) => handleNightsChange(index, e.target.value)}
                                inputProps={{ 
                                  min: 1, 
                                  max: 30,
                                  style: { textAlign: 'center' }
                                }}
                                sx={{ width: 120 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {loc.nights === 1 ? 'night' : 'nights'}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </Paper>
              )}
            </Droppable>
          </Grid>
        </Grid>
      </DragDropContext>

      {/* Action Buttons */}
      <Box textAlign="center" sx={{ mt: 3 }} display="flex" justifyContent="center" gap={2}>
        <Button
          variant="outlined"
          sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          onClick={() => navigate(`/fullquotation/${quotationId}/step/1`)}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          variant="contained"
          sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          onClick={handleSave}
          disabled={loading || stayLocations.length === 0}
          startIcon={loading ? <></> : null}
        >
          {loading ? "Saving..." : "Save & Continue"}
        </Button>
      </Box>

      {/* Validation Summary */}
      {stayLocations.length > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Itinerary Summary:</strong> {stayLocations.map((loc, index) => (
              <span key={index}>
                {loc.name} ({loc.nights} {loc.nights === 1 ? 'night' : 'nights'})
                {index < stayLocations.length - 1 ? ' → ' : ''}
              </span>
            ))}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FullQuotationStep2;