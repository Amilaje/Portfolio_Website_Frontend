// frontend/pages/Board.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // ADMIN 권한 확인을 위한 useAuth
import { fetchPosts } from '../api/apiClient'; // API 호출
import type { PostPageResponse } from '../types/post'; // Post 타입
 // Post 타입
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Pagination,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const ITEMS_PER_PAGE = 10;
const INITIAL_PAGE_STATE: PostPageResponse = {
  content: [],
  totalPages: 1,
  totalElements: 0,
  currentPage: 0,
  size: ITEMS_PER_PAGE,
  first: true,
  last: true,
};

export const Board: React.FC = () => {
  const navigate = useNavigate();
  // AuthContext에서 사용자 정보와 로그인 상태를 가져옵니다.
  const { userInfo, isAuthenticated } = useAuth();
  
  const [postData, setPostData] = useState<PostPageResponse>(INITIAL_PAGE_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // MUI Pagination은 1부터 시작
  const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태

  // 현재 사용자가 ADMIN 권한을 가졌는지 확인
  const isAdmin = isAuthenticated && userInfo?.role === 'ADMIN';

  // 백엔드 API는 page를 0부터 받으므로 -1 처리 필요
  const loadPosts = async (page: number, query: string) => {
    setLoading(true);
    setError(null);
    try {
      // page - 1: 백엔드 API가 0-indexed 페이지를 받으므로
      const data = await fetchPosts(query, page - 1, ITEMS_PER_PAGE, 'createdAt'); 
      setPostData(data);
    } catch (e) {
      console.error("게시글 목록을 불러오지 못했습니다.", e);
      setError('게시글 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadPosts(currentPage, searchQuery); 
  }, [currentPage, searchQuery]);

  // // --- 임시 디버깅 코드 추가 ---
  // console.log("로그인 상태:", isAuthenticated);
  // console.log("현재 사용자 객체:", userInfo);
  // console.log("현재 사용자 권한 (user?.role):", userInfo?.role);
  // // -----------------------------

  // 페이지네이션 클릭 핸들러
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    // 검색 시 1페이지로 리셋하고 새 쿼리로 데이터 호출
    if (currentPage === 1) {
      loadPosts(1, searchQuery);
    } else {
      setCurrentPage(1); 
    }
  };

  // 게시글 제목 클릭 시 상세 페이지로 이동
  const handlePostClick = (postId: number) => {
    navigate(`/board/${postId}`);
  };
  
  // 새 글 작성 버튼 클릭 (ADMIN 전용)
  const handleWriteClick = () => {
    navigate('/board/write');
  };

  return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          📒나의 게시판
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mt={1} mb={4} align="center">
          JinHo만 작성 가능합니다.
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            {/* 검색 입력창 */}
            <TextField
                label="제목 또는 내용 검색"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch} edge="end">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ width: '300px' }}
            />
            {/* 글 작성 버튼 (ADMIN에게만 표시) */}
            {isAdmin && (
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleWriteClick}
                >
                    새 글 작성
                </Button>
            )}
        </Box>
        
        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
            </Box>
        ) : error ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        ) : (
            <>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#202124' }}>
                                <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>번호</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '50%' }}>제목</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>작성자</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', width: '15%' }}>작성일</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', width: '10%' }}>조회수</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {postData.content.length > 0 ? (
                                postData.content.map((post) => (
                                    <TableRow 
                                        key={post.id} 
                                        hover 
                                        onClick={() => handlePostClick(post.id)}
                                        sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#e0f7fa' } }}
                                    >
                                        <TableCell>{post.id}</TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                {post.title}
                                                {/* ADMIN 글 표시 (선택 사항) */}
                                                {/* {post.authorUsername === userInfo?.username && (
                                                    <Chip label="My Post" size="small" color="info" sx={{ ml: 1, height: '20px' }} />
                                                )} */}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{post.authorUsername}</TableCell>
                                        <TableCell align="right">{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell align="right">{post.viewCount}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        게시글이 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* 페이지네이션 컴포넌트 */}
                {postData.totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination
                            count={postData.totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            boundaryCount={2}
                        />
                    </Box>
                )}
            </>
        )}
      </Box>
  );
};

export default Board;