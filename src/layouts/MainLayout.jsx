import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LogoutIcon from "@mui/icons-material/Logout";

import { useAuth } from "../contexts/AuthContext";
import { hasPermission } from "../services/permissions";

const drawerWidth = 240;

export default function MainLayout() {
  const navigate = useNavigate();

  const { profile, role, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/dashboard",
    },

    {
      text: "Clases",
      icon: <SchoolIcon />,
      path: "/clases",
      resource: "clases",
      action: "leer",
    },

    {
      text: "Evaluaciones",
      icon: <AssignmentIcon />,
      path: "/evaluaciones",
      resource: "evaluaciones",
      action: "leer",
    },
    {
      text: "Notas",
      icon: <AssignmentIcon />,
      path: "/notas",
      resource: "evaluaciones",
      action: "leer",
    },
  ];

  const visibleMenuItems = menuItems.filter(
    (item) => !item.resource || hasPermission(role, item.resource, item.action),
  );

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleNavigate = (path) => {
    navigate(path);

    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await logout();

    navigate("/login");
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ======================================================
          LOGO
      ======================================================= */}

      <Toolbar
        sx={{
          minHeight: {
            xs: 64,
            sm: 70,
          },
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            Residencias
          </Typography>

          <Typography
            variant="caption"
            sx={{
              opacity: 0.8,
            }}
          >
            Sistema de gestión
          </Typography>
        </Box>
      </Toolbar>

      <Divider
        sx={{
          borderColor: "rgba(255,255,255,0.2)",
        }}
      />

      {/* ======================================================
          MENU
      ======================================================= */}

      <List
        sx={{
          px: 1,
          py: 2,
        }}
      >
        {visibleMenuItems.map((item) => (
          <ListItem
            key={item.path}
            disablePadding
            sx={{
              mb: 0.5,
            }}
          >
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              sx={{
                borderRadius: 0,

                color: "white",

                "&:hover": {
                  backgroundColor: "rgba(118,196,87,0.25)",
                },

                "& .MuiListItemIcon-root": {
                  color: "#76C457",
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>

              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* ======================================================
          LOGOUT
      ======================================================= */}

      <Box
        sx={{
          mt: "auto",
          p: 1,
        }}
      >
        <Divider
          sx={{
            mb: 1,

            borderColor: "rgba(255,255,255,0.2)",
          }}
        />

        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 0,

              color: "white",

              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: "#FBE6C2",
              }}
            >
              <LogoutIcon />
            </ListItemIcon>

            <ListItemText primary="Cerrar sesión" />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",

        minHeight: "100vh",
      }}
    >
      {/* ======================================================
          APP BAR
      ======================================================= */}

      <AppBar
        position="fixed"
        sx={{
          width: {
            sm: `calc(100% - ${drawerWidth}px)`,
          },

          ml: {
            sm: `${drawerWidth}px`,
          },

          backgroundColor: "primary.main",

          boxShadow: "0 2px 8px rgba(42,124,19,0.18)",

          borderRadius: 0,
        }}
      >
        <Toolbar
          sx={{
            minHeight: {
              xs: 60,
              sm: 64,
            },
          }}
        >
          {/* MOBILE MENU */}

          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 1,

              display: {
                xs: "inline-flex",
                sm: "none",
              },

              borderRadius: 0,
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,

              fontWeight: 700,

              fontSize: {
                xs: "1rem",
                sm: "1.25rem",
              },
            }}
          >
            Sistema de Residencias
          </Typography>

          {/* ==================================================
              USER
          =================================================== */}

          <Avatar
            sx={{
              width: {
                xs: 34,
                sm: 38,
              },

              height: {
                xs: 34,
                sm: 38,
              },

              bgcolor: "secondary.main",

              color: "primary.dark",

              fontWeight: 700,

              borderRadius: 0,
            }}
          >
            {profile?.first_name?.charAt(0)?.toUpperCase()}
          </Avatar>

          <Box
            sx={{
              ml: 1,

              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
              }}
            >
              {profile?.first_name} {profile?.last_name}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                opacity: 0.85,

                textTransform: "capitalize",
              }}
            >
              {role}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ======================================================
          DRAWER
      ======================================================= */}

      <Box
        component="nav"
        sx={{
          width: {
            sm: drawerWidth,
          },

          flexShrink: {
            sm: 0,
          },
        }}
      >
        {/* MOBILE */}

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: {
              xs: "block",
              sm: "none",
            },

            "& .MuiDrawer-paper": {
              width: drawerWidth,

              boxSizing: "border-box",

              backgroundColor: "primary.main",

              color: "white",

              borderRadius: 0,

              borderRight: "none",
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* DESKTOP */}

        <Drawer
          variant="permanent"
          open
          sx={{
            display: {
              xs: "none",
              sm: "block",
            },

            "& .MuiDrawer-paper": {
              width: drawerWidth,

              boxSizing: "border-box",

              backgroundColor: "primary.main",

              color: "white",

              borderRight: "none",

              borderRadius: 0,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* ======================================================
          MAIN
      ======================================================= */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,

          width: {
            xs: "100%",
            sm: `calc(100% - ${drawerWidth}px)`,
          },

          minHeight: "100vh",

          backgroundColor: "background.default",

          overflowX: "hidden",

          borderRadius: 0,
        }}
      >
        <Toolbar
          sx={{
            minHeight: {
              xs: 60,
              sm: 64,
            },
          }}
        />

        <Box
          sx={{
            width: "100%",

            maxWidth: 1600,

            mx: "auto",

            p: {
              xs: 2,
              sm: 3,
              md: 4,
            },

            borderRadius: 0,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
