import axios, { type AxiosInstance, type AxiosRequestConfig, AxiosError } from 'axios';
import type { TokenInfo } from '../types/auth'; 
import type { PostDetailResponse, PostPageResponse, PostCreateRequest, PostUpdateRequest } from '../types/post';
import type { GuestbookCreateRequest, GuestbookListResponse, GuestbookPageResponse } from '../types/guestbook';
import type { ProjectResponse, ProjectPageResponse, ProjectRequest } from '../types/project'; 
import type { ChatResponse } from '../types/chatbot';

// 백엔드 API 기본 경로 설정
const API_BASE_URL = 'http://packt-web-back-env.eba-uhvmngmc.us-east-2.elasticbeanstalk.com/api';

// 1. Interceptor가 없는 순수 Axios 인스턴스 (로그인, 토큰 재발급에 사용)
export const baseAxios: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Interceptor가 적용된 Axios 인스턴스 (보호된 API 호출에 사용)
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 토큰 재발급 관련 상태 관리
let isRefreshing = false;
// reject 함수의 reason 타입을 any 대신 unknown으로 변경하여 no-explicit-any 오류 해결
let failedQueue: { 
    resolve: (value: unknown) => void; 
    reject: (reason?: unknown) => void; 
    config: AxiosRequestConfig 
}[] = [];

/**
 * Refresh Token API 호출 함수 (apiClient.ts 내부에서만 사용)
 */
const callRefreshTokenAPI = async (tokenInfo: TokenInfo): Promise<TokenInfo> => {
    // 순수 Axios 인스턴스를 사용하여 Interceptor 순환을 방지
    const response = await baseAxios.post<TokenInfo>('/auth/refresh', { refreshToken: tokenInfo.refreshToken });
    return response.data;
};

/**
 * 실패한 요청 큐 처리
 * @param error - 토큰 재발급 실패 시 reject할 에러 객체 (unknown으로 변경)
 * @param token - 성공 시 새로운 토큰 정보
 */
const processQueue = (error: unknown, token: TokenInfo | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            // error가 unknown 타입이므로, reject 인자도 unknown으로 설정
            prom.reject(error);
        } else if (token) {
            // 새로운 Access Token으로 헤더 업데이트 후 요청 재시도
            prom.config.headers = { ...prom.config.headers, Authorization: `Bearer ${token.accessToken}` };
            prom.resolve(apiClient(prom.config)); // apiClient 인스턴스로 요청 재시도
        }
    });
    failedQueue = [];
};

// --- Request Interceptor ---
apiClient.interceptors.request.use(
    (config) => {
        const tokenInfoStr = localStorage.getItem('tokenInfo');
        if (tokenInfoStr) {
            const tokenInfo: TokenInfo = JSON.parse(tokenInfoStr);
            if (tokenInfo.accessToken) {
                config.headers.Authorization = `Bearer ${tokenInfo.accessToken}`;
            }
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// --- Response Interceptor (핵심 로직) ---
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // 1. 401 Unauthorized 에러 감지 (토큰 만료)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // 재시도 플래그 설정
            
            const tokenInfoStr = localStorage.getItem('tokenInfo');
            const oldTokenInfo: TokenInfo | null = tokenInfoStr ? JSON.parse(tokenInfoStr) : null;

            if (!oldTokenInfo || !oldTokenInfo.refreshToken) {
                return Promise.reject(error);
            }

            // 3. Refreshing 상태가 아니라면 토큰 재발급 시작
            if (!isRefreshing) {
                isRefreshing = true;
                
                try {
                    const newToken = await callRefreshTokenAPI(oldTokenInfo);

                    localStorage.setItem('tokenInfo', JSON.stringify(newToken));
                    
                    // 재발급 성공 시, 에러는 null로 전달
                    processQueue(null, newToken); 

                    // 4. 현재 요청을 새 토큰으로 헤더 설정 후 재시도
                    if (!originalRequest.headers) {
                        originalRequest.headers = {};
                    }
                    originalRequest.headers.Authorization = `Bearer ${newToken.accessToken}`;
                    return apiClient(originalRequest);

                // catch 블록의 에러를 unknown으로 명시
                } catch (refreshError: unknown) { 
                    console.error("Refresh token is also expired. Forcing logout.", refreshError);
                    localStorage.removeItem('tokenInfo');
                    
                    // 토큰 재발급 실패 시, 큐에 쌓인 요청들을 실패 처리
                    processQueue(refreshError); 
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
            
            // 5. Refreshing 상태인 경우, 실패한 요청을 큐에 저장하고 대기
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject, config: originalRequest });
            });
        }

        return Promise.reject(error);
    }
);

// --- Post API Functions ---

// 게시글 목록 조회 및 검색 함수 (Public)
export const fetchPosts = async (
    query: string = '',
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt'
): Promise<PostPageResponse> => {
    const response = await apiClient.get('/posts', {
        params: { query, page, size, sortBy },
    });
    return response.data;
};

// 게시글 상세 조회 함수 (Public)
export const fetchPostDetail = async (id: number): Promise<PostDetailResponse> => {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data;
};

// 게시글 생성 (ADMIN Only)
export const createPost = async (data: PostCreateRequest): Promise<PostDetailResponse> => {
    const response = await apiClient.post('/posts', data);
    return response.data;
};

// 게시글 수정 (ADMIN Only)
export const updatePost = async (id: number, data: PostUpdateRequest): Promise<PostDetailResponse> => {
    const response = await apiClient.put(`/posts/${id}`, data);
    return response.data;
};

// 게시글 삭제 (ADMIN Only)
export const deletePost = async (id: number): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
};

/**
 * 1. 방명록 목록 조회 (GET /api/guestbook)
 * @param page 0-based index
 * @param size 페이지 크기
 */
export const fetchGuestbooks = async (
    page: number = 0, 
    size: number = 10
): Promise<GuestbookPageResponse> => {
    const response = await apiClient.get('/guestbook', {
        params: { page, size },
    });
    return response.data;
};

/**
 * 2. 방명록 작성 (POST /api/guestbook) - USER 권한 필요
 * @param content 방명록 내용
 * @returns 작성된 방명록 항목
 */
export const createGuestbook = async (content: string): Promise<GuestbookListResponse> => {
    // 백엔드 DTO(GuestbookCreateRequest)에 맞춰 content를 객체로 감싸 전달
    const data: GuestbookCreateRequest = { content }; 
    const response = await apiClient.post('/guestbook', data);
    return response.data;
};

/**
 * 3. 방명록 삭제 (DELETE /api/guestbook/{id}) - 작성자 또는 ADMIN 권한 필요
 * @param id 삭제할 방명록 ID
 */
export const deleteGuestbook = async (id: number): Promise<void> => {
    await apiClient.delete(`/guestbook/${id}`);
};

// --- 💡 Project API Functions ---

/**
 * 1. 프로젝트 목록 조회 (GET /api/projects)
 * @param page 0-based index
 * @param size 페이지 크기
 */
export const fetchProjects = async (
    page: number = 0, 
    size: number = 10
): Promise<ProjectPageResponse> => {
    // ProjectService는 createdAt 내림차순으로 정렬하므로 별도 sortBy 불필요
    const response = await apiClient.get('/projects', {
        params: { page, size },
    });
    return response.data;
};

/**
 * 2. 프로젝트 상세 조회 (GET /api/projects/{id})
 * @param id 프로젝트 ID
 */
export const fetchProjectDetail = async (id: number): Promise<ProjectResponse> => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
};

/**
 * 3. 프로젝트 생성 (POST /api/projects) - ADMIN Only
 * @param data 프로젝트 요청 데이터
 */
export const createProject = async (data: ProjectRequest): Promise<ProjectResponse> => {
    const response = await apiClient.post('/projects', data);
    return response.data;
};

/**
 * 4. 프로젝트 수정 (PUT /api/projects/{id}) - ADMIN Only
 * @param id 프로젝트 ID
 * @param data 프로젝트 요청 데이터
 */
export const updateProject = async (id: number, data: ProjectRequest): Promise<ProjectResponse> => {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
};

/**
 * 5. 프로젝트 삭제 (DELETE /api/projects/{id}) - ADMIN Only
 * @param id 삭제할 프로젝트 ID
 */
export const deleteProject = async (id: number): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
};

// --- 💬 Chatbot API Function ---

/**
 * 1. 챗봇 응답 조회 (POST /api/chat/query)
 * 챗봇 쿼리를 Spring Boot 서버에 전송하고 Flask RAG 서버의 응답을 받습니다.
 * @param query 사용자의 질문
 */
export const fetchChatbotResponse = async (query: string): Promise<ChatResponse> => {
    // Spring Boot의 챗봇 엔드포인트로 요청을 보냅니다.
    const response = await apiClient.post<ChatResponse>('/chat/query', { query }); 
    return response.data;
};

// 외부 노출 시 Interceptor가 적용된 apiClient와 필요한 함수들을 내보냅니다. 
// 중복 export를 제거하고 하나로 합칩니다.
export default apiClient;