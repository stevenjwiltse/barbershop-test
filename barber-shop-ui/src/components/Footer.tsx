import React from 'react';
import {
  Box,
  Container,
  Divider,
  Grid2 as Grid,
  IconButton,
  Link,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

interface FooterProps {
  companyName?: string;
  phone?: string;
  email?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
}

const Footer: React.FC<FooterProps> = ({
  companyName = 'Company Name',
  phone = '(555) 123-4567',
  email = 'contact@example.com',
  street = '123 Main Street',
  city = 'Anytown',
  state = 'ST',
  zipCode = '12345',
  facebookUrl = 'https://facebook.com',
  twitterUrl = 'https://twitter.com',
  instagramUrl = 'https://instagram.com',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        // mt: '20px',
        background: 'rgb(0, 0, 0)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Name and Info */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" color="textSecondary">
              {companyName}
            </Typography>
            <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.2)', width: '40px' }} />
            <Typography variant="body2" color="textSecondary">
              Thank you for visiting our website. Connect with us through our contact information or social media.
            </Typography>
          </Grid>

          {/* Contact Information */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" color="textSecondary">
              Contact Information
            </Typography>
            <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.2)', width: '40px' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Link 
                href={`tel:${phone.replace(/[^0-9]/g, '')}`} 
                color="textSecondary" 
                underline="hover"
              >
                {phone}
              </Link>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Link 
                href={`mailto:${email}`} 
                color="textSecondary" 
                underline="hover"
              >
                {email}
              </Link>
            </Box>
          </Grid>

          {/* Address and Social Media */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" color="textSecondary">
              Find Us
            </Typography>
            <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.2)', width: '40px' }} />
            <Box sx={{ display: 'flex', mb: 2 }}>
              <LocationOnIcon fontSize="small" sx={{ mr: 1, mt: 0.3,  color: 'text.secondary' }} />
              <Typography variant="body2" component="address" sx={{ fontStyle: 'normal' }} color="textSecondary">
                {street}<br />
                {city}, {state} {zipCode}
              </Typography>
            </Box>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }} color="textSecondary">
              Connect With Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                aria-label="Facebook" 
                component="a" 
                href={facebookUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: theme.palette.primary.main } 
                }}
                size="medium"
              >
                <FacebookIcon />
              </IconButton>
              <IconButton 
                aria-label="Twitter" 
                component="a" 
                href={twitterUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: theme.palette.primary.main } 
                }}
                size="medium"
              >
                <TwitterIcon />
              </IconButton>
              <IconButton 
                aria-label="Instagram" 
                component="a" 
                href={instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: theme.palette.primary.main } 
                }}
                size="medium"
              >
                <InstagramIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        
        {/* Copyright */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            mt: 4,
            pt: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="textSecondary">
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;