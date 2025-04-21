import React, { useState, useEffect } from 'react';
import { Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

interface ImageCarouselProps {
  images: Array<{
    src: string;
    alt: string;
  }>;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  height?: string | number;
  width?: string | number;
  imagesPerView?: number;
  spacing?: number;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  autoPlay = true,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  height = 400,
  width = '100%',
  imagesPerView = 3,
  spacing = 2,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  
  // Determine how many images to show based on screen size
  const actualImagesPerView = isMobile ? 1 : isMedium ? 2 : imagesPerView;
  
  // Calculate the total number of "pages" in the carousel
  const totalSlides = Math.ceil(images.length / actualImagesPerView);
  
  const handleNext = () => {
    setActiveIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      return nextIndex >= totalSlides ? 0 : nextIndex;
    });
  };

  const handlePrev = () => {
    setActiveIndex((prevIndex) => {
      const nextIndex = prevIndex - 1;
      return nextIndex < 0 ? totalSlides - 1 : nextIndex;
    });
  };

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoPlay) {
      interval = setInterval(() => {
        handleNext();
      }, autoPlayInterval);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoPlay, autoPlayInterval]);

  // Ensure activeIndex is valid when images or screen size changes
  useEffect(() => {
    if (activeIndex >= totalSlides) {
      setActiveIndex(0);
    }
  }, [images.length, actualImagesPerView, totalSlides, activeIndex]);

  const getVisibleImages = () => {
    const startIdx = activeIndex * actualImagesPerView;
    const endIdx = Math.min(startIdx + actualImagesPerView, images.length);
    return images.slice(startIdx, endIdx);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        '&:hover .carousel-controls': {
          opacity: 1,
        },
      }}
    >
      {/* Images Container */}
      <Box
        sx={{
          display: 'flex',
          transition: 'transform 0.5s ease',
          transform: `translateX(-${activeIndex * 100}%)`,
          height: '100%',
          width: '100%',
        }}
      >
        {/* Generate a slide for each "page" of images */}
        {Array.from({ length: totalSlides }).map((_, slideIndex) => {
          const startIdx = slideIndex * actualImagesPerView;
          const slideImages = images.slice(
            startIdx,
            Math.min(startIdx + actualImagesPerView, images.length)
          );
          
          return (
            <Box
              key={slideIndex}
              sx={{
                display: 'flex',
                minWidth: '100%',
                height: '100%',
                // gap: theme.spacing(spacing),
                // padding: theme.spacing(1),
              }}
            >
              {slideImages.map((image, imageIndex) => (
                <Box
                  key={startIdx + imageIndex}
                  sx={{
                    flex: 1,
                    height: '100%',
                    backgroundColor: theme.palette.grey[100],
                    // borderRadius: theme.shape.borderRadius,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src={image.src}
                    alt={image.alt}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              ))}
              
              {/* Add empty placeholders if needed to maintain consistent layout */}
              {slideImages.length < actualImagesPerView && 
                Array.from({ length: actualImagesPerView - slideImages.length }).map((_, i) => (
                  <Box
                    key={`placeholder-${i}`}
                    sx={{
                      flex: 1,
                      height: '100%',
                      visibility: 'hidden',
                    }}
                  />
                ))
              }
            </Box>
          );
        })}
      </Box>

      {/* Arrow Controls */}
      {showArrows && totalSlides > 1 && (
        <>
          <IconButton
            className="carousel-controls"
            sx={{
              position: 'absolute',
              top: '50%',
              left: theme.spacing(2),
              transform: 'translateY(-50%)',
              opacity: isMobile ? 1 : 0,
              transition: 'opacity 0.3s',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
              zIndex: 2,
            }}
            onClick={handlePrev}
            size="large"
          >
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton
            className="carousel-controls"
            sx={{
              position: 'absolute',
              top: '50%',
              right: theme.spacing(2),
              transform: 'translateY(-50%)',
              opacity: isMobile ? 1 : 0,
              transition: 'opacity 0.3s',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
              zIndex: 2,
            }}
            onClick={handleNext}
            size="large"
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </>
      )}

      {/* Dots */}
      {showDots && totalSlides > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: theme.spacing(1),
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: theme.spacing(1),
            zIndex: 2,
          }}
        >
          {Array.from({ length: totalSlides }).map((_, index) => (
            <IconButton
              key={index}
              onClick={() => handleDotClick(index)}
              sx={{
                p: 0.5,
                color: index === activeIndex ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.7)',
              }}
              size="small"
            >
              <FiberManualRecordIcon fontSize="small" />
            </IconButton>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ImageCarousel;