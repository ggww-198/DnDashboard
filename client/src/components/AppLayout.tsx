import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

const nav = [
  { label: "Party", path: "/party" },
  { label: "Traits", path: "/traits" },
];

export default function AppLayout() {
  const location = useLocation();
  const value = nav.findIndex((n) => location.pathname.startsWith(n.path));

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="static" sx={{ bgcolor: "background.paper", color: "text.primary" }}>
        <Toolbar>
          <Link
            component={RouterLink}
            to="/"
            color="inherit"
            underline="none"
            sx={{ mr: 3 }}
          >
            <Typography variant="h6" component="span" sx={{ fontFamily: "Cinzel, Georgia, serif" }}>
              DnDashboard
            </Typography>
          </Link>
          <Tabs
            value={value >= 0 ? value : 0}
            textColor="inherit"
            indicatorColor="primary"
            sx={{ flex: 1 }}
          >
            {nav.map((n) => (
              <Tab
                key={n.path}
                label={n.label}
                component={RouterLink}
                to={n.path}
                value={nav.indexOf(n)}
              />
            ))}
          </Tabs>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flex: 1, p: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
