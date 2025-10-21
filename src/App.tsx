import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Typography } from '@mui/material';

// 테마 및 레이아웃 컴포넌트 import
import MyTheme from './theme/MyTheme.ts'; 
import MainLayout from './components/layout/MainLayout';
// AuthProvider import
import { AuthProvider } from './contexts/AuthContext'; 

// 페이지 컴포넌트 import
import HomePage from './pages/Home';
import BoardPage from './pages/Board';
import GuestbookPage from './pages/Guestbook';
import ProjectsPage from './pages/ProjectsPage.tsx';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Chatbot from './components/chatbot/Chatbot.tsx';
import PostDetailPage from './pages/PostDetail'; 
import PostWritePage from './pages/PostWrite';
import ProjectDetailPage from './pages/ProjectDetailPage.tsx';
import ProjectFormPage from './pages/ProjectFormPage.tsx';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={MyTheme}>
      <Chatbot />
      <CssBaseline />
      <AuthProvider> 
        <Router>
          {/* MainLayout을 Routes 바깥에 두면 모든 페이지에 Header/Footer가 적용됩니다. */}
          <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              
              <Route path="/board" element={<BoardPage />} />
              <Route path="/board/:id" element={<PostDetailPage />} /> {/* 상세 조회 */}
              <Route path="/board/write" element={<PostWritePage />} /> 글 작성 */

              <Route path="/guestbook" element={<GuestbookPage />} />
              <Route path="/projects" element={<ProjectsPage />} />

              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/admin/projects/new" element={<ProjectFormPage />} />
              <Route path="/admin/projects/:id/edit" element={<ProjectFormPage />} />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* 404 Not Found 페이지 */}
              <Route path="*" element={
                <Box py={10} textAlign="center">
                  <Typography variant="h3" color="error">404 - 페이지를 찾을 수 없습니다</Typography>
                  <Typography color="text.secondary" mt={2}>요청하신 경로가 올바르지 않거나 제거되었습니다.</Typography>
                </Box>
              } />
            </Routes>
          </MainLayout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};
export default App;