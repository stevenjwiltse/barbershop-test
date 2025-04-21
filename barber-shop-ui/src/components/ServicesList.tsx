import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Container,
  Divider,
  Button,
  Skeleton,
  Alert,
  useTheme,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import FeaturedPlayListIcon from "@mui/icons-material/FeaturedPlayList";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getAllServicesApiV1ServicesGet } from "../api";

// Define types
interface Service {
  service_id: number;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  popularityScore?: number;
}

interface ServicesProps {
  compact?: boolean;
  maxItems?: number;
}

// Group services by category
const groupServicesByCategory = (
  services: Service[]
): Record<string, Service[]> => {
  return services.reduce(
    (groups, service) => {
      const category = service.category || "Other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(service);
      return groups;
    },
    {} as Record<string, Service[]>
  );
};

const ServicesList: React.FC<ServicesProps> = ({
  compact = false,
  maxItems = 4,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Record<string, Service[]>>({});

  const theme = useTheme();

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const { response, data, error } =
          await getAllServicesApiV1ServicesGet();
        if (!response.ok) {
          throw new Error(
            "Failed to load services. Please try again later."
          );
        }
        if (!data) {
          throw new Error("Failed to load services. Please try again later.");
        }
        const services: Service[] = [];
        for (const service of data) {
          console.log(service.duration);
          services.push({
            service_id: service.service_id,
            name: service.name,
            duration: service.duration,
            price: parseFloat(service.price),
          });
        }

        setServices(services);
        setCategories(groupServicesByCategory(services));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load services. Please try again later.");
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Display services to show based on compact mode
  const displayServices = compact ? services.slice(0, maxItems) : services;

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(compact ? maxItems : 8)
      .fill(0)
      .map((_, index) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={compact ? 3 : 4}
          key={`skeleton-${index}`}
        >
          <Card elevation={2}>
            <CardContent>
              <Skeleton variant="text" width="70%" height={32} />
              <Skeleton variant="text" width="100%" height={20} />
              <Box
                sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
              >
                <Skeleton variant="rectangular" width={70} height={24} />
                <Skeleton variant="rectangular" width={70} height={24} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ));
  };

  // Conditional rendering for compact vs full view
  if (compact) {
    return (
      <Box sx={{ width: "100%", py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <ContentCutIcon sx={{ mr: 1 }} /> Our Services
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            href="/services" // Link to full services page
          >
            View All Services
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {loading
            ? renderSkeletons()
            : displayServices.map((service) => (
                <Grid item xs={12} sm={6} md={3} key={service.service_id}>
                  <ServiceCard service={service} />
                </Grid>
              ))}
        </Grid>
      </Box>
    );
  }

  // Full view with categories
  return (
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
          <Typography
            variant="h4"
            component="h1"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <FeaturedPlayListIcon sx={{ mr: 1 }} /> Barbershop Services
          </Typography>
          <Button
            variant="contained"
            color="primary"
            href="/book-appointment" // Link to booking page
          >
            Book Appointment
          </Button>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph>
          We offer a range of professional barbering services to keep you
          looking your best. All services include a consultation to ensure you
          get exactly what you're looking for.
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Grid container spacing={3}>
            {renderSkeletons()}
          </Grid>
        ) : Object.keys(categories).length === 0 ? (
          <Typography>No services available.</Typography>
        ) : (
          Object.entries(categories).map(([category, categoryServices]) => (
            <Box key={category} sx={{ mb: 5 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="h5" component="h2">
                  {category}
                </Typography>
                <Divider sx={{ flex: 1, ml: 2 }} />
              </Box>
              <Grid container spacing={3}>
                {categoryServices.map((service) => (
                  <Grid item xs={12} sm={6} md={4} key={service.service_id}>
                    <ServiceCard service={service} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
        )}
      </Paper>
    </Container>
  );
};

// Service Card Component
const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours} hr ${remainingMinutes} min`
      : `${hours} hr`;
  };

  return (
    <Card
      elevation={2}
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom noWrap>
          {service.name}
        </Typography>

        {service.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              height: "40px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {service.description}
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Chip
            icon={<AccessTimeIcon />}
            label={formatDuration(service.duration)}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<AttachMoneyIcon />}
            label={formatPrice(service.price)}
            size="small"
            color="primary"
          />
        </Box>

        {service.popularityScore && service.popularityScore > 90 && (
          <Box sx={{ mt: 2 }}>
            <Chip
              label="Popular"
              size="small"
              color="secondary"
              sx={{ fontSize: "0.7rem" }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ServicesList;
