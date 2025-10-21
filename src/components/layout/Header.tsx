import React, { useState } from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    Box, 
    IconButton, 
    Tooltip,
    Drawer,          
    List,            
    ListItem,        
    ListItemButton,  
    ListItemText,    
    Divider          
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircle from '@mui/icons-material/AccountCircle';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
// 🚨 경로 오류 수정: '../../contexts/AuthContext' -> '../contexts/AuthContext'
import { useAuth } from '../../contexts/AuthContext';
import { Container } from '@mui/system';

// 내비게이션 항목
const navItems = [
    { name: '홈', path: '/' },
    { name: '프로젝트', path: '/projects' },
    { name: '게시판', path: '/board' },
    { name: '방명록', path: '/guestbook' },
];

const Header: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, logout, userInfo } = useAuth(); 
    
    // 모바일 메뉴 상태 관리
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login'); 
    };

    // Drawer 열기/닫기 토글 핸들러
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // 모바일 메뉴 (Drawer) 내용
    const drawer = (
        // 🚨 Drawer 내부를 클릭하면 닫히도록 설정
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            {/* 로고/타이틀 (Drawer 내부) */}
            <Typography variant="h6" sx={{ my: 2, color: 'primary.main', fontWeight: 700 }}>
                Dev : C
            </Typography>
            <Divider />
            {/* 내비게이션 항목 */}
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.name} disablePadding>
                        <ListItemButton 
                            component={Link} 
                            to={item.path} 
                            // 🚨 클릭 시 메뉴가 닫히도록 onCLick 추가
                            onClick={handleDrawerToggle}
                            sx={{ textAlign: 'center' }}
                        >
                            <ListItemText primary={item.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            
            {/* 모바일 뷰 인증 버튼 (Drawer 하단) */}
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                {isAuthenticated ? (
                    <>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {userInfo ? `${userInfo.username} 님` : '환영합니다'}
                        </Typography>
                        <Button 
                            variant="outlined"
                            color="inherit" 
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{ textTransform: 'none', width: '100%' }}
                        >
                            로그아웃
                        </Button>
                    </>
                ) : (
                    <>
                        <Button 
                            variant="outlined"
                            color="inherit" 
                            component={Link} 
                            to="/login"
                            startIcon={<LoginIcon />}
                            sx={{ textTransform: 'none', width: '100%' }}
                        >
                            로그인
                        </Button>
                        <Button 
                            variant="contained"
                            color="secondary"
                            component={Link} 
                            to="/register"
                            startIcon={<VpnKeyIcon />}
                            sx={{ textTransform: 'none', width: '100%' }}
                        >
                            가입
                        </Button>
                    </>
                )}
            </Box>
        </Box>
    );

    return (
        <AppBar position="sticky">
            <Toolbar disableGutters={true} sx={{ p: 0 }}>
                <Container maxWidth='lg' sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    px: 2, 
                }}>
                    {/* 로고/타이틀 */}
                    <Typography 
                        variant="h5" 
                        component={Link} 
                        to="/" 
                        sx={{ 
                            textDecoration: 'none', 
                            color: 'primary.main',
                            fontWeight: 700
                        }}
                    >
                        Dev : C
                    </Typography>

                    {/* 네비게이션 링크 (PC: md 이상) */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, justifyContent: 'center' }}>
                        {navItems.map((item) => (
                            <Button 
                                key={item.name} 
                                component={Link} 
                                to={item.path} 
                                sx={{ mx: 1, color: 'text.primary', fontWeight: 600 }}
                            >
                                {item.name}
                            </Button>
                        ))}
                    </Box>

                    {/* 인증 버튼 (PC: md 이상) */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        {isAuthenticated ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {/* 사용자 이름 표시 */}
                                <Typography variant="subtitle1" component="span" sx={{ mr: 2, fontWeight: 600, color: 'text.primary' }}>
                                    {userInfo ? `${userInfo.username} 님` : '환영합니다'}
                                </Typography>
                                
                                <Tooltip title="내 정보">
                                    <IconButton color="inherit" size="large">
                                        <AccountCircle sx={{ color: 'text.primary' }} />
                                    </IconButton>
                                </Tooltip>
                                <Button 
                                    color="inherit" 
                                    startIcon={<LogoutIcon />}
                                    onClick={handleLogout}
                                    sx={{ ml: 1, textTransform: 'none' }}
                                >
                                    로그아웃
                                </Button>
                            </Box>
                        ) : (
                            <Box>
                                <Button 
                                    color="inherit" 
                                    component={Link} 
                                    to="/login"
                                    startIcon={<LoginIcon />}
                                    sx={{ textTransform: 'none' }}
                                >
                                    로그인
                                </Button>
                                <Button 
                                    variant="contained"
                                    color="secondary"
                                    component={Link} 
                                    to="/register"
                                    startIcon={<VpnKeyIcon />}
                                    sx={{ ml: 1, textTransform: 'none' }}
                                >
                                    가입
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* 햄버거 메뉴 아이콘 (모바일: xs 에서만 표시) */}
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="end" // 오른쪽에 배치
                            onClick={handleDrawerToggle}
                            sx={{ color: 'text.primary' }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>

                </Container>
            </Toolbar>
            
            {/* Drawer 컴포넌트 */}
            <Drawer
                variant="temporary"
                anchor="right" // 오른쪽에서 나오도록 설정
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // 모바일에서 성능 최적화
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 }, // Drawer 너비 설정
                }}
            >
                {drawer} 
            </Drawer>
        </AppBar>
    );
};

export default Header;
