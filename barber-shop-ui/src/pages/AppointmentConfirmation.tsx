import React, { useEffect, useState } from "react";
import { useKeycloak } from "../hooks/useKeycloak";
import { useNavigate, useParams } from "react-router";
import Base from "./Base";
import BookingConfirmation from "../components/BookingConfirmation";
import { fetchAppointment } from "../effects/appointment";
import { AppointmentResponse } from "../api";
import { duration } from "@mui/material";

export default function AppointmentConfirmation() {
  const { keycloak } = useKeycloak();
  if (!keycloak) {
    return null; // or handle loading state
  }
  const appointmentId = useParams().appointmentId;
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentResponse>();
  const [appointmentTime, setAppointmentTime] = useState<string>();
  const [appointmentDuration, setAppointmentDuration] = useState<number>();
  const [appointmentTotalPrice, setAppointmentTotalPrice] = useState<number>();

  const handleBackToHome = () => {
    navigate("/");
  };

  useEffect(() => {
    if (!keycloak.token) {
      return;
    }
    fetchAppointment(
      keycloak.token,
      Number(appointmentId)
    )
      .then((appointment: AppointmentResponse) => {
        setAppointment(appointment);
        handleAppointmentChange(appointment);
      })
      .catch((err) => {
        console.error("Failed to fetch appointment:", err);
      });
  }, []);

  const handleAppointmentChange = (appointment: AppointmentResponse) => {
    const slot = appointment.time_slots[0];
    const hour = parseInt(slot.start_time.split(":")[0]);
    const minutes = slot.start_time.split(":")[1];
    const timeString = `${hour === 12 ? 12 : hour % 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
    setAppointmentTime(timeString);

    // Calculate the appointment duration
    const duration = Math.max(
      ...appointment.services.map((service) => service.duration)
    );
    setAppointmentDuration(duration);

    // Calculate the total price
    const totalPrice = appointment.services.reduce((total, service) => {
      return total + Number(service.price);
    }, 0);
    setAppointmentTotalPrice(totalPrice);
  }

  

  return (
    <Base
      children={
        appointment && appointmentTime && appointment.services && appointmentDuration && appointmentTotalPrice
        ? <BookingConfirmation
          barberName={appointment.barber.user.firstName + " " + appointment.barber.user.lastName}
          services={appointment.services.map((service) => service.name)}
          date={appointment.appointment_date}
          time={appointmentTime}
          duration={appointmentDuration}
          totalPrice={appointmentTotalPrice}
          onBackToHome={handleBackToHome}
        />
        : // Fallback content if appointment data is not available
        // You can replace this with a loading spinner or a message
        // indicating that the appointment is being fetched
        // For example:
        <div>Loading appointment details...</div>
      }
    />
  );
}