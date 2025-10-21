import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Fab,
    Modal,
    Box,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Alert,
    Paper,
    Typography,
    Avatar,
    IconButton,
    InputAdornment,
    useTheme,
    Link as MuiLink,
} from '@mui/material';
import { Chat as ChatIcon, Close, Send, InfoOutlined } from '@mui/icons-material';
import apiClient from '../../api/apiClient';

// ------------------------------------------------------------
// 챗봇 관련 타입 정의
// ------------------------------------------------------------

// Spring Boot 백엔드 API 응답 DTO와 동일
interface ChatResponse {
    response: string; // 챗봇의 답변 텍스트
    latencyMs: number; // 챗봇 응답 지연 시간 (밀리초)
    sourceDocuments: string[]; // 답변의 근거가 된 소스 문서 이름
}

// 챗 메시지 타입
interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    sources?: string[];
    latencyMs?: number;
}

// ------------------------------------------------------------
// API 통신 함수
// ------------------------------------------------------------

/**
 * 백엔드 Spring Boot 서버로 질문을 전송하고 응답을 받습니다.
 * @param query 사용자의 질문
 * @returns ChatResponse 객체를 Promise로 반환
 */
const fetchChatResponse = async (query: string): Promise<ChatResponse> => {
    // 백엔드 API 엔드포인트: POST /api/chat/query
    // apiClient의 baseURL이 'http://localhost:8080/api'라고 가정
    const API_ENDPOINT = '/chat/query'; 

    try {
        const response = await apiClient.post<ChatResponse>(API_ENDPOINT, { query });

        // Axios는 2xx 응답에 대해서만 resolve하고, 4xx/5xx는 catch로 처리합니다.
        return response.data;

    } catch (error: any) {
        console.error('챗봇 API 통신 오류:', error);
        
        let errorMessage = '죄송합니다. 챗봇 서버에 연결할 수 없습니다.';

        // Axios 오류 처리
        if (error.response) {
            // 서버 응답이 왔으나 상태 코드가 2xx가 아닌 경우 (예: 401 Unauthorized, 403 Forbidden)
            if (error.response.status === 401 || error.response.status === 403) {
                 errorMessage = '챗봇은 로그인한 사용자만 이용할 수 있습니다. 로그인이 필요합니다.';
            } else {
                 errorMessage = `API 호출 실패: ${error.response.status} ${error.response.statusText}`;
            }
        } else if (error.request) {
            // 요청은 전송되었으나 응답을 받지 못한 경우
            errorMessage = '챗봇 서버에 연결할 수 없습니다. 백엔드 서버 상태를 확인해 주세요.';
        }

        // 오류 발생 시 fallback 응답 제공
        return {
            response: errorMessage,
            latencyMs: 0,
            sourceDocuments: [],
        };
    }
};

// ------------------------------------------------------------
// 메인 Chatbot 컴포넌트
// ------------------------------------------------------------

// 초기 메시지 설정
const initialMessages: Message[] = [
    {
        id: Date.now(),
        text: "안녕하세요! 저는 AI 개발자 '최진호'님의 포트폴리오를 기반으로 답변하는 챗봇입니다. 무엇이든 물어보세요!",
        sender: 'bot',
        timestamp: new Date(),
    },
];

export const Chatbot: React.FC = () => {
    const theme = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [inputQuery, setInputQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);

    // 메시지 리스트의 스크롤을 최신 메시지로 자동 이동시키기 위한 Ref
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 모달 토글 핸들러
    const handleToggle = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    // 스크롤 함수
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 메시지 전송 핸들러
    const handleSendMessage = useCallback(async () => {
        const trimmedQuery = inputQuery.trim();
        if (!trimmedQuery || isLoading) return;

        // 1. 사용자 메시지 추가
        const newUserMessage: Message = {
            id: Date.now(),
            text: trimmedQuery,
            sender: 'user',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, newUserMessage]);
        setInputQuery('');
        setIsLoading(true);

        // 2. API 호출
        try {
            const chatResponse = await fetchChatResponse(trimmedQuery);

            // 3. 챗봇 응답 메시지 추가
            const newBotMessage: Message = {
                id: Date.now() + 1,
                text: chatResponse.response,
                sender: 'bot',
                timestamp: new Date(),
                latencyMs: chatResponse.latencyMs,
                sources: chatResponse.sourceDocuments,
            };
            setMessages(prev => [...prev, newBotMessage]);

        } catch (e) {
            // API 통신 레벨의 최종 오류 처리 (fetchChatResponse에서 기본적으로 처리됨)
            const errorBotMessage: Message = {
                id: Date.now() + 1,
                text: '내부 오류로 인해 답변을 생성할 수 없습니다.',
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorBotMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [inputQuery, isLoading]);

    // Enter 키로 메시지 전송
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // 기본 개행 방지
            handleSendMessage();
        }
    };

    // 메시지 목록이 업데이트 될 때마다 스크롤
    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]); // isOpen이 변경될 때도 스크롤

    // ------------------------------------------------------------
    // 챗봇 UI 렌더링
    // ------------------------------------------------------------

    // 채팅창 스타일
    const modalStyle = {
        position: 'fixed',
        bottom: 80, 
        right: 20,
        width: { xs: '90%', sm: 380 },
        height: { xs: '70%', sm: 500 },
        // [변경 포인트 1]: 배경을 다크 모드 Paper/Surface 색상으로 설정
        bgcolor: theme.palette.background.paper, 
        borderRadius: 3,
        boxShadow: 24,
        p: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1300, 
        '@media (max-width: 600px)': {
            right: '5%',
            bottom: 20,
            left: '5%',
            width: '90%',
        },
    };

    // 메시지 말풍선 컴포넌트
    const ChatMessage: React.FC<{ message: Message }> = ({ message }) => (
        <ListItem
            sx={{
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                px: 2,
                py: 0.5,
                pr: message.sender === 'bot' ? '60px' : '20px', 
            }}
        >
            {message.sender === 'bot' && (
                // 봇 아바타 색상: Primary (대비되는 색상)
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 28, height: 28, mr: 1, fontSize: '12.8px' }}>AI</Avatar>
            )}
            <Box
                sx={{
                    maxWidth: '85%',
                    p: 1.5,
                    borderRadius: 3,
                    
                    // 👇👇👇 [변경 포인트 3: 말풍선 배경색] 👇👇👇
                    bgcolor: message.sender === 'user'
                        ? theme.palette.primary.dark // 사용자: 더 진한 Primary 계열 (Gemini style)
                        : theme.palette.secondary.dark, // 봇: Primary와 대비되는 Secondary 계열 (진한 연두/청록/보라 등. Dark mode에서 잘 보이는 색으로 변경)
                        
                    // 👇👇👇 [변경 포인트 4: 말풍선 텍스트색] 👇👇👇
                    color: theme.palette.common.white, // 다크 모드에서는 모두 흰색/밝은 색으로 설정
                    
                    wordBreak: 'break-word',
                    boxShadow: 1,
                    whiteSpace: 'pre-wrap'
                }}
            >
                {/* 텍스트 내용 (omitted) */}
                <Typography variant="body2" component="div">
                    {message.text.split('**').map((part, index) => 
                        index % 2 === 1 ? <Typography component="span" fontWeight="bold" key={index}>{part}</Typography> : part
                    )}
                </Typography>
                
                {message.sender === 'bot' && message.sources && message.sources.length > 0 && (
                    <Box mt={1} pt={1} borderTop={`1px dashed ${theme.palette.grey[600]}`}> {/* 다크모드에서 잘 보이는 더 진한 구분선 */}
                        <Typography variant="caption" display="flex" alignItems="center" color="text.secondary">
                            <InfoOutlined fontSize="inherit" sx={{ mr: 0.5 }} />
                            RAG 근거 ({message.latencyMs}ms)
                        </Typography>
                        {/* 근거 문서 표시 (omitted) */}
                        {message.sources.map((src, i) => (
                            <MuiLink 
                                key={i} 
                                component="p" 
                                variant="caption" 
                                sx={{ 
                                    textDecoration: 'underline', 
                                    // [변경 포인트 5: 링크 색상] 다크 모드 배경에서 잘 보이는 색상
                                    color: theme.palette.grey[400], 
                                    '&:hover': { color: theme.palette.secondary.light }
                                }}
                                onClick={() => alert(`소스 문서: ${src}`)} 
                            >
                                - {src}
                            </MuiLink>
                        ))}
                    </Box>
                )}
                
                <Typography 
                    variant="caption" 
                    sx={{ 
                        display: 'block', 
                        mt: 0.5, 
                        // [변경 포인트 6: 타임스탬프 색상]
                        color: theme.palette.grey[400], // 다크 모드에서 잘 보이는 연한 회색
                        textAlign: message.sender === 'user' ? 'right' : 'left'
                    }}
                >
                    {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </Typography>

            </Box>
            {message.sender === 'user' && (
                // 사용자 아바타 색상: Secondary (대비되는 색상)
                <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 28, height: 28, ml: 1, fontSize: '12.8px' }}>나</Avatar>
            )}
        </ListItem>
    );

    return (
        <>
            {/* 1. 챗봇 플로팅 버튼 (Fab) */}
            <Fab
                color="primary"
                aria-label="chat"
                onClick={handleToggle}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 1200, // 기본 모달/팝오버보다 위에 위치
                    transition: 'transform 0.3s',
                    '&:hover': {
                        transform: 'scale(1.05)',
                    },
                }}
            >
                {isOpen ? <Close /> : <ChatIcon />}
            </Fab>

            {/* 2. 챗봇 채팅 창 (Modal) */}
            <Modal
                open={isOpen}
                onClose={handleToggle}
                aria-labelledby="chatbot-title"
                aria-describedby="chatbot-description"
                // backdrop을 표시하지 않아 모달 외의 영역을 클릭해도 닫히지 않도록 합니다.
                // 닫는 것은 Fab 버튼이나 Close 버튼으로만 가능하게 합니다.
                slotProps={{ backdrop: { invisible: true } }} 
            >
                <Paper sx={modalStyle} elevation={8}>
                    {/* 헤더 */}
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            borderTopLeftRadius: theme.shape.borderRadius * 3,
                            borderTopRightRadius: theme.shape.borderRadius * 3,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography id="chatbot-title" variant="h6" fontWeight="bold">
                            최진호의 포트폴리오 챗봇
                        </Typography>
                        <IconButton onClick={handleToggle} color="inherit" size="small">
                            <Close />
                        </IconButton>
                    </Box>

                    {/* 메시지 리스트 */}
                    <List
                        sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            p: 0,
                            // List padding 조정
                            pb: 1, 
                            // 스크롤바 커스터마이징 (웹킷 브라우저)
                            '&::-webkit-scrollbar': { width: '8px' },
                            '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.grey[400], borderRadius: '4px' },
                            '&::-webkit-scrollbar-track': { backgroundColor: theme.palette.grey[100] },
                        }}
                    >
                        {messages.map((msg) => (
                            <ChatMessage key={msg.id} message={msg} />
                        ))}
                        {/* 로딩 인디케이터 */}
                        {isLoading && (
                            <ListItem sx={{ justifyContent: 'flex-start', px: 2, py: 0.5 }}>
                                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 28, height: 28, mr: 1, fontSize: '12.8px' }}>AI</Avatar>
                                <CircularProgress size={20} sx={{ m: 1 }} />
                            </ListItem>
                        )}
                        <div ref={messagesEndRef} />
                    </List>

                    {/* 입력창 */}
                    <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                        <TextField
                            fullWidth
                            variant="standard"
                            placeholder="질문을 입력하세요..."
                            value={inputQuery}
                            onChange={(e) => setInputQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            size="small"
                            multiline
                            maxRows={4}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end" sx={{ mt: 'auto' }}>
                                        <IconButton
                                            color="primary"
                                            onClick={handleSendMessage}
                                            disabled={!inputQuery.trim() || isLoading}
                                            edge="end"
                                            sx={{ p: 1 }}
                                        >
                                            <Send />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                style: { 
                                    paddingRight: 0, // IconButton을 위해 패딩 제거
                                    alignItems: 'flex-end', // 멀티라인에서 버튼을 하단에 정렬
                                },
                            }}
                        />
                    </Box>
                </Paper>
            </Modal>
        </>
    );
};

export default Chatbot;