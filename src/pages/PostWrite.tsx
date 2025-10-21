import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { fetchPostDetail, createPost, updatePost } from '../api/apiClient';
import type { PostCreateRequest, PostUpdateRequest } from '../types/post';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Paper,
} from '@mui/material';

export const PostWrite: React.FC = () => {
    const navigate = useNavigate();
    const { userInfo, isAuthenticated } = useAuth();
    const [searchParams] = useSearchParams();
    
    // 수정 모드 확인 (쿼리 파라미터에서 post ID를 가져옵니다)
    const editId = searchParams.get('edit');
    const isEditMode = !!editId;

    const [formData, setFormData] = useState<PostCreateRequest>({
        title: '',
        content: '',
        fileUrl: '', // 파일 업로드 기능은 나중에 구현
    });

    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // ADMIN 권한 확인
    const isAdmin = isAuthenticated && userInfo?.role === 'ADMIN';

    // 수정 모드일 때 기존 게시글 데이터 로드
    useEffect(() => {
        if (!isAdmin) {
            // ADMIN이 아니면 바로 돌려보냅니다.
            return;
        }

        if (isEditMode) {
            const postId = parseInt(editId, 10);
            if (isNaN(postId)) {
                setSubmitError('잘못된 게시글 ID입니다.');
                return;
            }

            const loadPost = async () => {
                setLoading(true);
                try {
                    const data = await fetchPostDetail(postId);
                    setFormData({
                        title: data.title,
                        content: data.content,
                        fileUrl: data.fileUrl || '',
                    });
                } catch (e) {
                    console.error("게시글 불러오기 실패:", e);
                    setSubmitError('게시글 정보를 불러오지 못했습니다.');
                } finally {
                    setLoading(false);
                }
            };
            loadPost();
        }
    }, [isEditMode, editId, isAdmin]);

    // ADMIN이 아니면 접근 거부 메시지 표시
    if (!isAdmin) {
        return (
            <MainLayout>
                <Container sx={{ py: 8, textAlign: 'center' }}>
                    <Alert severity="error">
                        <Typography variant="h6">접근 권한 없음</Typography>
                        <Typography>게시글 작성/수정은 관리자(ADMIN)만 가능합니다.</Typography>
                    </Alert>
                    <Button variant="contained" onClick={() => navigate('/board')} sx={{ mt: 3 }}>
                        게시판으로 돌아가기
                    </Button>
                </Container>
            </MainLayout>
        );
    }


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmitError(null);

        if (!formData.title || !formData.content) {
            setSubmitError('제목과 내용은 필수 입력 항목입니다.');
            setLoading(false);
            return;
        }

        try {
            let response;
            if (isEditMode && editId) {
                // 수정 모드
                const postId = parseInt(editId, 10);
                response = await updatePost(postId, formData as PostUpdateRequest);
                alert('게시글이 성공적으로 수정되었습니다.'); // TODO: Custom Alert로 대체
            } else {
                // 작성 모드
                response = await createPost(formData as PostCreateRequest);
                alert('게시글이 성공적으로 작성되었습니다.'); // TODO: Custom Alert로 대체
            }

            // 성공 시 상세 페이지로 이동
            navigate(`/board/${response.id}`);
        } catch (e) {
            console.error("게시글 저장 실패:", e);
            setSubmitError('게시글 저장 중 오류가 발생했습니다. 권한 및 서버 상태를 확인해주세요.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return <MainLayout><Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /><Typography mt={2}>게시글 불러오는 중...</Typography></Container></MainLayout>;
    }


    return (
            <Container maxWidth="md" sx={{ py: 6 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight={700}>
                    {isEditMode ? '게시글 수정' : '새 게시글 작성'}
                </Typography>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <form onSubmit={handleSubmit}>
                        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
                        
                        <TextField
                            label="제목"
                            name="title"
                            fullWidth
                            margin="normal"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            variant="outlined"
                        />
                        <TextField
                            label="내용 (Markdown 사용 가능)"
                            name="content"
                            fullWidth
                            margin="normal"
                            multiline
                            rows={15}
                            value={formData.content}
                            onChange={handleChange}
                            required
                            variant="outlined"
                            placeholder="내용을 마크다운 형식으로 작성해주세요."
                        />
                        <TextField
                            label="첨부 파일 URL (선택 사항)"
                            name="fileUrl"
                            fullWidth
                            margin="normal"
                            value={formData.fileUrl}
                            onChange={handleChange}
                            variant="outlined"
                        />

                        <Box display="flex" justifyContent="space-between" mt={4}>
                            <Button 
                                variant="outlined" 
                                onClick={() => navigate('/board')}
                                disabled={loading}
                            >
                                취소하고 목록으로
                            </Button>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="primary" 
                                disabled={loading}
                                endIcon={loading && <CircularProgress size={20} color="inherit" />}
                            >
                                {isEditMode ? '수정 완료' : '작성하기'}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Container>
    );
};

export default PostWrite;
