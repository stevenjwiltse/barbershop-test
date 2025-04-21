import { Box, Container, Divider, Stack, Typography } from "@mui/material"
import Base from "../pages/Base";

const AboutUs = () => {
  return (
    <Container 
      sx={{
        marginTop: "20px",
        maxHeight: "100vh",
      }}
    >
      <Stack
        spacing={2}
        divider={<Divider orientation="vertical" sx={{ color: "black" }} />}
        sx={{
          maxHeight: "100vh",
          justifyContent: "center",
          }}
        direction="row"
        >
        <Box>
          <Typography
            variant="h4"
            color="primary"
          >
            About Us
          </Typography>
          <Typography
            variant="body1"
            sx={{ marginTop: "10px" }}
          >
            At Main Street Barbershop, we believe a great haircut is more than just a service—it's an experience. Located in the heart of the city, our shop has been a staple in the community for years, providing sharp cuts, clean fades, and classic styles with a modern touch. Whether you're looking for a fresh new look or a traditional trim, our skilled barbers take pride in delivering precision and excellence with every cut.
          </Typography>
          <Typography
            variant="body1"
            sx={{ marginTop: "10px" }}
          >
            Our team consists of passionate and experienced barbers dedicated to their craft. We stay up to date with the latest trends and techniques while honoring the timeless traditions of barbering. At Main Street Barbershop, we don't just cut hair—we build relationships. We take the time to understand your style and preferences, ensuring you leave the chair feeling confident and looking your best.
          </Typography>
          <Typography
            variant="body1"
            sx={{ marginTop: "10px" }}
          >
            More than just a barbershop, we're a place where the community comes together. From casual conversations to game-day debates, our welcoming atmosphere makes every visit enjoyable. Whether you're a longtime client or a first-time guest, you'll always be treated like family. Stop by Main Street Barbershop today and experience the perfect blend of skill, service, and tradition.
          </Typography>
        </Box>
        <Box sx={{ display: { xs: "none", sm: "none", md: "block" } }}>
          <img src="/img/about-us.jpg" alt="barbershop" style={{ width: "75%", height: "100%", objectFit: "cover" }} />
        </Box>
      </Stack>
    </Container>
  );  
}

export default AboutUs;
