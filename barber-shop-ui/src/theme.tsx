import { createTheme } from '@mui/material/styles';
import { grey, red } from '@mui/material/colors';

// A custom theme for this app
const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: 'rgb(127, 29, 29)',
    },
    secondary: {
      main: 'rgb(69, 10, 10, 0.1)',
    },
    error: {
      main: red.A400,
    },
    text: {
      secondary: grey[500],
    },
    background: {
      default: "hsla(215, 15%, 97%, 0.5)",
    }
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          "&:-webkit-autofill": {
            "-webkit-box-shadow": "0 0 0 100px var(--primary-weak) inset",
            "-webkit-text-fill-color": "var(--text-primary)",
          },
        },
      },
    },
  },
});

export default theme;
