import React from 'react';
import Base from './Base';
import AboutUs from '../components/AboutUs';
import { Box } from '@mui/material';

export default function AboutUsPage() {
    return (
        <Base children={
            <Box
                sx={{
                    marginBottom: "20px",
                }}
            >
                <AboutUs />
            </Box>
        } />
    );
};
