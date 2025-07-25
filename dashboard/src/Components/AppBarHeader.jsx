import React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Avatar,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft,
  LocalOffer,
  Notifications,
  CalendarToday,
  Storage,
} from "@mui/icons-material";
import { useLocation } from "react-router-dom";

const DashboardHeader = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const location = useLocation();

  
  const pageTitles = {
    "/": "Dashboard",
    "/lead": "Leads Manager",
    "/quotation": "Quotation Manager",
    "/hotel": "Hotel Manager",
    "/tourpackage": "Package Manager",
    "/payment": "Payment Manager",
    "/invoice": "Invoice Manager",
    "/associates": "Business Associates Manager",
    "/staff": "Staff Manager",
    "/setting": "Settings",
    "/profile": "Profile",
  };

  const title = pageTitles[location.pathname] || "Page";

  return (
    <AppBar position="static" color="inherit" elevation={1}>
      <Toolbar
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          gap: isMobile ? 1 : 0,
          py: isMobile ? 1 : 0,
        }}
      >
      
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: isMobile ? "space-between" : "flex-start",
            width: isMobile ? "100%" : "auto",
            gap: 2,
            order: isMobile ? 1 : 0,
          }}
        >
          <IconButton
            sx={{
              bgcolor: "primary.main",
              color: "#fff",
              "&:hover": { bgcolor: "primary.dark" },
              width: 36,
              height: 36,
            }}
          >
            <ChevronLeft />
          </IconButton>
          <Typography variant="h5" color="primary" fontWeight="bold">
            {title}
          </Typography>
        </Box>

        {/* Center Logo - Hidden on mobile */}
        {!isMobile && (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              order: isTablet ? 2 : 1,
            }}
          >
            <Avatar
              variant="square"
              src="https://iconicyatra.com/assets/img/logo.png"
              sx={{
                width: isTablet ? 120 : 140,
                height: isTablet ? 30 : 40,
                mx: "auto",
              }}
              alt="IconicYatra Logo"
            />
          </Box>
        )}

        {/* Right Section: Icons + Company Name */}
        <Stack
          direction="row"
          spacing={isMobile ? 1 : 2}
          alignItems="center"
          justifyContent={isMobile ? "space-between" : "flex-end"}
          sx={{
            width: isMobile ? "100%" : "auto",
            order: isMobile ? 2 : 2,
          }}
        >
          <IconButton size={isMobile ? "small" : "medium"}>
            <Badge badgeContent={0} color="success">
              <LocalOffer fontSize={isMobile ? "small" : "medium"} />
            </Badge>
          </IconButton>
          <IconButton size={isMobile ? "small" : "medium"}>
            <Notifications fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
          <IconButton size={isMobile ? "small" : "medium"}>
            <CalendarToday fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
          <IconButton size={isMobile ? "small" : "medium"}>
            <Storage fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
          {!isMobile && (
            <Box textAlign="right" ml={1}>
              <Typography fontWeight={600} color="primary" variant="body1">
                Iconic Yatra
              </Typography>
              <Typography variant="body2" fontStyle="italic" color="orange">
                Company
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Bottom Logo for Mobile */}
        {isMobile && (
          <Box
            sx={{
              textAlign: "center",
              mt: 1,
              order: 3,
              width: "100%",
            }}
          >
            <Avatar
              variant="square"
              src="https://iconicyatra.com/assets/img/logo.png"
              sx={{ width: 120, height: 30, mx: "auto" }}
              alt="IconicYatra Logo"
            />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default DashboardHeader;
