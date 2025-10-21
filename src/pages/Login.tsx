import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Card, 
    CardContent, 
    Container, 
    CircularProgress,
    Alert,
    AlertTitle
} from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useNavigate, Link } from 'react-router-dom';
import type { LoginRequest } from '../types/auth';
import { useAuth } from '../contexts/AuthContext'; // Auth Context Hook import

// 로그인 페이지 컴포넌트
const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoading: isAuthLoading } = useAuth(); // useAuth 훅 사용
    
    // 폼 데이터 상태 관리
    const [formData, setFormData] = useState<LoginRequest>({
        username: '',
        password: '',
    });
    
    // 로딩 및 결과 상태 관리 (AuthContext의 isLoading과 분리)
    const [error, setError] = useState<string | null>(null);

    // 입력 필드 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 로그인 제출 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.username || !formData.password) {
            setError('아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }

        try {
            await login(formData); // AuthContext의 login 함수 호출
            navigate('/'); // 로그인 성공 시 메인 페이지로 이동
        } catch (err: any) {
            console.error('Login failed:', err);
            
            let errorMessage = '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.';

            // 서버 응답이 있고, 400 에러이거나 메시지가 명확한 경우
            if (err.response) {
                if (err.response.status === 401) {
                    errorMessage = '아이디 또는 비밀번호가 일치하지 않습니다.';
                } else if (err.response.data?.message) {
                    errorMessage = err.response.data.message;
                }
            } else if (err.code === 'ERR_NETWORK') {
                errorMessage = '네트워크 연결 상태를 확인하거나 서버 상태를 확인해주세요.';
            }

            setError(errorMessage);
        }
    };

    const isSubmitting = isAuthLoading;

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Card sx={{ 
                p: 4, 
                backgroundColor: 'background.paper', 
                boxShadow: 8,
                borderRadius: 4
            }}>
                <CardContent>
                    <Box textAlign="center" mb={4}>
                        <VpnKeyIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                        <Typography variant="h4" component="h1" fontWeight={600} mt={1}>
                            로그인
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Jinho's Portfolio에 오신 것을 환영합니다.
                        </Typography>
                    </Box>

                    {/* 에러 메시지 표시 */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            <AlertTitle>로그인 실패</AlertTitle>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="아이디"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="비밀번호"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting}
                            sx={{ mt: 3, mb: 2, height: 48 }}
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : '로그인'}
                        </Button>
                        
                        <Button
                            fullWidth
                            variant="text"
                            component={Link}
                            to="/register"
                            sx={{ color: 'text.secondary' }}
                        >
                            계정이 없으신가요? 회원가입
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default LoginPage;