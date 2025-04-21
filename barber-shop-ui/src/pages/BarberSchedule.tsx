import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
  Snackbar,
  Container,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import Base from "./Base";
import { useNavigate, useParams } from "react-router";
import { BarberResponse, createScheduleApiV1SchedulesPost, getAllBarbersApiV1BarbersGet, getScheduleApiV1SchedulesScheduleIdGet, ScheduleResponse, updateScheduleApiV1SchedulesScheduleIdPut } from "../api";
import { useKeycloak } from "../hooks/useKeycloak";

interface TimeSlot {
  id: number;
  timeDisplay: string;
  startTime: string;
  endTime: string;
  selected: boolean;
}

export default function BarberSchedule() {
  const { keycloak } = useKeycloak();
  if (!keycloak) {
    // Keycloak is not initialized yet, return null or a loading spinner
    return <div>Loading...</div>;
  }
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const [barbers, setBarbers] = useState<BarberResponse[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<BarberResponse | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [existingSchedule, setExistingSchedule] = useState<ScheduleResponse | null>(null);
  const navigate = useNavigate();

  // Fetch barbers from API
  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const { response, data, error } =
          await getAllBarbersApiV1BarbersGet({
            headers: {
              "Authorization": `Bearer ${keycloak.token}`,
            }
          });
        if (!response.ok) {
          throw new Error(
            "Failed to load services. Please try again later."
          );
        }
        if (!data) {
          throw new Error("Failed to load services. Please try again later.");
        }
        setBarbers(data);
      } catch (err) {
        console.error(err);
        setSnackbarMessage("Failed to load barbers. Please try again later.");
        setSnackbarOpen(true);
      }
    };

    const fetchSchedule = async () => {
      if (!scheduleId) return;
      try {
        const { response, data, error } =
          await getScheduleApiV1SchedulesScheduleIdGet({
            path: {
              schedule_id: parseInt(scheduleId),
            },
            headers: {
              "Authorization": `Bearer ${keycloak.token}`,
            }
          })
        if (!response.ok) {
          throw new Error(
            "Failed to load schedule. Please try again later."
          );
        }
        if (!data) {
          throw new Error("Failed to load schedule. Please try again later.");
        }
        setExistingSchedule(data);
        setSelectedDate(new Date(data.date));
        setSelectedBarber(data.barber);
        const timeSlots = generateTimeSlots(new Date(data.date));
        // Update time slots based on the existing schedule
        for (const slot of data.time_slots) {
          const hour = parseInt(slot.start_time.split(":")[0]);
          const minutes = slot.start_time.split(":")[1];
          const timeString = `${hour === 12 ? 12 : hour % 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
          for (const timeSlot of timeSlots) {
            if (timeSlot.timeDisplay === timeString) {
              timeSlot.id = slot.slot_id;
              timeSlot.selected = slot.is_available;
            }
          }
        }
        // Set the time slots state
        setTimeSlots(timeSlots);
      } catch (err) {
        console.error(err);
        setSnackbarMessage("Failed to load schedule. Please try again later.");
        setSnackbarOpen(true);
      }
    };
    fetchSchedule();

    fetchBarbers();
  }, [scheduleId, keycloak.token]);

  // Generate time slots from 9am to 6pm with 30-minute intervals
  const generateTimeSlots = (date: Date) => {
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      // For each hour, create two 30-minute slots
      ["00", "30"].forEach((minutes) => {
        const timeString = `${hour === 12 ? 12 : hour % 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
        const startTime = `${hour}:${minutes}`;
        // Add 30 minutes to the start time to get the end time
        const endTime = `${minutes === "30" ? hour + 1 : hour}:${minutes === "00" ? "30" : "00"}`;
        slots.push({
          id: slots.length,
          timeDisplay: timeString,
          startTime,
          endTime,
          selected: false,
        });
      });
    }

    return slots;
  };

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      setTimeSlots(generateTimeSlots(date));
    } else {
      setTimeSlots([]);
    }
  };

  // Toggle a time slot selection
  const toggleTimeSlot = (id: number) => {
    console.log("Toggling time slot with id:", id);
    setTimeSlots(
      timeSlots.map((slot) =>
        slot.id === id ? { ...slot, selected: !slot.selected } : slot
      )
    );
  };

  // Select all time slots
  const selectAll = () => {
    setTimeSlots(timeSlots.map((slot) => ({ ...slot, selected: true })));
  };

  // Deselect all time slots
  const deselectAll = () => {
    setTimeSlots(timeSlots.map((slot) => ({ ...slot, selected: false })));
  };

  // Submit schedule to API
  const submitSchedule = async () => {
    if (!selectedDate) {
      setSnackbarMessage("Please select a date first.");
      setSnackbarOpen(true);
      return;
    }

    if (!selectedBarber) {
      setSnackbarMessage("Please select a barber first.");
      setSnackbarOpen(true);
      return;
    }

    const selectedSlots = timeSlots.filter((slot) => slot.selected);
    if (selectedSlots.length === 0) {
      setSnackbarMessage("Please select at least one time slot.");
      setSnackbarOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      // Format the data to send to the API
      const scheduleData = {
        barber_id: selectedBarber.barber_id,
        date: selectedDate.toISOString().split("T")[0],
        is_working: true,
        time_slots: timeSlots.map((slot) => {
          return {
            slot_id: slot.id,
            is_available: slot.selected,
            start_time: slot.startTime,
            end_time: slot.endTime,
          };
        }),
      };

      let response;
      if (existingSchedule) {
        // Update existing schedule
        response = await updateScheduleApiV1SchedulesScheduleIdPut({
          body: scheduleData,
          path: {
            schedule_id: existingSchedule.schedule_id,
          },
          headers: {
            "Authorization": `Bearer ${keycloak.token}`,
          }
        })
      } else {
        const { data, error } = await createScheduleApiV1SchedulesPost({
          body: scheduleData,
          headers: {
            "Authorization": `Bearer ${keycloak.token}`,
          }
        });
        if (error) {
          setSnackbarMessage("Error creating schedule. Please try again.");
          setSnackbarOpen(true);
          return;
        }
        navigate(`/schedules`);
      }


      setSnackbarMessage(
        existingSchedule ?
          "Schedule updated successfully!" :
          "Schedule created successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Error creating schedule. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
      // Redirect to dashboard "schedules" page

    }
  };

  return (
    <Base
      children={
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ mb: 2 }}>
            <Button variant="outlined" onClick={() => navigate("/schedules")}>
              Back to Schedules
            </Button>
          </Box>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Barber Schedule Creator
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                1. Select Date
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Schedule Date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  disablePast
                />
              </LocalizationProvider>
            </Box>

            {selectedDate && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  2. Select Barber
                </Typography>
                <Grid container spacing={2}>
                  {barbers.map((barber) => (
                    <Grid item xs={6} sm={4} md={3} key={barber.barber_id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedBarber?.barber_id === barber.barber_id}
                            onChange={() =>
                              setSelectedBarber(
                                selectedBarber?.barber_id === barber.barber_id ? null : barber
                              )
                            }
                          />
                        }
                        label={barber.user.firstName + " " + barber.user.lastName}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {timeSlots.length > 0 && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    3. Select Available Time Slots
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Button variant="outlined" onClick={selectAll}>
                      Select All Slots
                    </Button>
                    <Button variant="outlined" onClick={deselectAll}>
                      Deselect All Slots
                    </Button>
                  </Box>

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
                </Box>

                <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={submitSchedule}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? scheduleId
                        ? "Updating Schedule..."
                        : "Creating Schedule..."
                      : scheduleId
                        ? "Update Schedule"
                        : "Create Schedule"}
                  </Button>
                </Box>
              </>
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
}
