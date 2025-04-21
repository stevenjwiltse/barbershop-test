import React, { useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Button,
  CircularProgress,
  Container,
  Paper,
  Select,
  OutlinedInput,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  Grid,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { useKeycloak } from "../hooks/useKeycloak";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Base from "./Base";
import { BarberResponse, createAppointmentApiV1AppointmentsPost, getAllBarbersApiV1BarbersGet, ScheduleResponse } from "../api";
import { fetchServices, Service } from "../effects/services";
import { getSchedules, Schedule, TimeSlot } from "../effects/schedule";
import { AppointmentStatus } from "../api/types.gen";
import BookingConfirmation from "../components/BookingConfirmation"
import { useNavigate } from "react-router";

const Booking = () => {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  if (!keycloak) {
    // Keycloak is not initialized yet, return null or a loading spinner
    return <div>Loading...</div>;
  }
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [barbers, setBarbers] = useState<BarberResponse[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<BarberResponse | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [maxServiceDuration, setMaxServiceDuration] = useState<number>(0);
  const [requiredSlots, setRequiredSlots] = useState<number>(0);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");


  const today = new Date();
  // Set max date to 7 days from today
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 7);


  const handleDateChange = async (date: Date | null) => {
    setSelectedDate(date);
    setSelectedBarber(null);
    setServices([]);
    setSelectedServices([]);
    setTimeSlots([]);
    setSelectedTimeSlots([]);

    if (date) {
      setLoading(true);
      try {
        const formattedDate = date.toISOString().split("T")[0];
        const { response, data } = await getAllBarbersApiV1BarbersGet({
          headers: {
            "Authorization": `Bearer ${keycloak.token}`,
          },
          query: {
            schedule_date: formattedDate,
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch barbers");
        }
        if (!data) {
          throw new Error("No barbers found");
        }
        setBarbers(data);
      } catch (error) {
        console.error("Error fetching barbers:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBarberChange = async (barberId: string) => {
    // Get the barber object from the selected barber ID
    const selectedBarberObj = barbers.find((barber) => barber.barber_id === parseInt(barberId));
    if (!selectedBarberObj || !selectedDate) {
      console.error("Barber not found");
      return;
    }
    setSelectedBarber(selectedBarberObj);
    setSelectedServices([]);
    setTimeSlots([]);
    setSelectedTimeSlots([]);
    setLoading(true);
    try {
      const services = await fetchServices();
      setServices(services);
      const schedules = await getSchedules(
        keycloak.token || "",
        selectedDate,
        selectedBarberObj.barber_id
      );
      if (schedules.length !== 1) {
        throw new Error("No schedule found for the selected barber");
      }
      setSelectedSchedule(schedules[0]);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (event: SelectChangeEvent<string[]>, _child: React.ReactNode) => {
    const {
      target: { value },
    } = event;
    const serviceIds = typeof value === "string" ? value.split(",") : value;
    setSelectedServices(serviceIds);
    const selectedServices = services.filter((service) =>
      serviceIds.map(Number).includes(service.service_id)
    );
    const maxDuration = Math.max(
      ...selectedServices.map((service) => service.duration)
    );
    setMaxServiceDuration(maxDuration);
    setSelectedTimeSlots([]);

    if (serviceIds.length > 0 && selectedDate && selectedBarber && selectedSchedule) {
      setLoading(true);
      // Filter the time slots by if they are available and not booked
      const filteredTimeSlots = selectedSchedule.timeSlots.filter((slot) => {

        const isAvailable = slot.isAvailable && !slot.isBooked;
        // Make sure the time slot is in the future
        const slotDate = new Date(selectedDate);
        const [hours, minutes] = slot.startTime.split(":").map(Number);
        slotDate.setHours(hours, minutes, 0, 0);
        const isInFuture = slotDate >= new Date();
        return isAvailable && isInFuture;
      });

      // Calculate the required number of consecutive slots
      const requiredSlots = Math.ceil(maxDuration / 30); // Each slot is 30 minutes
      setRequiredSlots(requiredSlots);

      // Find groups of consecutive time slots
      const consecutiveTimeSlots = [];
      for (let i = 0; i <= filteredTimeSlots.length - requiredSlots; i++) {
        const group = filteredTimeSlots.slice(i, i + requiredSlots);
        const isConsecutive = group.every((slot, index) => {
          if (index === 0) return true; // First slot in the group
          const prevSlot = group[index - 1];
          return slot.id === prevSlot.id + 1; // Check if the current slot is consecutive
        });

        if (isConsecutive) {
          consecutiveTimeSlots.push(...group);
          i += requiredSlots - 1; // Skip to the end of the group
        }
      }


      setTimeSlots(consecutiveTimeSlots);
      setLoading(false);
    }
  };

  const toggleTimeSlot = (slotId: number) => {
    // Check if the slot is already selected
    const isSelected = selectedTimeSlots.includes(slotId);
    if (isSelected) {
      // If selected, remove it from the selected time slots
      setSelectedTimeSlots((prev) => prev.filter((id) => id !== slotId));
    } else {
      // If not selected, add it to the selected time slots
      setSelectedTimeSlots((prev) => [...prev, slotId]);
    }
    // Update the time slots state to reflect the selection
    setTimeSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, selected: !slot.selected } : slot
      )
    );
  };

  const handleConfirmAppointment = async () => {
    if (!selectedBarber || !selectedDate || !selectedSchedule) {
      setSnackbarMessage("Please select a barber and date.");
      setSnackbarOpen(true);
      return;
    }

    const selectedTimeSlotsData = timeSlots.filter((slot) =>
      selectedTimeSlots.includes(slot.id)
    );

    // Validate that the selected time slots are consecutive maxServiceDuration > 30
    if (selectedTimeSlotsData.length < 1) {
      setSnackbarMessage("Please select at least one time slot.");
      setSnackbarOpen(true);
      return;
    }

    const requiredSlots = Math.ceil(maxServiceDuration / 30); // Each slot is 30 minutes

    if (selectedTimeSlotsData.length < requiredSlots) {
      setSnackbarMessage("Please select enough time slots for the selected services.");
      setSnackbarOpen(true);
      return;
    }
    if (selectedTimeSlotsData.length > requiredSlots) {
      setSnackbarMessage("Please select only the required number of time slots.");
      setSnackbarOpen(true);
      return;
    }
    if (selectedTimeSlotsData.length > 1) {
      const isConsecutive = selectedTimeSlotsData.every((slot, index) => {
        if (index === 0) return true; // First slot in the group
        const prevSlot = selectedTimeSlotsData[index - 1];
        return slot.id === prevSlot.id + 1; // Check if the current slot is consecutive
      });
      if (!isConsecutive) {
        setSnackbarMessage("Please select consecutive time slots.");
        setSnackbarOpen(true);
        return;
      }
    }

    const selectedServicesData = services.filter((service) =>
      selectedServices.map(Number).includes(service.service_id)
    );

    // Proceed with the appointment confirmation
    const appointmentData = {
      user_id: 1, // Replace with the actual user ID
      barber_id: selectedBarber.barber_id,
      status: "pending" as AppointmentStatus,
      time_slot: selectedTimeSlotsData.map((slot) => slot.id),
      service_id: selectedServices.map((serviceId) => parseInt(serviceId)),
    };
    // Send the appointment data to the server
    try {
      const { response, data } = await createAppointmentApiV1AppointmentsPost({
        headers: {
          "Authorization": `Bearer ${keycloak.token}`,
        },
        body: appointmentData,
      })
      if (!response.ok) {
        throw new Error("Failed to create appointment");
      }
      if (!data) {
        throw new Error("Failed to create appointment");
      }
      setSnackbarMessage("Appointment created successfully!");
      setSnackbarOpen(true);
      navigate(`/appointments/${data.appointment_id}/confirm`);
    } catch (error) {
      console.error("Error creating appointment:", error);
      setSnackbarMessage("Failed to create appointment. Please try again.");
      setSnackbarOpen(true);
      return;
    }
  };

  return (
    <Base
      children={
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Book an Appointment
            </Typography>

            {/* Date Picker */}
            <FormControl fullWidth>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select a Date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  disablePast
                  maxDate={maxDate}
                />
              </LocalizationProvider>
            </FormControl>

            {/* Barber Selection */}
            {selectedDate && barbers.length > 0 && (
              <Box mt={3}>
                {loading ? (
                  <CircularProgress />
                ) : (<FormControl fullWidth>
                  <InputLabel id="barber-select-label">Select a barber</InputLabel>
                  <Select
                    labelId="barber-select-label"
                    id="barber-select"
                    value={selectedBarber?.barber_id.toString() || ""}
                    label="Select a barber"
                    onChange={(e: SelectChangeEvent) => handleBarberChange(e.target.value)}
                  >
                    {barbers.map((barber: BarberResponse) => (
                      <MenuItem key={barber.barber_id} value={barber.barber_id}>
                        {barber.user.firstName} {barber.user.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                )}
              </Box>
            )}
            {/* No Barbers Available */}
            {selectedDate && barbers.length === 0 && (
              <Box mt={3}>
                <Typography variant="h6" color="error">
                  No barbers available for the selected date.
                </Typography>
              </Box>
            )}

            {/* Service Selection */}
            {selectedBarber && services.length > 0 && (
              <Box mt={3}>
                {loading ? (
                  <CircularProgress />
                ) : (<FormControl fullWidth>
                  <InputLabel id="services-select-label">Select service(s)</InputLabel>
                  <Select<string[]>
                    labelId="services-select-label"
                    id="services-select"
                    multiple
                    value={selectedServices} // Not sure why this is typing is not working
                    label="Select service(s)"
                    onChange={handleServiceChange}
                    input={<OutlinedInput label="Select service(s)" />}
                  >
                    {services.map((service) => (
                      <MenuItem key={service.service_id} value={service.service_id}>
                        {service.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                )}
              </Box>
            )}
            {/* No Services Available */}
            {selectedBarber && services.length === 0 && (
              <Box mt={3}>
                <Typography variant="h6" color="error">
                  No services available for the selected barber.
                </Typography>
              </Box>
            )}

            {/* Timeslot Selection */}
            {selectedServices.length > 0 && selectedSchedule && timeSlots.length > 0 && (
              <Box mt={3}>
                <Typography variant="h6">Select a Time Slot (Required slots: {requiredSlots})</Typography>
                {loading ? (
                  <CircularProgress />
                ) : (
                  <Grid container spacing={2}>
                    {timeSlots.map((slot) => (
                      <Grid item xs={6} sm={4} md={3} key={slot.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={slot.selected}
                              onChange={() => toggleTimeSlot(slot.id)}
                            />
                          }
                          label={slot.timeDisplay}
                          sx={{
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                            p: 1,
                            width: "100%",
                            bgcolor: slot.selected
                              ? "primary.light"
                              : "background.paper",
                            color: slot.selected
                              ? "primary.contrastText"
                              : "text.primary",
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
            {/* No Time Slots Available */}
            {selectedServices.length > 0 && selectedSchedule && timeSlots.length === 0 && (
              <Box mt={3}>
                <Typography variant="h6" color="error">
                  No time slots available for the selected barber and date.
                </Typography>
              </Box>
            )}

            {/* Confirm Button */}
            {selectedTimeSlots.length > 0 && (
              <Box mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleConfirmAppointment}
                >
                  Confirm Appointment
                </Button>
              </Box>
            )}
          </Paper>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
          >
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity={
                snackbarMessage.includes("successfully") ? "success" : "error"
              }
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Container>
      }
    />
  );
};

export default Booking;