// GuestbookPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { 
    Container, 
    Typography, 
    Box, 
    Pagination, 
    CircularProgress, 
    Alert, 
    Paper, 
    Divider, 
    TextField, 
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    IconButton,
    Chip,
} from '@mui/material';
import { AccessTime, DeleteOutline, Person } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';

import { useAuth } from '../contexts/AuthContext';
// ------------------------------------------------------------

import { createGuestbook, deleteGuestbook, fetchGuestbooks } from '../api/apiClient';
import type { GuestbookListResponse, GuestbookPageResponse } from '../types/guestbook'; 
import { AxiosError } from 'axios';


const ITEMS_PER_PAGE = 10; 

interface GuestbookItemProps {
    entry: GuestbookListResponse;
    currentUsername: string | undefined;
    isAdmin: boolean;
    handleOpenDeleteModal: (id: number) => void;
}

// --- 방명록 항목 렌더링 컴포넌트 ---
const GuestbookItem: React.FC<GuestbookItemProps> = ({ 
    entry, 
    currentUsername, 
    isAdmin, 
    handleOpenDeleteModal 
}) => {
    // 1. 현재 사용자가 작성자인지 확인
    const isAuthor = entry.authorUsername === currentUsername;
    
    // 2. 삭제 가능 조건: 관리자이거나 (isAdmin) 작성자이면 (isAuthor) 삭제 가능
    const canDelete = isAdmin || isAuthor; 
    
    // 날짜 포맷팅
    const formattedDate = new Date(entry.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <Paper elevation={1} sx={{ p: 2, mb: 2, borderLeft: '4px solid', borderColor: 'primary.main', borderRadius: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center">
                    <Person fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="subtitle2" component="span" fontWeight="bold" sx={{ mr: 2 }}>
                        {entry.authorUsername}
                    </Typography>

                    {isAuthor && !isAdmin && (
                        <Chip label="작성자" size="small" color="success" variant="outlined" sx={{ height: '18px' }} />
                    )}
                    
                </Box>
                <Box display="flex" alignItems="center" color="text.secondary">
                    <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="caption">
                        {formattedDate}
                    </Typography>
                </Box>
            </Box>

            <Typography variant="body1" sx={{ lineHeight: 1.5, mb: 1, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                {entry.content}
            </Typography>
            
            {entry.imageUrl && (
                <Box sx={{ mt: 1 }}>
                    <img 
                        src={`https://placehold.co/100x100/9C27B0/ffffff?text=Image`} 
                        alt="첨부 이미지" 
                        style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }} 
                    />
                </Box>
            )}

            {/* ✅ canDelete 조건부 렌더링: 관리자(admin) 또는 작성자(user)일 경우에만 삭제 버튼 표시 */}
            {canDelete && (
                <Box textAlign="right" mt={1}>
                    <Button 
                        variant="outlined" 
                        color="error" 
                        size="small" 
                        startIcon={<DeleteOutline />}
                        onClick={() => handleOpenDeleteModal(entry.id)}
                    >
                        삭제
                    </Button>
                </Box>
            )}
        </Paper>
    );
};
// -----------------------------------------------------


// 방명록 목록 초기 상태
const initialGuestbookData: GuestbookPageResponse = {
    content: [],
    totalPages: 0,
    totalElements: 0,
    currentPage: 0,
    size: ITEMS_PER_PAGE,
    first: true,
    last: true,
};


export const GuestbookPage: React.FC = () => {
    // ------------------------------------------------------------
    // ✅ 실제 useAuth Context에서 사용자 정보를 가져옵니다.
    const { isAuthenticated, userInfo } = useAuth();
    const currentUsername = userInfo?.username; // 현재 로그인된 사용자 이름
    const isAdmin = userInfo?.role === 'ADMIN';
    // ------------------------------------------------------------

    // 상태 관리
    const [guestbookData, setGuestbookData] = useState<GuestbookPageResponse>(initialGuestbookData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1); // 1-based index
    const [newCommentContent, setNewCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // 알림 메시지 (Snackbar)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

    // 삭제 모달 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [guestbookToDeleteId, setGuestbookToDeleteId] = useState<number | null>(null);


    // --- 데이터 로딩 함수 ---
    const loadGuestbooks = useCallback(async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            // API는 0-based page를 사용하므로 page - 1 전달
            const data = await fetchGuestbooks(page - 1, ITEMS_PER_PAGE);
            setGuestbookData(data);
            setCurrentPage(data.currentPage + 1); 
        } catch (e) {
            console.error("방명록 목록을 불러오지 못했습니다.", e);
            setError('방명록 목록을 불러오는 중 오류가 발생했습니다.');
            setGuestbookData(initialGuestbookData);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // 컴포넌트 마운트 시 및 페이지 변경 시 목록 로딩
        loadGuestbooks(currentPage);
    }, [loadGuestbooks, currentPage]); 

    // --- 페이지 변경 핸들러 ---
    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        if (value !== currentPage) {
             setCurrentPage(value);
             window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // --- 방명록 작성 핸들러 ---
    const handleSubmit = async () => {
        const trimmedContent = newCommentContent.trim();
        if (!trimmedContent) {
            setSnackbar({ open: true, message: '내용을 입력해주세요.', severity: 'info' });
            return;
        }

        setIsSubmitting(true);
        try {
            await createGuestbook(trimmedContent);
            setSnackbar({ open: true, message: '방명록이 성공적으로 등록되었습니다.', severity: 'success' });
            setNewCommentContent(''); // 입력 필드 초기화
            
            // 작성 후 최신 글이 있는 첫 페이지로 이동하여 목록을 새로고침
            if (currentPage !== 1) {
                setCurrentPage(1); 
            } else {
                loadGuestbooks(1); // 이미 첫 페이지에 있다면 강제 새로고침
            }

        } catch (e) {
            console.error("방명록 작성 실패:", e);
            const status = (e as AxiosError).response?.status;
            let errorMessage = "등록에 실패했습니다. 서버 오류를 확인해주세요.";
            
            if (status === 401 || status === 403) {
                 errorMessage = "방명록을 작성할 권한이 없습니다. 로그인 상태를 확인해주세요.";
            } else if (status === 400) {
                 errorMessage = "입력 내용이 유효하지 않습니다. 500자 이내로 작성해주세요.";
            }

            setSnackbar({ open: true, message: `등록 실패: ${errorMessage}`, severity: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- 방명록 삭제 로직 (모달 사용) ---
    const handleOpenDeleteModal = (id: number) => {
        setGuestbookToDeleteId(id);
        setIsModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsModalOpen(false);
        setGuestbookToDeleteId(null);
    };

    const handleConfirmDelete = async () => {
        if (!guestbookToDeleteId) return;

        handleCloseDeleteModal(); // 모달 닫기
        
        try {
            await deleteGuestbook(guestbookToDeleteId);
            setSnackbar({ open: true, message: '방명록이 성공적으로 삭제되었습니다.', severity: 'success' });
            
            // 삭제 후 현재 페이지의 항목이 1개였을 경우, 이전 페이지로 이동
            const isLastItemOnPage = guestbookData.content.length === 1 && currentPage > 1;
            const newPage = isLastItemOnPage ? currentPage - 1 : currentPage;
            
            loadGuestbooks(newPage);
        } catch (e) {
            console.error("방명록 삭제 실패:", e);
            const status = (e as AxiosError).response?.status;
            let errorMessage = "삭제에 실패했습니다. 다시 시도해주세요.";
            
            if (status === 403) {
                 errorMessage = "삭제 권한이 없습니다. (작성자 또는 관리자만 가능)"; 
            } else if (status === 404) {
                 errorMessage = "삭제하려는 방명록을 찾을 수 없습니다."; 
            }

            setSnackbar({ open: true, message: `삭제 실패: ${errorMessage}`, severity: 'error' });
            loadGuestbooks(currentPage); // 삭제 실패해도 목록은 다시 로드하여 최신 상태 유지
        }
    };
    
    // --- 메인 렌더링 ---
    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight={700}>
                    방명록 💬
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" mt={1} mb={4} align="center">
                    방문 기록을 남겨주세요! (회원만 작성 가능)
                </Typography>
                <Divider sx={{ mb: 4 }} />

                {/* 1. 방명록 작성 폼 */}
                {isAuthenticated ? (
                    <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
                        <Typography variant="h6" mb={2} color="primary.main" fontWeight="bold">방명록 남기기</Typography>
                        <TextField
                            label="내용 (최대 500자)"
                            multiline
                            rows={4}
                            fullWidth
                            value={newCommentContent}
                            onChange={(e) => setNewCommentContent(e.target.value)}
                            disabled={isSubmitting}
                            variant="outlined"
                            sx={{ mb: 2 }}
                            inputProps={{ maxLength: 500 }}
                        />
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                                남은 글자 수: {500 - newCommentContent.length}자
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleSubmit}
                                disabled={isSubmitting || !newCommentContent.trim()}
                                sx={{ px: 3, py: 1 }}
                            >
                                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : '등록'}
                            </Button>
                        </Box>
                    </Paper>
                ) : (
                    <Alert severity="info" sx={{ mb: 4 }} variant="filled">
                        방명록 작성은 <span style={{ fontWeight: 'bold' }}>로그인 후</span> 가능합니다.
                    </Alert>
                )}

                {/* 2. 방명록 목록 */}
                <Box mt={4}>
                    <Typography variant="h6" gutterBottom>
                        총 {guestbookData.totalElements}개의 기록
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {loading && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <CircularProgress color="primary" />
                            <Typography mt={2} color="text.secondary">방명록을 불러오는 중...</Typography>
                        </Box>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mb: 4 }}>
                            {error}
                        </Alert>
                    )}

                    {!loading && guestbookData.content.length === 0 && !error && (
                        <Alert severity="warning" variant="outlined" sx={{ mb: 4 }}>
                            아직 작성된 방명록이 없습니다.
                        </Alert>
                    )}

                    {!loading && guestbookData.content.length > 0 && (
                        guestbookData.content.map((entry) => (
                            <GuestbookItem 
                                key={entry.id} 
                                entry={entry} 
                                currentUsername={currentUsername} 
                                isAdmin={isAdmin}
                                handleOpenDeleteModal={handleOpenDeleteModal}
                            />
                        ))
                    )}
                </Box>
                
                {/* 3. 페이지네이션 */}
                {guestbookData.totalPages > 1 && (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <Pagination
                            count={guestbookData.totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            size="medium"
                        />
                    </Box>
                )}

            {/* 4. 커스텀 삭제 확인 모달 */}
            <Dialog
                open={isModalOpen}
                onClose={handleCloseDeleteModal}
                aria-labelledby="delete-dialog-title"
            >
                <DialogTitle id="delete-dialog-title">{"방명록 삭제 확인"}</DialogTitle>
                <DialogContent dividers>
                    <Typography>
                        이 방명록을 정말로 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteModal} color="primary" variant="outlined">
                        취소
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
                        삭제
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 5. Snackbar (알림 메시지) */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity} 
                    sx={{ width: '100%' }}
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => setSnackbar({ ...snackbar, open: false })}
                        >
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default GuestbookPage;