import { createTheme } from '@mui/material/styles';

// Google Gemini의 색상 팔레트 모방
export const MyPalette = {
  blue: '#4285F4',
  green: '#34A853',
  yellow: '#FBBC04',
  red: '#EA4335',
  darkGray: '#202124',
  lightGray: '#3C4043',
};

// MUI 테마 정의
const MyTheme = createTheme({
  palette: {
    mode: 'dark', // 다크 모드를 기본으로 사용
    primary: {
      main: MyPalette.blue, // 핵심 액션 색상 (파란색)
      light: '#669df6',
      dark: '#1a73e8',
      contrastText: '#fff',
    },
    secondary: {
      main: MyPalette.green, // 보조 액션 색상 (녹색)
    },
    error: {
      main: MyPalette.red, // 오류 색상 (빨간색)
    },
    warning: {
      main: MyPalette.yellow, // 경고 색상 (노란색)
    },
    background: {
      default: MyPalette.darkGray, // 전체 배경
      paper: MyPalette.lightGray,   // 카드/컴포넌트 배경
    },
    text: {
      primary: '#E8EAED', // 밝은 텍스트
      secondary: '#BDC1C6', // 보조 텍스트
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24, // 둥근 디자인
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 24px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: MyPalette.darkGray,
          boxShadow: 'none',
          borderBottom: `1px solid ${MyPalette.lightGray}`,
        },
      },
    },
  },
});

export default MyTheme;
