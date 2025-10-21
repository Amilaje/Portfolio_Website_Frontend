import apiClient, { baseAxios } from './apiClient'; // baseAxios 추가 임포트
import type { RegisterRequest, LoginRequest, TokenInfo, UserInfo } from '../types/auth';
import type { AxiosResponse } from 'axios';

// 인증 관련 API 호출을 모아둔 서비스 파일

/**
 * 회원가입 API 호출
 * @param data - 아이디, 비밀번호
 * @returns 성공 시 200 OK (응답 본문 없음)
 */
export const registerUser = async (data: RegisterRequest): Promise<AxiosResponse<void>> => {
    // POST /api/auth/register (토큰 필요 없음 -> baseAxios 사용)
    return baseAxios.post<void>('/auth/register', data);
};

/**
 * 로그인 API 호출
 * @param data - 아이디, 비밀번호
 * @returns TokenInfo (Access Token, Refresh Token 포함)
 */
export const loginUser = async (data: LoginRequest): Promise<TokenInfo> => {
    // POST /api/auth/login (토큰 필요 없음 -> baseAxios 사용)
    const response = await baseAxios.post<TokenInfo>('/auth/login', data);
    return response.data;
};

/**
 * Refresh Token을 사용하여 새로운 Access Token과 Refresh Token을 요청
 * 이 함수는 Interceptor 내에서 사용되므로, baseAxios를 사용하여 Interceptor 순환을 방지합니다.
 * @param refreshToken Refresh Token 문자열
 * @returns 새로 발급된 TokenInfo 객체
 */
export const refreshTokenUser = async (refreshToken: string): Promise<TokenInfo> => {
    // POST /api/auth/refresh (토큰 필요 없음 -> baseAxios 사용)
    const response = await baseAxios.post<TokenInfo>('/auth/refresh', { refreshToken });
    return response.data;
};

/**
 * 사용자 정보 조회 API 호출
 * @returns UserInfo
 */
export const getUserInfo = async (): Promise<UserInfo> => {
    // GET /api/auth/me (Access Token 필요 -> apiClient 사용)
    // Access Token 만료 시 apiClient의 Interceptor가 자동으로 토큰을 재발급합니다.
    const response = await apiClient.get<UserInfo>('/auth/me');
    return response.data;
};
