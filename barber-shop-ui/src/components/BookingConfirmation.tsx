import React from "react";
import { Box, Typography, Paper, Divider, Button } from "@mui/material";

interface BookingConfirmationProps {
  barberName: string;
  services: string[];
  date: string;
  time: string;
  duration: number; // in minutes
  totalPrice: number; // in currency
  onBackToHome: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  barberName,
  services,
  date,
  time,
  duration,
  totalPrice,
  onBackToHome,
}) => {
  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Appointment Confirmed!
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Thank you for booking with us. Here are your appointment details:
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Appointment Details */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Barber:
          </Typography>
          <Typography variant="body1">{barberName}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Services:
          </Typography>
          <Typography variant="body1">
            {services.join(", ")}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Date:
          </Typography>
          <Typography variant="body1">{date}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Time:
          </Typography>
          <Typography variant="body1">{time}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Duration:
          </Typography>
          <Typography variant="body1">{duration} minutes</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Total Price:
          </Typography>
          <Typography variant="body1">${totalPrice.toFixed(2)}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Back to Home Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={onBackToHome}
        >
          Back to Home
        </Button>
      </Paper>
    </Box>
  );
};

export default BookingConfirmation;