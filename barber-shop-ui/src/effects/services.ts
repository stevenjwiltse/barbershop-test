import { getAllServicesApiV1ServicesGet } from "../api";

export interface Service {
  service_id: number;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  popularityScore?: number;
}

export async function fetchServices(): Promise<Service[]> {
  const services: Service[] = [];
  try {
    const { response, data } = await getAllServicesApiV1ServicesGet();
    if (!response.ok) {
      throw new Error("Failed to load services. Please try again later.");
    }
    if (!data) {
      throw new Error("Failed to load services. Please try again later.");
    }
    for (const service of data) {
      services.push({
        service_id: service.service_id,
        name: service.name,
        duration: service.duration,
        price: parseFloat(service.price),
      });
    }
  } catch (err) {
    throw new Error("Failed to load services. Please try again later.");
  }
  return services;
}
