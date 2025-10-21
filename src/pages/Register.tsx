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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
import type { RegisterRequest } from '../types/auth'; // type import
import { registerUser } from '../api/authService';

// 회원가입 페이지 컴포넌트
const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    
    // 폼 데이터 상태 관리: username과 password만 사용
    const [formData, setFormData] = useState<RegisterRequest>({
        username: '',
        password: '',
    });
    
    // 로딩 및 결과 상태 관리
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    // 유효성 검사 메시지 상태
    const [validation, setValidation] = useState<{ [key: string]: string }>({});

    // 입력 필드 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // 입력 시 유효성 검사 메시지 초기화
        if (validation[name]) {
            setValidation(prev => ({ ...prev, [name]: '' }));
        }
    };

    // 유효성 검사 로직 (username과 password에만 집중)
    const validateForm = (): boolean => {
        const errors: { [key: string]: string } = {};
        let isValid = true;

        // 사용자 이름(username) 유효성 검사 (최소 1자)
        if (!formData.username || formData.username.length < 1) {
            errors.username = '아이디는 필수 입력 사항입니다.';
            isValid = false;
        }

        // 비밀번호 유효성 검사 (최소 길이 1자)
        if (!formData.password || formData.password.length < 1) {
            errors.password = '비밀번호는 필수 입력 사항입니다.';
            isValid = false;
        }
        
        setValidation(errors);
        return isValid;
    };

        // 회원가입 제출 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSuccess(false);

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await registerUser(formData);
            
            // 성공 처리
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/login'); // 2초 후 로그인 페이지로 이동
            }, 2000);

        } catch (err: any) {
            console.error('Registration failed:', err);
            
            let errorMessage = '회원가입 중 알 수 없는 오류가 발생했습니다.';
            
            // 1. 서버 응답이 있고, 응답 데이터에 메시지가 있는 경우 (이상적인 경우)
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } 
            // 2. 서버 응답은 왔지만 (400), 메시지가 없는 경우 (현재 발생 상황)
            else if (err.response?.status === 400) {
                // Bad Request는 주로 클라이언트가 보낸 데이터가 유효하지 않을 때 발생
                // (예: 아이디 중복, 유효성 검사 실패 등)
                errorMessage = '회원가입 정보가 유효하지 않거나 이미 존재하는 아이디입니다.';
            } 
            // 3. 네트워크 오류 등 기타 오류
            else if (err.code === 'ERR_NETWORK') {
                errorMessage = '네트워크 연결 상태를 확인하거나 서버 상태를 확인해주세요.';
            }

            setError(errorMessage);
            setIsSuccess(false);
            
        } finally {
            setIsLoading(false);
        }
    };

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
                        <PersonAddIcon sx={{ fontSize: 48, color: 'secondary.main' }} />
                        <Typography variant="h4" component="h1" fontWeight={600} mt={1}>
                            회원가입
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            체험용이므로 최대한 개인정보는 넣지 말아주세요
                        </Typography>
                    </Box>

                    {/* 성공/에러 메시지 표시 */}
                    {isSuccess && (
                        <Alert 
                            severity="success" 
                            icon={<CheckCircleOutlineIcon />}
                            sx={{ mb: 3 }}
                        >
                            <AlertTitle>가입 성공!</AlertTitle>
                            회원가입이 완료되었습니다. 2초 후 로그인 페이지로 이동합니다.
                        </Alert>
                    )}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            <AlertTitle>가입 실패</AlertTitle>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Nickname"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={formData.username}
                            onChange={handleChange}
                            error={!!validation.username}
                            helperText={validation.username}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                            error={!!validation.password}
                            helperText={validation.password}
                        />
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            disabled={isLoading}
                            sx={{ mt: 3, mb: 2, height: 48 }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : '회원가입 완료'}
                        </Button>
                        
                        <Button
                            fullWidth
                            variant="text"
                            onClick={() => navigate('/login')}
                            sx={{ color: 'text.secondary' }}
                        >
                            이미 계정이 있으신가요? 로그인 페이지로
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default RegisterPage;