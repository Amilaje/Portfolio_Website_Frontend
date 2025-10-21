import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Typography, 
    Box, 
    TextField, 
    Button, 
    CircularProgress, 
    Alert, 
    Paper,
    Snackbar,
    Grid
} from '@mui/material';
import { Add, Edit, ArrowBack } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    fetchProjectDetail, 
    createProject, 
    updateProject, 
    deleteProject 
} from '../api/apiClient';
import type { ProjectRequest } from '../types/project';
import { AxiosError } from 'axios';


// 초기 폼 데이터 상태 (백엔드의 DTO와 일치)
const initialFormData: ProjectRequest = {
    title: '',
    summary: '',
    description: '',
    skills: '',
    projectLink: '',
    githubLink: '',
    imageUrl: '',
    // T는 ISO 8601 형식의 시간 분리자
    startDate: new Date().toISOString().slice(0, 16), 
    endDate: new Date().toISOString().slice(0, 16),
};


export const ProjectFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { userInfo, isAuthenticated } = useAuth();
    
    // 폼 모드: ID가 있으면 '수정', 없으면 '생성'
    const isEditMode = !!id; 
    
    const [formData, setFormData] = useState<ProjectRequest>(initialFormData);
    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // 관리자 권한 확인 및 수정 모드 시 데이터 로딩
    useEffect(() => {
        if (!isAuthenticated || userInfo?.role !== 'ADMIN') {
            alert('접근 권한이 없습니다. 관리자만 접근 가능합니다.');
            navigate('/projects'); // 권한 없으면 목록으로 리다이렉트
            return;
        }

        if (isEditMode) {
            const loadData = async () => {
                try {
                    const data = await fetchProjectDetail(Number(id));
                    // API 응답 데이터를 폼 상태에 맞게 변환하여 설정
                    setFormData({
                        title: data.title,
                        summary: data.summary,
                        description: data.description,
                        skills: data.skills,
                        projectLink: data.projectLink || '',
                        githubLink: data.githubLink || '',
                        imageUrl: data.imageUrl || '',
                        // API 응답의 전체 LocalDateTime을 input[type=datetime-local] 형식으로 변환
                        startDate: data.startDate.slice(0, 16),
                        endDate: data.endDate.slice(0, 16),
                    });
                } catch (_e) {
                    setError('프로젝트 정보를 불러오는 데 실패했습니다.');
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }
    }, [id, isEditMode, isAuthenticated, userInfo?.role, navigate]);


    // 입력 값 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 제출 핸들러 (생성/수정 공통)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            if (isEditMode && id) {
                // 수정
                await updateProject(Number(id), formData);
                setSnackbar({ open: true, message: '프로젝트가 성공적으로 수정되었습니다.', severity: 'success' });
            } else {
                // 생성
                const response = await createProject(formData);
                setSnackbar({ open: true, message: '새 프로젝트가 성공적으로 등록되었습니다.', severity: 'success' });
                // 생성 후 상세 페이지로 리다이렉트
                navigate(`/projects/${response.id}`, { replace: true });
                return; // 리다이렉트 후 함수 종료
            }
            // 수정 후 상세 페이지로 이동
            navigate(`/projects/${id}`);
        } catch (e) {
            console.error("프로젝트 저장 실패:", e);
            const status = (e as AxiosError).response?.status;
            let errorMessage = "저장 중 알 수 없는 오류가 발생했습니다.";
            
            if (status === 400) {
                // 백엔드 유효성 검사 오류 메시지 파싱 및 표시
                errorMessage = "입력 필드에 오류가 있습니다. 내용을 확인해주세요.";
            } else if (status === 403) {
                errorMessage = "권한이 없습니다.";
            }
            
            setError(errorMessage);
            setSnackbar({ open: true, message: `저장 실패: ${errorMessage}`, severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    // 삭제 핸들러 (수정 모드에서만 사용)
    const handleDelete = async () => {
        if (!window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) return;
        
        try {
            if (id) {
                await deleteProject(Number(id));
                setSnackbar({ open: true, message: '프로젝트가 성공적으로 삭제되었습니다.', severity: 'success' });
                navigate('/projects'); // 삭제 후 목록 페이지로 이동
            }
        } catch (e) {
            console.error("프로젝트 삭제 실패:", e);
            const errorMessage = "삭제 중 오류가 발생했습니다. 권한을 확인해주세요.";
            setSnackbar({ open: true, message: `삭제 실패: ${errorMessage}`, severity: 'error' });
        }
    };


    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
                <CircularProgress color="primary" />
                <Typography mt={2}>데이터를 불러오는 중...</Typography>
            </Container>
        );
    }
    
    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            {/* ... (제목 영역 유지) */}

            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <form onSubmit={handleSubmit}>
                    {/* Grid v2: 컨테이너 설정 */}
                    <Grid container spacing={3}>
                        
                        {/* 1. 프로젝트 제목 (1열) */}
                        <Grid sx={{ width: '100%', p: 1.5 }}>
                            <TextField
                                label="프로젝트 제목 *"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        
                        {/* 2. 목록 요약 (1열) */}
                        <Grid sx={{ width: '100%', p: 1.5 }}>
                            <TextField
                                label="목록 요약 (500자 이내) *"
                                name="summary"
                                value={formData.summary}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={2}
                                required
                            />
                        </Grid>
                        
                        {/* 3. 사용 기술 (1열) */}
                        <Grid sx={{ width: '100%', p: 1.5 }}>
                            <TextField
                                label="사용 기술 (쉼표로 구분: 예: React, Spring Boot, AWS) *"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>

                        {/* 🌟 4. 시작일 / 종료일 (2열 대칭 배치) 🌟 */}
                        <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1.5 }}>
                            <TextField
                                label="시작일 *"
                                name="startDate"
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={handleChange}
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1.5 }}>
                            <TextField
                                label="종료일 *"
                                name="endDate"
                                type="datetime-local"
                                value={formData.endDate}
                                onChange={handleChange}
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {/* 5. 배포/프로젝트 링크 / GitHub 링크 (1열 유지 - 높이 문제 방지) */}
                        {/* 2열을 원하시면 아래 두 Grid 컴포넌트에도 sm: '50%'를 적용할 수 있습니다. */}
                        <Grid sx={{ width: '100%', p: 1.5 }}>
                            <TextField
                                label="배포/프로젝트 링크"
                                name="projectLink"
                                value={formData.projectLink}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid sx={{ width: '100%', p: 1.5 }}>
                            <TextField
                                label="GitHub 링크"
                                name="githubLink"
                                value={formData.githubLink}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        
                        {/* 6. 대표 이미지 URL (1열) */}
                        <Grid sx={{ width: '100%', p: 1.5 }}>
                            <TextField
                                label="대표 이미지 URL"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        
                        {/* 7. 상세 설명 (1열) */}
                        <Grid sx={{ width: '100%', p: 1.5 }}>
                            <TextField
                                label="상세 설명 (마크다운 사용 가능) *"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={10} 
                                required
                            />
                        </Grid>
                        
                    </Grid>
                    
                    {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

                    {/* 버튼 영역 (유지) */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBack />}
                            onClick={() => navigate('/projects')}
                        >
                            목록
                        </Button>
                        
                        <Box>
                            {isEditMode && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleDelete}
                                    disabled={submitting}
                                    sx={{ mr: 2 }}
                                >
                                    삭제
                                </Button>
                            )}
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                startIcon={isEditMode ? <Edit /> : <Add />}
                                disabled={submitting}
                            >
                                {submitting ? <CircularProgress size={24} color="inherit" /> : (isEditMode ? '수정 완료' : '프로젝트 등록')}
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Paper>
            
            {/* Snackbar (유지) */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ProjectFormPage;