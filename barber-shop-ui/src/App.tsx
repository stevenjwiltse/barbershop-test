import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import VideoBanner from './components/VideoBanner';
import { Container } from '@mui/material';
import ImageCarousel from './components/ImageCarousel';
import AboutUs from './components/AboutUs';
import Base from './pages/Base';
import ServicesList from './components/ServicesList';

type CarouselImage = {
  src: string;
  alt: string;
};

const carouselImages: CarouselImage[] = [
  {
    src: "/img/carosel1.jpg",
    alt: "barbershop",
  },
  {
    src: "/img/carosel2.jpg",
    alt: "barbershop",
  },
  {
    src: "/img/carosel3.jpg",
    alt: "barbershop",
  },
  {
    src: "/img/carosel4.jpg",
    alt: "barbershop",
  },
  {
    src: "/img/carosel5.jpg",
    alt: "barbershop",
  },
  {
    src: "/img/carosel6.jpg",
    alt: "barbershop",
  },
];

function Copyright() {
  return (
    <Typography
      variant="body2"
      align="center"
      sx={{
        color: 'text.secondary',
      }}
    >
      {'Copyright © '}
      <Link color="inherit" href="#">
        Main Street Barbershop
      </Link>{' '}
      {new Date().getFullYear()}.
    </Typography>
  );
}

export default function App() {
  

  return (
    <Base children={
      <Box>
        <VideoBanner />
        <Container sx={{ mt: 4 }}>
          <Typography variant="h3" component="h1" sx={{ mb: 2, textAlign: 'center' }} color="primary">
            Main Street Barbershop
          </Typography>
          <Typography variant="body1" component="h1" sx={{ mb: 2, textAlign: 'center' }}>
            We take pride in being the best barbershop in the city, delivering top-quality cuts and exceptional service.
          </Typography>
        </Container>
        <ImageCarousel
          images={carouselImages}
          height={400}
          autoPlay={true}
          autoPlayInterval={5000}
        />
        <AboutUs />
        <Box sx={{ mt: 4, backgroundColor: 'secondary.main'}}>
          <Container >
            <ServicesList compact={true} maxItems={4} />
          </Container>
        </Box>
      </Box>
    }
    />
  );
}
