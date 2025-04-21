import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import App from './App';
import { BrowserRouter, Route, Routes } from 'react-router';
import Signup from './pages/Signup';
import { KeycloakProvider } from './context/KeycloakContext';
import Services from './pages/Services';
import BarberSchedule from './pages/BarberSchedule';
import ScheduleManagementPage from './pages/BarberScheduleList';
import AboutUsPage from './pages/AboutUs';
import PrivateRoute from './PrivateRoute';
import Booking from './pages/Booking';
import AppointmentConfirmation from './pages/AppointmentConfirmation';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <KeycloakProvider>
          <Routes>
            <Route index element={<App />} />
            <Route path="about" element={<AboutUsPage />} />
            <Route path="appointments/:appointmentId/confirm" element={<PrivateRoute roles={[]} children={<AppointmentConfirmation />} />} />
            <Route path="book-appointment" element={<PrivateRoute roles={[]} children={<Booking />} />} />
            <Route path="services" element={<Services />} />
            <Route path="signup" element={<Signup />} />
            <Route path="schedules" element={<PrivateRoute roles={["barber"]} children={<ScheduleManagementPage />} />} />
            <Route path="schedules/new" element={<PrivateRoute roles={["barber"]} children={<BarberSchedule />} />} />
            <Route path="schedules/:scheduleId" element={<PrivateRoute roles={["barber"]} children={<BarberSchedule />} />} />
          </Routes>
        </KeycloakProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
