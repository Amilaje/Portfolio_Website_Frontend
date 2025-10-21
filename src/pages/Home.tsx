import React from 'react';
import { 
    Container, 
    Box, 
    Typography, 
    Paper, 
    Grid, 
    Divider, 
    Chip, 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText,
    Button,
    useTheme
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CodeIcon from '@mui/icons-material/Code';
import BiotechIcon from '@mui/icons-material/Biotech';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import DataObjectIcon from '@mui/icons-material/DataObject';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GitHubIcon from '@mui/icons-material/GitHub';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';

// 사용자 정의 컴포넌트 import (이전 단계에서 생성)
// 이 파일 경로는 실제 프로젝트 구조에 맞게 유지 또는 수정해야 합니다.
import CurrentTime from '../components/common/CurrentTime';

// --- 데이터 정의 (포트폴리오 내용 기반) ---

// Tech Stack 데이터
const techStacks = {
    Languages: ['Python', 'Java'],
    'Frameworks & Libraries': ['LangGraph', 'LangChain', 'YOLO', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'NumPy', 'Pandas', 'Spring Boot', 'React'],
    Tools: ['PyCharm', 'VSCode', 'IntelliJ IDEA', 'GitHub', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'MSA', 'MSA EZ Modeling', 'Kafka'],
};

// Certification 데이터
const certifications = [
    { name: 'AICE Basic', icon: <CheckCircleOutlineIcon color="primary" /> },
    { name: 'AICE Associate', icon: <CheckCircleOutlineIcon color="primary" /> },
    { name: '컴퓨터 활용능력 2급', icon: <CheckCircleOutlineIcon color="primary" /> },
    { name: '딥러닝 활용능력 3급', icon: <CheckCircleOutlineIcon color="primary" /> },
    { name: 'IT Plus Level 2', icon: <CheckCircleOutlineIcon color="primary" /> },
    { name: '워드프로세서', icon: <CheckCircleOutlineIcon color="primary" /> },
    { name: '빅 데이터 분석기사 (필기 합격)', icon: <CheckCircleOutlineIcon color="secondary" /> },
];

// 핵심 프로젝트 (카드형) - 링크는 추후 실제 주소로 대체
const coreProjects = [
    {
        title: 'KT Aivle School 빅프로젝트 – 약국 자동화 플랫폼 (YeahYak)',
        role: '팀장, 백엔드/AI 모델 구현 및 Gateway 통합',
        description: 'AI·클라우드 기반 약국 통합 플랫폼. GPT 기반 신약 요약, LangGraph 기반 FAQ 챗봇 에이전트 설계, LightGBM 발주 예측 모델, Docker/Azure AKS 배포.',
        tags: ['LLM Agent', 'LangGraph', 'Spring Boot', 'React', 'Azure AKS'],
        link: '/projects/yeahyak' 
    },
    {
        title: '기상청 데이터 공모전 – 열수요 예측 모델 (입상)',
        role: '팀장, 데이터 전처리, Stacking 모델 설계, 보고서 총괄',
        description: '공공 기상 데이터와 시계열 데이터를 활용한 열수요 예측 모델. Fourier Series와 LightGBM/Stacking 모델을 통해 MAE 성능 개선 달성.',
        tags: ['LightGBM', 'Time Series', 'Feature Engineering', 'Awarded'],
        link: '/projects/contest' 
    },
    {
        title: 'LLM Agent 기반 AI 면접관 Agent 시스템',
        role: '팀장, LLM 파이프라인 설계 및 주요 Agent 로직 개발',
        description: 'LangGraph 기반 다중 스텝 LLM Agent 구성. 이력 기반 질문 생성, 요약, 키워드 추출 및 평가까지 수행하는 대화형 면접관 시스템.',
        tags: ['LangGraph', 'LLM Agent', 'GPT', 'Python'],
        link: '/projects/interviewer' 
    },
];

// 기타 프로젝트 (요약 목록)
const otherProjects = [
    'MSA 기반 도서 구독 플랫폼 구축 프로젝트 (팀장, Kafka/Azure AKS)',
    'Spring Boot + React 기반 도서관리 웹 시스템 (팀장, 풀스택 개발)',
    'AWS 기반 클라우드 인프라 구축 (팀장, 3-Tier VPC 설계/ALB/Bastion Host)',
    '머신러닝 기반 모션 분류 시스템 (ML 모델 비교 및 피처 엔지니어링)',
    '이미지 분류 (MobileNetV2 기반 Fine-tuning)',
    'Unity 기반 2D 게임 개발'
];

// Contact 데이터
const contacts = [
    { name: 'Gmail', icon: <ContactMailIcon />, link: 'mailto:choijinho321@gmail.com' },
    { name: 'Velog', icon: <DescriptionIcon />, link: 'https://velog.io/@choijinho1/posts' },
    { name: 'Notion', icon: <GitHubIcon />, link: 'https://www.notion.so/1e6c91955b3d80bfaa8cce9a1bcd1952' }, // Notion 아이콘 대신 GitHub으로 통일
];

// --- 컴포넌트 ---
const Home: React.FC = () => {
    const theme = useTheme();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
                
                {/* 1. Header & Title Section */}
                <Box sx={{ textAlign: 'center', mb: 4, pt: 2 }}>
                    <Typography 
                        variant="h3" 
                        component="h1" 
                        sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 0.5 }}
                    >
                        JinHo's Portfolio
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        AI Developer | LLM Agent Developer | Data Analysit
                    </Typography>
                    <Divider sx={{ mt: 3, mb: 4 }} />
                </Box>
                
                {/* 2. About Me */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                        <AccountCircleIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> About Me
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                        천문학을 전공하고 천문대에서 7년간 근무한 뒤, 인공지능 개발자로 커리어 전환에 성공했습니다.
                        <br />
                        꾸준한 학습과 실전 프로젝트를 통해 AI 시스템을 설계하고 구현하는 실무 역량을 쌓았습니다.
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                        KT 에이블스쿨 7기 심화 교육 과정을 수료했으며, 딥러닝, 머신러닝, LLM 기반 응용 시스템, 클라우드 인프라 등 
                        다양한 기술을 실습하며 실전 경험을 넓혔습니다.
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            🌱 성장 목표:
                        </Typography>
                        <Typography variant="body2">
                            데이터를 이해하고 문제를 정의하며, AI 기술을 활용해 효과적인 해결책을 설계할 수 있는 실전형 AI 개발자로 성장하는 것입니다.
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* 3. Tech Stack */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                        <CodeIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> Tech Stack
                    </Typography>
                    {Object.entries(techStacks).map(([category, skills]) => (
                        <Box key={category} sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, borderBottom: `2px solid ${theme.palette.divider}` }}>
                                {category}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {skills.map((skill) => (
                                    <Chip 
                                        key={skill} 
                                        label={skill} 
                                        variant="outlined" 
                                        color="primary" 
                                        size="medium"
                                        sx={{ 
                                            fontWeight: 600, 
                                            // 커스텀 배지 스타일
                                            borderColor: theme.palette.primary.light,
                                            color: theme.palette.text.primary 
                                        }} 
                                    />
                                ))}
                            </Box>
                        </Box>
                    ))}
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* 4. Certifications (MUI Grid v2 수정 적용) */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                        <EmojiEventsIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> Certifications
                    </Typography>
                    {/* Grid v2 마이그레이션: item prop 제거, xs/sm/md prop을 sx로 대체 */}
                    <Grid 
                        container 
                        spacing={2} 
                        // v2에서는 spacing 대신 gap을 사용할 수 있으나, 기존 코드를 존중하여 spacing을 유지합니다.
                        // 다만, 자식 Grid 요소에 item/xs/sm/md prop 대신 sx prop을 사용하여 크기를 지정합니다.
                    >
                        {certifications.map((cert) => (
                            <Grid 
                                key={cert.name}
                                // v2: item prop 및 크기 prop 제거 후, sx로 너비 설정
                                sx={{
                                    width: { 
                                        xs: '100%',     // 12/12
                                        sm: '50%',      // 6/12
                                        md: '33.3333%' // 4/12
                                    },
                                    // spacing={2}를 위해 Grid 자식에 padding 적용
                                    padding: theme.spacing(1) // spacing(2)의 절반
                                }}
                            >
                                <Chip 
                                    label={cert.name} 
                                    icon={cert.icon}
                                    sx={{ 
                                        width: '100%', 
                                        justifyContent: 'flex-start',
                                        py: 1.5,
                                        px: 1,
                                        fontWeight: 500
                                    }} 
                                    variant="filled"
                                    color={cert.name.includes('필기') ? 'secondary' : 'primary'}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* 5. Projects (Core Projects를 세로 정렬로 변경) */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                        <BiotechIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> Core Projects
                    </Typography>
                    
                    {/* 👇👇👇 핵심 수정 부분: Grid에서 Box 기반 세로 정렬로 변경 👇👇👇 */}
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 3, // 프로젝트 간 세로 간격
                            mb: 4 
                        }}
                    >
                        {coreProjects.map((project, index) => (
                            <Paper 
                                key={index} 
                                elevation={2} 
                                sx={{ 
                                    p: { xs: 2, sm: 3 }, // 반응형 패딩 추가
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    width: '100%', 
                                }}
                            >
                                <Button 
                                    component="a" 
                                    href={project.link} 
                                    target="_blank" 
                                    rel="noopener" 
                                    color="primary"
                                    sx={{ p: 0, justifyContent: 'flex-start', textTransform: 'none' }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'left' }}>
                                        {project.title}
                                    </Typography>
                                </Button>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                    <PeopleIcon fontSize="small" sx={{ mr: 0.5 }} /> 내 역할: {project.role}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2, flexGrow: 1, lineHeight: 1.6 }}>
                                    {project.description}
                                </Typography>
                                <Box sx={{ mt: 'auto', display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {project.tags.map((tag) => (
                                        <Chip key={tag} label={tag} size="small" variant="filled" color="default" />
                                    ))}
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                    {/* 👆👆👆 핵심 수정 부분 끝 👆👆👆 */}

                    {/* 기타 프로젝트 (요약 목록) */}
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                        <DataObjectIcon sx={{ mr: 1 }} /> Other Experiences (7+ Projects)
                    </Typography>
                    <List disablePadding>
                        {otherProjects.map((proj, index) => (
                            <ListItem key={index} disableGutters sx={{ py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 30, color: theme.palette.primary.main }}>
                                    •
                                </ListItemIcon>
                                <ListItemText primary={proj} primaryTypographyProps={{ variant: 'body2' }} />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* 6. Contact Me */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ContactMailIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> Contact Me
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        {contacts.map((contact) => (
                            <Button
                                key={contact.name}
                                variant="contained"
                                color="primary"
                                startIcon={contact.icon}
                                href={contact.link}
                                target="_blank"
                                rel="noopener"
                                sx={{ textTransform: 'none' }}
                            >
                                {contact.name}
                            </Button>
                        ))}
                    </Box>
                </Box>

                <Divider sx={{ my: 4 }} />
                
                {/* 7. Footer - Time & Auth Status */}
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        "끊임없는 학습과 실전 경험을 통해, 문제 해결형 AI 개발자로 성장하며 
                        협업과 실행력을 갖춘 기술인을 지향하고 있습니다."
                    </Typography>
                    
                    {/* 시계/날씨 컴포넌트 */}
                    <CurrentTime defaultLocation="대전" sx={{ mb: 2 }} /> 

                    {/* 인증 시스템 신뢰도 문구 */}
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
                        본 포트폴리오는 AWS 클라우드 인프라 기반의 Spring Boot/React 풀스택 시스템으로, 
                        JWT 인증 및 권한 제어 시스템의 신뢰도를 보장합니다.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Home;