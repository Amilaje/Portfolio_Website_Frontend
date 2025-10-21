import React from 'react';
import { Container, Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Container component="main" maxWidth='lg' sx={{ flexGrow: 1, py: 4, margin: '0 auto' }}>
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default MainLayout;