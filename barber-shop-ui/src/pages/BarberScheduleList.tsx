import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
  Container,
  Grid,
  Divider,
  Card,
  CardContent,
  Tooltip,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EventIcon from "@mui/icons-material/Event";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import ScheduleIcon from "@mui/icons-material/Schedule";
import {
  format,
  parseISO,
  isToday,
  isFuture,
  isPast,
  isThisWeek,
  isThisMonth,
} from "date-fns";
import Base from "./Base";
import { getSchedulesApiV1SchedulesGet, ScheduleResponse } from "../api";
import { useKeycloak } from "../hooks/useKeycloak";
import { useParams } from "react-router";
import { deleteScheduleApiV1SchedulesScheduleIdDelete } from "../api/sdk.gen";
import { getSchedules } from "../effects/schedule";

// Define types
interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Schedule {
  id: number;
  date: string;
  barberId: number;
  barberName: string;
  timeSlots: TimeSlot[];
  appointmentCount: number;
}

export default function ScheduleManagementPage() {
  const { keycloak } = useKeycloak();
  if (!keycloak) {
    // Keycloak is not initialized yet, return null or a loading spinner
    return <div>Loading...</div>;
  }
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);
  const [filter, setFilter] = useState("all"); // all, today, upcoming, past
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Fetch schedules from API
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const schedules = await getSchedules(
          keycloak.token || "",
          undefined,
          undefined
        );
        setSchedules(schedules);
        setLoading(false);
      } catch (err) {
        setError("Failed to load schedules. Please try again later.");
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Filter schedules based on criteria
  const filteredSchedules = schedules
    .filter((schedule) => {
      const scheduleDate = parseISO(schedule.date);

      // Filter by date range if set
      if (startDate && endDate) {
        const date = parseISO(schedule.date);
        return date >= startDate && date <= endDate;
      }

      // Apply preset filters
      switch (filter) {
        case "today":
          return isToday(scheduleDate);
        case "upcoming":
          return isFuture(scheduleDate);
        case "past":
          return isPast(scheduleDate);
        case "thisWeek":
          return isThisWeek(scheduleDate);
        case "thisMonth":
          return isThisMonth(scheduleDate);
        default:
          return true;
      }
    })
    .filter((schedule) => {
      // Apply search term filter
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();
      return (
        schedule.barberName.toLowerCase().includes(searchLower) ||
        schedule.date.includes(searchTerm)
      );
    });

  // Handle schedule deletion
  const handleDelete = async () => {
    if (scheduleToDelete === null) return;

    try {
      const { response, error } =
        await deleteScheduleApiV1SchedulesScheduleIdDelete({
          path: { schedule_id: scheduleToDelete },
          headers: {
            "Authorization": `Bearer ${keycloak.token}`,
          }
        });
      if (!response.ok) {
        throw new Error(
          "Failed to delete schedule. Please try again."
        );
      }
      // Update local state for demo
      setSchedules(schedules.filter((s) => s.id !== scheduleToDelete));
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    } catch (err) {
      setError("Failed to delete schedule. Please try again.");
    }
  };

  // Prepare to delete a schedule
  const openDeleteDialog = (id: number) => {
    setScheduleToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Calculate available slots percentage
  const calculateAvailability = (schedule: Schedule) => {
    const availableSlots = schedule.timeSlots.filter(
      (slot) => slot.isAvailable
    ).length;
    const totalSlots = schedule.timeSlots.length;
    return Math.round((availableSlots / totalSlots) * 100);
  };

  // Reset filters
  const resetFilters = () => {
    setFilter("all");
    setStartDate(null);
    setEndDate(null);
    setSearchTerm("");
    setFilterDialogOpen(false);
  };

  // Apply date range filter
  const applyDateFilter = () => {
    setFilter("custom");
    setFilterDialogOpen(false);
  };

  return (
    <Base
      children={
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h4" component="h1">
                Schedule Management
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EventIcon />}
                href="schedules/new" // Link to the schedule creation page
              >
                Create New Schedule
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Today's Schedules
                    </Typography>
                    <Typography variant="h4">
                      {
                        schedules.filter((s) => isToday(parseISO(s.date)))
                          .length
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Upcoming Schedules
                    </Typography>
                    <Typography variant="h4">
                      {
                        schedules.filter((s) => isFuture(parseISO(s.date)))
                          .length
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      This Week
                    </Typography>
                    <Typography variant="h4">
                      {
                        schedules.filter((s) => isThisWeek(parseISO(s.date)))
                          .length
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Schedules
                    </Typography>
                    <Typography variant="h4">{schedules.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Filters */}
            <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search schedules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon
                      fontSize="small"
                      sx={{ mr: 1, color: "text.secondary" }}
                    />
                  ),
                }}
                sx={{ flexGrow: 1, minWidth: "200px" }}
              />

              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFilterDialogOpen(true)}
              >
                Filters
              </Button>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label="All"
                  variant={filter === "all" ? "filled" : "outlined"}
                  color={filter === "all" ? "primary" : "default"}
                  onClick={() => setFilter("all")}
                />
                <Chip
                  label="Today"
                  variant={filter === "today" ? "filled" : "outlined"}
                  color={filter === "today" ? "primary" : "default"}
                  onClick={() => setFilter("today")}
                />
                <Chip
                  label="Upcoming"
                  variant={filter === "upcoming" ? "filled" : "outlined"}
                  color={filter === "upcoming" ? "primary" : "default"}
                  onClick={() => setFilter("upcoming")}
                />
                <Chip
                  label="Past"
                  variant={filter === "past" ? "filled" : "outlined"}
                  color={filter === "past" ? "primary" : "default"}
                  onClick={() => setFilter("past")}
                />
              </Box>
            </Box>

            {/* Error message */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Loading or empty state */}
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredSchedules.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6" color="textSecondary">
                  No schedules found
                </Typography>
                <Typography color="textSecondary" sx={{ mt: 1 }}>
                  Try adjusting your filters or create a new schedule
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Barber</TableCell>
                      <TableCell>Availability</TableCell>
                      <TableCell>Appointments</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSchedules.map((schedule) => {
                      const availability = calculateAvailability(schedule);
                      return (
                        <TableRow key={schedule.id}>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <CalendarMonthIcon
                                sx={{ mr: 1, color: "primary.main" }}
                              />
                              <Box>
                                <Typography variant="body1">
                                  {format(
                                    parseISO(schedule.date),
                                    "MMMM d, yyyy"
                                  )}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  {isToday(parseISO(schedule.date))
                                    ? "Today"
                                    : format(parseISO(schedule.date), "EEEE")}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{schedule.barberName}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box sx={{ width: "100%", mr: 1 }}>
                                <Box
                                  sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    bgcolor: "#e0e0e0",
                                    position: "relative",
                                    overflow: "hidden",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      left: 0,
                                      top: 0,
                                      height: "100%",
                                      width: `${availability}%`,
                                      bgcolor:
                                        availability > 70
                                          ? "success.main"
                                          : availability > 30
                                            ? "warning.main"
                                            : "error.main",
                                    }}
                                  />
                                </Box>
                              </Box>
                              <Typography variant="body2">
                                {availability}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${schedule.appointmentCount} bookings`}
                              size="small"
                              icon={<ScheduleIcon />}
                              color={
                                schedule.appointmentCount > 0
                                  ? "primary"
                                  : "default"
                              }
                              variant={
                                schedule.appointmentCount > 0
                                  ? "filled"
                                  : "outlined"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Edit Schedule">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  href={`/schedules/${schedule.id}`}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Schedule">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => openDeleteDialog(schedule.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>Delete Schedule</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this schedule? This will cancel
                all associated appointments and cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleDelete} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Filter Dialog */}
          <Dialog
            open={filterDialogOpen}
            onClose={() => setFilterDialogOpen(false)}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>Filter Schedules</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Date Range
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={setStartDate}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={setEndDate}
                      />
                    </Grid>
                  </Grid>
                </LocalizationProvider>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={resetFilters}>Reset</Button>
              <Button
                onClick={applyDateFilter}
                color="primary"
                variant="contained"
                disabled={!startDate || !endDate}
              >
                Apply Filters
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      }
    />
  );
};
