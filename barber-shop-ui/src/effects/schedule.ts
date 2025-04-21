import { getSchedulesApiV1SchedulesGet } from "../api";

export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  timeDisplay: string;
  isAvailable: boolean;
  isBooked: boolean;
  selected: boolean;
  duration: number;
}
export interface Schedule {
  id: number;
  date: string;
  barberId: number;
  barberName: string;
  timeSlots: TimeSlot[];
  appointmentCount: number;
}

export async function getSchedules(
  authToken: string,
  scheduleDate?: Date,
  barberId?: number
): Promise<Schedule[]> {
  const schedules: Schedule[] = [];
  try {
    const { response, data } = await getSchedulesApiV1SchedulesGet({
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      query: {
        schedule_date: scheduleDate?.toISOString().split("T")[0],
        barber_id: barberId,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to load schedules. Please try again later.");
    }
    if (!data) {
      throw new Error("Failed to load schedules. Please try again later.");
    }
    for (const schedule of data) {
        
      schedules.push({
        id: schedule.schedule_id,
        date: schedule.date,
        barberId: schedule.barber_id,
        barberName:
          schedule.barber.user.firstName + " " + schedule.barber.user.lastName,
        timeSlots:
          schedule.time_slots?.map((slot) => {
            const hour = parseInt(slot.start_time.split(":")[0]);
            const minutes = slot.start_time.split(":")[1];
            const timeString = `${hour === 12 ? 12 : hour % 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
            return {
                id: slot.slot_id,
                startTime: slot.start_time,
                endTime: slot.end_time,
                timeDisplay: timeString,
                isAvailable: slot.is_available,
                isBooked: slot.is_booked,
                selected: false,
                duration: 30,
            }
          }) || [],
        appointmentCount: 0,
      });
    }
  } catch (err) {
    throw new Error("Failed to load schedules. Please try again later.");
  }
  return schedules;
}
