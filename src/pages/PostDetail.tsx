import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { fetchPostDetail, deletePost } from '../api/apiClient'; // deletePost API import
import type { PostDetailResponse } from '../types/post';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import remarkMath from 'remark-math';
import { useAuth } from '../contexts/AuthContext'; // useAuth 훅 import
import {
    Container,
    Typography,
    Box,
    Divider,
    CircularProgress,
    Button,
    Chip,
    Paper,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'; 

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    return (
        // p: 텍스트를 감싸는 Paper 컴포넌트의 패딩과 겹치지 않도록 mt를 제거했습니다.
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
                // 코드 블록 렌더링 오버라이드
                code: ({ inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                        <SyntaxHighlighter
                            // 👇 다크 모드 스타일 적용
                            style={dracula} 
                            language={match[1]}
                            PreTag="div" // PreTag를 div로 설정
                            {...props}
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    ) : (
                        <code className={className} {...props} style={{ backgroundColor: '#f0f0f0', padding: '2px 4px', borderRadius: '4px' }}>
                            {children}
                        </code>
                    );
                },
                // MUI의 typography와 일치하도록 HTML 태그 오버라이드 (선택 사항)
                h1: ({children}) => <Typography variant="h5" component="h1" mt={4} mb={2}>{children}</Typography>,
                h2: ({children}) => <Typography variant="h6" component="h2" mt={3} mb={1.5} sx={{ borderBottom: '1px solid #eee', pb: 0.5 }}>{children}</Typography>,
                //p: ({children}) => <Typography variant="body1" sx={{ lineHeight: 1.6, mb: 1.5 }}>{children}</Typography>,
                a: ({children, href}) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>{children}</a>,
                li: ({children}) => <li style={{ marginLeft: '20px', marginBottom: '8px' }}>{children}</li>,
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

export const PostDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { userInfo } = useAuth(); // 사용자 정보 가져오기
    const postId = id ? parseInt(id, 10) : null;

    const [post, setPost] = useState<PostDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ADMIN 권한 확인
    const isAdmin = userInfo?.role === 'ADMIN'; 

    useEffect(() => {
        if (!postId) {
            setError('올바르지 않은 게시글 ID입니다.');
            setLoading(false);
            return;
        }
        
        const loadPost = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchPostDetail(postId);
                setPost(data);
            } catch (e) {
                console.error("게시글 상세 정보를 불러오지 못했습니다.", e);
                // 404 에러 등 처리
                setError('요청하신 게시글을 찾을 수 없거나 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };
        
        loadPost();
    }, [postId]);

    const handleDelete = async () => {
        // NOTE: window.confirm()은 Immersive 환경에서 사용 금지. 실제로는 Custom Modal로 대체해야 합니다.
        if (window.confirm('게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            try {
                if (postId) {
                    await deletePost(postId);
                    // 삭제 성공 시 목록으로 이동
                    navigate('/board');
                }
            } catch (e) {
                console.error("게시글 삭제 실패:", e);
                // TODO: 사용자에게 오류 메시지를 표시하는 Custom Modal 구현
                alert("게시글 삭제에 실패했습니다. 관리자 권한을 확인해주세요.");
            }
        }
    };

    if (loading) return <MainLayout><Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container></MainLayout>;
    if (error) return <MainLayout><Container sx={{ py: 8, textAlign: 'center' }}><Typography color="error">{error}</Typography><Button onClick={() => navigate('/board')}>목록으로</Button></Container></MainLayout>;
    if (!post) return <MainLayout><Container sx={{ py: 8, textAlign: 'center' }}><Typography>게시글이 존재하지 않습니다.</Typography><Button onClick={() => navigate('/board')}>목록으로</Button></Container></MainLayout>;

    return (
            <Container maxWidth="md" sx={{ py: 6 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ wordBreak: 'break-word', fontWeight: 700 }}>
                    {post.title}
                </Typography>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" color="text.secondary" mb={2}>
                    <Box display="flex" alignItems="center">
                        {/* 작성자가 ADMIN임을 명시 */}
                        <Chip 
                            icon={<AdminPanelSettingsIcon />} 
                            label={`작성자: ${post.authorUsername}`} 
                            size="small" 
                            color="info" // 변경: primary에서 info로 변경
                            variant="outlined" 
                            sx={{ mr: 2, borderColor: 'primary.main', color: 'primary.main' }}
                        />
                        <Typography variant="body2" sx={{ mr: 2 }}>
                            작성일: {new Date(post.createdAt).toLocaleDateString()}
                        </Typography>
                        <Box display="flex" alignItems="center">
                            <VisibilityIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">{post.viewCount}</Typography>
                        </Box>
                    </Box>
                </Box>
                
                <Divider sx={{ mb: 3 }} />

                {/* 게시글 내용 */}
                <Paper elevation={0}
                    sx={{ 
                        p: 4, 
                        minHeight: '300px', 
                        backgroundColor: 'background.paper', 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        borderRadius: 2 , 
                        wordBreak: 'break-word', 
                        whiteSpace: 'normal',
                        // 🚨 추가된 부분: KaTeX 블록 수식(katex-display)에 대한 스타일
                        '& .katex-display': {
                            overflowX: 'auto', // 긴 수식일 경우 스크롤 허용
                            overflowY: 'hidden',
                            py: 1.5, // 위아래 여백
                            mb: 2,
                            // 블록 수식을 감싸는 div에 배경색을 적용하려면 이 스타일을 사용합니다.
                            backgroundColor: '#1e1e1e', // 다크모드 배경색 예시
                            borderRadius: 1,
                            p: 2,
                        }
                    }}
                    >
                    <MarkdownRenderer content={post.content} />
                </Paper>
                
                {post.fileUrl && (
                    <Box mt={3}>
                        <Typography variant="subtitle2" color="text.secondary">첨부 파일: </Typography>
                        <a href={post.fileUrl} target="_blank" rel="noopener noreferrer">
                            {post.fileUrl.substring(post.fileUrl.lastIndexOf('/') + 1)}
                        </a>
                    </Box>
                )}

                <Divider sx={{ mt: 3, mb: 3 }} />

                {/* 관리자 액션 버튼 (isAdmin인 경우에만 표시) */}
                <Box display="flex" justifyContent="space-between" mt={3}>
                    <Button variant="outlined" onClick={() => navigate('/board')}>
                        목록으로
                    </Button>
                    
                    {isAdmin && (
                        <Box>
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                onClick={() => navigate(`/board/write?edit=${post.id}`)} // 수정 페이지로 이동
                                sx={{ mr: 1 }}
                            >
                                수정
                            </Button>
                            <Button 
                                variant="contained" 
                                color="error" 
                                onClick={handleDelete}
                            >
                                삭제
                            </Button>
                        </Box>
                    )}
                </Box>

            </Container>
    );
};

export default PostDetail;