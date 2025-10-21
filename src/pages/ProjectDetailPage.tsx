import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Typography, 
    Box, 
    CircularProgress, 
    Alert, 
    Paper, 
    Divider, 
    Chip, 
    Button
} from '@mui/material';
import { 
    AccessTime, 
    GitHub, 
    Public, 
    Description,
    Code,
    Edit
} from '@mui/icons-material';
// 💡 URL 파라미터를 사용하기 위한 React Router 훅 (프로젝트에 맞게 경로 확인 필요)
import { useParams, useNavigate } from 'react-router-dom'; 

// import MainLayout from '../components/layout/MainLayout';
import { fetchProjectDetail } from '../api/apiClient';
import type { ProjectResponse } from '../types/project';
import { useAuth } from '../contexts/AuthContext'; // 관리자 권한 확인용
// ------------------------------------------------------------


// 프로젝트 상세 정보 초기 상태
const initialProjectDetail: ProjectResponse = {
    id: 0,
    title: '',
    summary: '',
    description: '',
    skills: '',
    projectLink: null,
    githubLink: null,
    imageUrl: null,
    startDate: '',
    endDate: '',
    createdAt: '',
    updatedAt: '',
};

export const ProjectDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // URL에서 ID를 가져옵니다.
    const navigate = useNavigate();
    const { userInfo } = useAuth();
    const isAdmin = userInfo?.role === 'ADMIN';

    const [project, setProject] = useState<ProjectResponse>(initialProjectDetail);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError('잘못된 프로젝트 ID입니다.');
            setLoading(false);
            return;
        }

        const loadProjectDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                // ID는 string이므로 number로 변환하여 API 호출
                const data = await fetchProjectDetail(Number(id));
                setProject(data);
            } catch (e) {
                console.error("프로젝트 상세 정보를 불러오지 못했습니다.", e);
                setError('프로젝트 상세 정보를 불러오는 중 오류가 발생했습니다. 해당 프로젝트가 존재하지 않을 수 있습니다.');
            } finally {
                setLoading(false);
            }
        };

        loadProjectDetail();
    }, [id]);
    
    // 로딩 및 에러 처리
    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
                <CircularProgress color="primary" />
                <Typography mt={2} color="text.secondary">프로젝트 상세 정보를 불러오는 중...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 10 }}>
                <Alert severity="error">{error}</Alert>
                <Box mt={3} textAlign="center">
                    <Button variant="outlined" onClick={() => navigate('/projects')}>
                        목록으로 돌아가기
                    </Button>
                </Box>
            </Container>
        );
    }
    
    // 데이터 준비
    const skillsArray = project.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const formatMonthYear = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
    };
    const duration = `${formatMonthYear(project.startDate)} ~ ${formatMonthYear(project.endDate)}`;


    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box mb={4} textAlign="center">
                {/* 썸네일 이미지 */}
                <Box sx={{ maxWidth: '100%', maxHeight: 400, overflow: 'hidden', mb: 3, borderRadius: 2 }}>
                    <img
                        src={project.imageUrl || 'https://via.placeholder.com/800x400.png?text=PROJECT+DETAIL'}
                        alt={project.title}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                </Box>
                
                <Typography variant="h4" component="h1" fontWeight={700} gutterBottom
                    //강제 줄 바꿈 적용
                    sx={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                    >
                    {project.title}
                </Typography>
                
                <Typography variant="subtitle1" color="text.secondary"
                    //강제 줄 바꿈 적용
                    sx={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                    >
                    {project.summary}
                </Typography>
                
                <Box display="flex" justifyContent="center" alignItems="center" mt={2} color="text.secondary">
                    <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">{duration}</Typography>
                    
                    {/* 관리자 수정 버튼 */}
                    {isAdmin && (
                        <Button 
                            variant="outlined" 
                            color="warning" 
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => navigate(`/admin/projects/${project.id}/edit`)} // 관리자 수정 경로로 이동
                            sx={{ ml: 3 }}
                        >
                            수정
                        </Button>
                    )}
                </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
                
                {/* 1. 프로젝트 설명 */}
                <Box mb={4}>
                    <Typography variant="h6" component="h2" gutterBottom color="primary.main" display="flex" alignItems="center" fontWeight="bold">
                        <Description sx={{ mr: 1 }} /> 프로젝트 상세 설명
                    </Typography>
                    <Typography variant="body1" 
                        //강제 줄 바꿈 적용
                        sx={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                        >
                        {project.description}
                    </Typography>
                </Box>
                
                <Divider sx={{ my: 3 }} />

                {/* 2. 사용 기술 */}
                <Box mb={4}>
                    <Typography variant="h6" component="h2" gutterBottom color="primary.main" display="flex" alignItems="center" fontWeight="bold">
                        <Code sx={{ mr: 1 }} /> 사용 기술 스택
                    </Typography>
                    <Box mt={1}
                        sx={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word' }}
                        >
                        {skillsArray.map((skill, index) => (
                            <Chip 
                                key={index} 
                                label={skill} 
                                color="secondary" 
                                variant="filled" 
                                sx={{ mr: 1, mb: 1, fontWeight: 'bold' }}
                            />
                        ))}
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* 3. 링크 */}
                <Box>
                    <Typography variant="h6" component="h2" gutterBottom color="primary.main" fontWeight="bold">
                        관련 링크
                    </Typography>
                    <Box display="flex" gap={2} mt={1}>
                        {project.githubLink && (
                            <Button 
                                variant="contained" 
                                startIcon={<GitHub />} 
                                href={project.githubLink} 
                                target="_blank" 
                                rel="noopener"
                            >
                                GitHub 리포지토리
                            </Button>
                        )}
                        {project.projectLink && (
                            <Button 
                                variant="contained" 
                                startIcon={<Public />} 
                                href={project.projectLink} 
                                target="_blank" 
                                rel="noopener"
                            >
                                배포 링크
                            </Button>
                        )}
                        {!project.githubLink && !project.projectLink && (
                            <Typography color="text.secondary">제공된 관련 링크가 없습니다.</Typography>
                        )}
                    </Box>
                </Box>
            </Paper>

            <Box mt={5} textAlign="center">
                <Button variant="contained" onClick={() => navigate('/projects')}>
                    프로젝트 목록으로 돌아가기
                </Button>
            </Box>
        </Container>
    );
};

export default ProjectDetailPage;