// src/types/auth.ts

/**
 * [Request] 회원가입 요청 (POST /auth/register)
 * - 백엔드의 MemberJoinRequest.java와 일치하도록 수정
 */
export interface RegisterRequest {
    username: string; // 로그인 ID
    password: string;
    // nickname 필드 제거
}

/**
 * [Request] 로그인 요청 (POST /auth/login)
 * - 백엔드의 MemberLoginRequest.java와 일치하도록 정의
 */
export interface LoginRequest {
    username: string; // 로그인 ID
    password: string;
}


/**
 * [Response] 로그인 성공 시 반환되는 토큰 정보 (POST /auth/login, POST /auth/refresh)
 * - 백엔드의 TokenInfo.java와 일치해야 함
 */
export interface TokenInfo {
    grantType: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: number;
}

/**
 * [Request] Access Token 재발급 요청 (POST /auth/refresh)
 */
export interface TokenReissueRequest {
    accessToken: string;
    refreshToken: string;
}

// 사용자 정보 (GET /auth/me)
// 백엔드의 UserInfoResponse.java와 일치해야 함
export interface UserInfo {
    id: number;
    username: string; // 로그인 ID
    role: string; // 사용자 권한 (예: "USER", "ADMIN")
}