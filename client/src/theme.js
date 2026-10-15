import { createTheme } from '@mui/material'

const border = '#dbe8d6'

export const theme = createTheme({
  palette: {
    primary: { main: '#2e7d4f', light: '#5fae7c', dark: '#1b5e36', contrastText: '#ffffff' },
    secondary: { main: '#8bc34a' },
    success: { main: '#3a9a5f' },
    warning: { main: '#d9932b' },
    error: { main: '#c8553d' },
    background: { default: '#f1f6ef', paper: '#ffffff' },
    text: { primary: '#1f2d24', secondary: '#5b6b60' },
    divider: border,
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Nunito", system-ui, -apple-system, "Segoe UI", sans-serif',
    h4: { fontWeight: 800 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: `1px solid ${border}` } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 999, paddingInline: 18 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 700 } },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 8, borderRadius: 999, backgroundColor: '#e3eee0' },
        bar: { borderRadius: 999 },
      },
    },
  },
})
