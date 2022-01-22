import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#cc7722',
    },
    secondary: {
      main: '#437c90',
    },
    background: {
      paper: '#ffffff',
      default: '#f9f9f9',
    },
    info: {
      main: '#44e5e7',
    },
    error: {
      main: '#ef5350',
    },
  },
});
