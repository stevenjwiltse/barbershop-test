import { Box } from "@mui/material";
import { ReactNode } from "react";
import Navbar, { NavItemsType } from "../components/Navbar";
import Footer from "../components/Footer";
import { useKeycloak } from "../hooks/useKeycloak";

type BaseProps = {
  children: ReactNode;
};

export default function Base({ children }: BaseProps) {
  const { keycloak, authenticated } = useKeycloak();
  if (!keycloak) {
    return null; // or handle loading state
  }
  const navItems: NavItemsType[] = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "About Us",
      link:
        "/about",
    },
    {
      name: "Services",
      link: "/services",
    },
  ];
  const isBarber = keycloak.hasRealmRole("barber")
  const barberNavItems: NavItemsType[] = [
    {
      name: "Schedules",
      link: "/schedules",
    },
  ];
  if (isBarber) {
    navItems.push(...barberNavItems);
  }
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh", // Full viewport height
      }}>
      <Navbar navItems={navItems} />
      <Box sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  )
}