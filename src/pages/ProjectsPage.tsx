import React, { useState, useEffect, useCallback } from 'react';
import { 
    Container, 
    Typography, 
    Box, 
    Grid, 
    Card, 
    CardMedia, 
    CardContent, 
    CardActions, 
    Button, 
    Chip, 
    Pagination, 
    CircularProgress, 
    Alert, 
    useTheme 
} from '@mui/material';
import { AccessTime, GitHub, Public, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchProjects } from '../api/apiClient';
import type { ProjectResponse, ProjectPageResponse } from '../types/project';
import { useAuth } from '../contexts/AuthContext';

// ------------------------------------------------------------


// 한 페이지에 보여줄 프로젝트 수
const ITEMS_PER_PAGE = 6; 

// 프로젝트 목록 초기 상태
const initialProjectData: ProjectPageResponse = {
    content: [],
    totalPages: 0,
    totalElements: 0,
    currentPage: 0,
    size: ITEMS_PER_PAGE,
    first: true,
    last: true,
};


// --- 개별 프로젝트 카드 컴포넌트 ---
interface ProjectCardProps {
    project: ProjectResponse;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    const theme = useTheme();
    // 💡 ProjectCard에서도 라우팅을 위해 useNavigate 훅을 사용합니다.
    const navigate = useNavigate(); 
    
    // 기술 스택을 쉼표로 분리하여 배열로 만듭니다.
    const skillsArray = project.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

    // 날짜 포맷팅 (년/월만 표시)
    const formatMonthYear = (dateString: string) => {
        const date = new Date(dateString);
        // ISO 8601 string을 Date 객체로 변환 시, 로컬 시간을 사용하려면 `slice(0, 16)`로 인해 문제가 발생할 수 있습니다.
        // 백엔드에서 LocalDateTime을 정확히 ISO String으로 보냈다면 이 코드는 동작합니다.
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
    };
    
    const duration = `${formatMonthYear(project.startDate)} ~ ${formatMonthYear(project.endDate)}`;

    const handleViewDetail = () => {
        navigate(`/projects/${project.id}`); // 실제 상세 경로로 이동
    };

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
            {/* 썸네일 이미지 */}
            <CardMedia
                component="img"
                height="180"
                // 💡 대체 이미지를 로컬 경로로 변경합니다. (public 폴더에 placeholder.png 파일이 있다고 가정)
                // 만약 로컬 파일을 사용하지 않고 외부 CDN을 사용하려면, 
                image={project.imageUrl || 'https://mblogthumb-phinf.pstatic.net/MjAyMDA5MDNfNzYg/MDAxNTk5MTI1ODQyOTgz.GcnIG2lAeKYjlf_WW__Z-RbcEmuCPliCM7JtSvcSf9Eg.IfoEGxCaenu31xJE57uGvHnwOqANmAIW_Azf2oIYxDMg.PNG.shshspdla/1%EB%8C%801.png?type=w800'} 
                alt={project.title}
                sx={{ objectFit: 'cover' }}
            />
            
<CardContent sx={{ flexGrow: 1 }}>
                {/* 1. 프로젝트 제목 수정: 긴 제목이 CardBox를 뚫지 않도록 강제 줄 바꿈 적용 */}
                <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="div" 
                    fontWeight="bold"
                    // 🚨 수정된 부분
                    sx={{
                        // 텍스트가 컨테이너를 넘어갈 경우 단어 기준이 아닌 글자 기준으로 강제 줄 바꿈
                        wordBreak: 'break-word', 
                        overflowWrap: 'break-word',
                        // CSS의 white-space: normal과 동일, 기본 줄 바꿈 활성화
                        whiteSpace: 'normal', 
                    }}
                >
                    {project.title}
                </Typography>
                
                <Box display="flex" alignItems="center" color="text.secondary" mb={1} fontSize="small">
                    <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="caption">{duration}</Typography>
                </Box>

                {/* 2. 프로젝트 요약 수정: 줄 바꿈 및 요약 높이 조정 (선택적) */}
                <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                        mb: 2, 
                        minHeight: '40px', // 요약이 짧더라도 카드의 높이를 일정하게 유지 (옵션)
                        // 🚨 수정된 부분
                        wordBreak: 'break-word', 
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                        // 필요한 경우, 최대 줄 수를 제한할 수 있습니다. (예: 3줄)
                        // display: '-webkit-box',
                        // WebkitBoxOrient: 'vertical',
                        // overflow: 'hidden',
                        // WebkitLineClamp: 3,
                    }}
                >
                    {project.summary}
                </Typography>

                {/* 3. 기술 스택 Box 수정: 칩셋들이 Box를 뚫지 않도록 강제 줄 바꿈 적용 */}
                <Box sx={{ 
                    minHeight: '40px',
                    // 🚨 수정된 부분
                    wordBreak: 'break-word', 
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal', // Box 내부 요소에도 적용
                }}>
                    {/* Chip 렌더링 로직 (유지) */}
                    {skillsArray.slice(0, 4).map((skill, index) => (
                        <Chip 
                            key={index} 
                            label={skill} 
                            size="small" 
                            color="primary"
                            variant="outlined" 
                            sx={{ mr: 0.5, mb: 0.5 }}
                        />
                    ))}
                    {skillsArray.length > 4 && (
                        <Chip label={`+${skillsArray.length - 4}`} size="small" variant="outlined" />
                    )}
                </Box>
            </CardContent>
            
            <CardActions sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 2, pt: 1 }}>
                {project.githubLink && (
                    <Button 
                        size="small" 
                        startIcon={<GitHub />} 
                        href={project.githubLink} 
                        target="_blank" 
                        rel="noopener"
                        sx={{ whiteSpace: 'nowrap' }} // 텍스트 줄 바꿈 방지
                    >
                        GitHub
                    </Button>
                )}
                {project.projectLink && (
                    <Button 
                        size="small" 
                        startIcon={<Public />} 
                        href={project.projectLink} 
                        target="_blank" 
                        rel="noopener"
                        sx={{ whiteSpace: 'nowrap' }} // 텍스트 줄 바꿈 방지
                    >
                        Demo
                    </Button>
                )}
                <Box sx={{ ml: 'auto' }}>
                    <Button 
                        size="small" 
                        onClick={handleViewDetail} 
                        color="primary" 
                        variant="text"
                        sx={{ whiteSpace: 'nowrap' }} // 텍스트 줄 바꿈 방지
                    >
                        자세히 보기
                    </Button>
                </Box>
            </CardActions>
        </Card>
    );
};

// --- 메인 Projects Page 컴포넌트 ---
export const ProjectsPage: React.FC = () => {
    const { userInfo } = useAuth();
    const isAdmin = userInfo?.role === 'ADMIN';
    const navigate = useNavigate();

    const [projectData, setProjectData] = useState<ProjectPageResponse>(initialProjectData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1); // 1-based index

    // --- 데이터 로딩 함수 (변경 없음) ---
    const loadProjects = useCallback(async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchProjects(page - 1, ITEMS_PER_PAGE);
            setProjectData(data);
            setCurrentPage(data.currentPage + 1);
        } catch (e) {
            console.error("프로젝트 목록을 불러오지 못했습니다.", e);
            setError('프로젝트 목록을 불러오는 중 오류가 발생했습니다.');
            setProjectData(initialProjectData);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProjects(currentPage);
    }, [loadProjects, currentPage]);

    // --- 페이지 변경 핸들러 (변경 없음) ---
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        if (value !== currentPage) {
             setCurrentPage(value);
             window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    const totalProjects = projectData.totalElements;

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box mb={4} textAlign="center">
                <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight={700}>
                    💻 나의 프로젝트
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" mt={1} mb={4} align="center">
                    성장하기 위해 경험한 주요 프로젝트들을 소개합니다.
                </Typography>
            </Box>

            {/* 💡 관리자 전용: 새 프로젝트 등록 버튼 영역 (변경 없음) */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h6" gutterBottom color="primary.main" fontWeight="bold" sx={{ m: 0 }}>
                    총 {totalProjects}개 프로젝트
                </Typography>
                
                {isAdmin && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={() => navigate('/admin/projects/new')}
                    >
                        새 프로젝트 등록
                    </Button>
                )}
            </Box>
            {/* --------------------------------------------------- */}

            <Box mt={4}>
                {loading && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <CircularProgress color="primary" />
                        <Typography mt={2} color="text.secondary">프로젝트 목록을 불러오는 중...</Typography>
                    </Box>
                )}
                
                {error && (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                )}
                
                {!loading && projectData.content.length === 0 && !error && (
                    <Alert severity="info" variant="outlined" sx={{ mb: 4 }}>
                        아직 등록된 프로젝트가 없습니다.
                    </Alert>
                )}

                {!loading && projectData.content.length > 0 && (
                    // ✅ MUI Grid 경고 해결: Grid v5 이상에서는 item prop을 사용하지 않습니다. 
                    // Grid 컴포넌트 자체에 반응형 props(xs, sm, md)를 적용합니다.
                    <Grid container spacing={4}>
                        {projectData.content.map((project) => (
                            <Grid 
                                key={project.id} 
                                sx={{
                                  width:{
                                    xs: '100%',  // 모바일: 1열
                                    sm: '50%',   // 태블릿: 2열
                                    md: '30%' // 데스크탑: 3열
                                  }, 
                                }}
                            >
                                <ProjectCard project={project} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
            
            {/* 페이지네이션 (변경 없음) */}
            {projectData.totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={6}>
                    <Pagination
                        count={projectData.totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                    />
                </Box>
            )}
        </Container>
    );
};

export default ProjectsPage;