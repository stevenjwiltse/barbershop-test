import { Box } from "@mui/material";
import Base from "./Base";
import ServicesList from "../components/ServicesList";

export default function Services() {
  return (
    <Base
      children={
        <Box>
          <ServicesList />
        </Box>
      }
    ></Base>
  );
}