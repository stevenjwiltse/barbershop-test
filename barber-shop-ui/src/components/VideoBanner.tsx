import { Box, Button, CardMedia, Stack, Typography } from "@mui/material";
import barberVid from "../../public/videos/barberBanner.mp4";

const VideoBanner = () => {
  return (
    <Box
      sx={{
        position: "relative",
        height: "75vh",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack spacing={2} alignItems="center" sx={{
        padding: "20px",
      }}>
        <Typography
          variant="h4"
          sx={{
            color: "white",
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            textAlign: "center",
          }}
        >
          Sharp Cuts, Fresh Looks - Where Style Begins!
        </Typography>
        <Button size="large" variant="contained" color="primary" href="/book-appointment" sx={{
          maxWidth: "200px",
        }}>
          Book Now
        </Button>
      </Stack>

      <CardMedia
        component="video"
        image="/videos/barberBanner.mp4"
        autoPlay
        loop
        muted
        sx={{
          padding: 0,
          opacity: 0.6,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      />
    </Box>
  );
};

export default VideoBanner;
