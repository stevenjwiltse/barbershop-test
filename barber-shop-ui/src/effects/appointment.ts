import { getAppointmentApiV1AppointmentsAppointmentIdGet } from "../api";

export async function fetchAppointment(
  authToken: string,
  appointmentId: number
): Promise<any> {
  try {
    const { response, data } = await getAppointmentApiV1AppointmentsAppointmentIdGet({
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      path: {
        appointment_id: appointmentId,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to load appointment. Please try again later.");
    }
    if (!data) {
      throw new Error("Failed to load appointment. Please try again later.");
    }
    return data;
  } catch (err) {
    throw new Error("Failed to load appointment. Please try again later.");
  }
}