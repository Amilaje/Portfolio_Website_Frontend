import React from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{
      bgcolor: 'background.paper',
      py: 4,
      borderTop: 1,
      borderColor: 'divider',
      mt: 'auto', 
      textAlign: 'center'
    }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} 최진호. All rights reserved.
        </Typography>
        <Box mt={1}>
            <IconButton color="primary" aria-label="GitHub Link">
                <GitHubIcon />
            </IconButton>
            <IconButton color="secondary" aria-label="Contact via Chatbot">
                <ChatBubbleOutlineIcon />
            </IconButton>
        </Box>
        <Typography variant="caption" color="text.disabled" align="center" mt={1}>
          Powered by React, TypeScript, MUI, and Spring Boot
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;