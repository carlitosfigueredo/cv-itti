import { createTheme } from '@mui/material/styles'

// Paleta tomada de las variables del tema de www.itti.digital (--global-palette*).
// En el tema claro, el verde de marca (#0add90) tiene poco contraste sobre blanco
// (1.79:1), por eso para textos, bordes de foco y controles se usa un verde mas
// oscuro de la misma familia (#007a4d, 5.4:1). El verde de marca se usa en los
// botones principales, siempre con texto negro (10.9:1).
export const brand = {
  green: '#0add90',
  greenDark: '#00ae6e',
  greenText: '#007a4d',
  greenDeep: '#005c3a',
  ink: '#0d0d0d',
  night: '#1f1b24',
  nightRaised: '#2a2531',
  slate: '#4A5568',
  mint: '#ccefe2',
  mintDark: '#0f3d2c',
  paper: '#f8f5f5',
  mutedDark: '#b8b3c0',
} as const

const fontFamily = '"Poppins", "Helvetica Neue", Arial, sans-serif'

export const theme = createTheme({
  // Variables CSS + clase "light"/"dark" en <html>: permite cambiar de tema sin
  // recrear el arbol y evita el destello inicial (ver public/color-scheme.js).
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: brand.greenText, light: brand.mint, dark: brand.greenDeep, contrastText: '#ffffff' },
        secondary: { main: brand.night, contrastText: '#ffffff' },
        success: { main: brand.greenText, contrastText: '#ffffff' },
        background: { default: brand.paper, paper: '#ffffff' },
        text: { primary: brand.ink, secondary: brand.slate },
        divider: '#e6e1e1',
      },
    },
    dark: {
      palette: {
        primary: { main: brand.green, light: brand.mintDark, dark: brand.greenDark, contrastText: brand.ink },
        secondary: { main: brand.paper, contrastText: brand.ink },
        success: { main: brand.green, contrastText: brand.ink },
        background: { default: brand.ink, paper: brand.night },
        text: { primary: brand.paper, secondary: brand.mutedDark },
        divider: '#2e2936',
      },
    },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily,
    // clamp(): los titulos se adaptan al ancho de pantalla sin saltos.
    h1: { fontWeight: 700, fontSize: 'clamp(1.75rem, 1.2rem + 2.4vw, 2.75rem)', lineHeight: 1.15, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, fontSize: 'clamp(1.5rem, 1.2rem + 1.4vw, 2rem)', lineHeight: 1.2, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600, fontSize: 'clamp(1.15rem, 1rem + 0.6vw, 1.4rem)', lineHeight: 1.3 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    overline: { fontWeight: 600, letterSpacing: '0.08em', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { textRendering: 'optimizeLegibility' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 999,
          paddingInline: theme.spacing(2.5),
          // Boton principal con el verde de marca y texto negro en ambos temas.
          '&.MuiButton-containedPrimary:not(.Mui-disabled)': {
            backgroundColor: brand.green,
            color: brand.ink,
            '&:hover': { backgroundColor: brand.greenDark },
          },
        }),
        sizeLarge: { paddingBlock: 10, fontSize: '1rem' },
      },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: ({ theme }) => ({ borderRadius: theme.shape.borderRadius * 1.25 }),
      },
    },
    MuiCardActionArea: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:focus-visible': { outline: `2px solid ${theme.vars.palette.primary.main}`, outlineOffset: -2 },
        }),
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
    MuiLink: { defaultProps: { underline: 'hover' } },
    MuiAppBar: { defaultProps: { elevation: 0, color: 'inherit' } },
    MuiDialog: {
      styleOverrides: { paper: ({ theme }) => ({ borderRadius: theme.shape.borderRadius * 1.25 }) },
    },
    MuiTableCell: { styleOverrides: { head: { fontWeight: 600 } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
  },
})
