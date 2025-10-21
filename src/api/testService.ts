import apiClient from './apiClient';

/**
 * 사용자 권한 필요 API 테스트 호출 (GET /api/test/user)
 * 로그인된 사용자(USER 권한 이상)만 접근 가능해야 함
 */
export const testUserAccess = async (): Promise<string> => {
    // Access Token이 인터셉터를 통해 자동으로 헤더에 추가되어야 함
    const response = await apiClient.get<string>('/test/user');
    // 백엔드는 간단한 문자열 응답을 가정함 (예: "Hello, User!")
    return response.data;
};