import React, { createContext, useState, useContext, type ReactNode, useEffect, useCallback } from 'react';
import type { TokenInfo, UserInfo } from '../types/auth';
import { loginUser, getUserInfo } from '../api/authService';
import type { LoginRequest } from '../types/auth';

// 1. Context 타입 정의
interface AuthContextType {
    isAuthenticated: boolean;
    tokenInfo: TokenInfo | null;
    userInfo: UserInfo | null;
    isLoading: boolean;
    login: (request: LoginRequest) => Promise<void>;
    logout: () => void;
}

// 초기값
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Provider 컴포넌트
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // LocalStorage에서 초기 토큰 정보 로드
    const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(() => {
        const storedToken = localStorage.getItem('tokenInfo');
        return storedToken ? JSON.parse(storedToken) : null;
    });
    
    // 로딩 상태 (API 호출 중)
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    // 사용자 정보 상태
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);    
    
    // 인증 상태
    const isAuthenticated = !!tokenInfo?.accessToken;

    // 로그아웃 처리 함수 (useCallback으로 정의하여 종속성 오류 방지)
    const logout = useCallback(() => {
        setTokenInfo(null);
        setUserInfo(null);
        localStorage.removeItem('tokenInfo');
        setIsLoading(false);
    }, []); // 의존성 없음

    /**
     * 사용자 정보를 백엔드에서 가져오는 로직 (AccessToken 필요)
     * Interceptor가 Refresh Token 재발급을 처리하므로, 여기서는 최종 에러 (Refresh Token 만료)만 처리합니다.
     */
    const fetchUserInfo = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    
    try {
        const user = await getUserInfo();
        setUserInfo(user);

        // Access Token 재발급 성공 시, Interceptor가 LocalStorage를 업데이트했을 것이므로
        // context의 tokenInfo 상태를 LocalStorage와 동기화 시도
        const newTokenInfoStr = localStorage.getItem('tokenInfo');
        if (newTokenInfoStr) {
            const newTokenInfo = JSON.parse(newTokenInfoStr) as TokenInfo;
            if (tokenInfo?.refreshToken !== newTokenInfo.refreshToken) {
                setTokenInfo(newTokenInfo);
            }
        }

    } catch (error) {
        console.error("Authentication check failed. Forcing logout.", error);
        logout();
    } finally {
        setIsLoading(false);
    }
    // 🚨 [필수 수정]: userInfo 제거. 이 함수는 외부(useEffect)에서 호출되므로 userInfo 변화에 민감할 필요가 없습니다.
}, [isAuthenticated, tokenInfo, logout]); // isAuthenticated와 logout에 의존

    // [Effect 1] 토큰 정보 변경 시 LocalStorage 저장/제거 및 UserInfo 로드
    useEffect(() => {
        if (tokenInfo) {
            // 토큰 정보가 LocalStorage에 저장됩니다.
            localStorage.setItem('tokenInfo', JSON.stringify(tokenInfo));
            
            // 토큰이 생기면 사용자 정보 로드 시도
            fetchUserInfo();
        } else {
            // 토큰이 사라지면 LocalStorage와 상태 모두 초기화
            localStorage.removeItem('tokenInfo');
            setUserInfo(null);
        }
    }, [tokenInfo, fetchUserInfo]); 

    // 로그인 처리 함수: 토큰 획득 후 상태 업데이트
    const login = async (request: LoginRequest): Promise<void> => {
        setIsLoading(true);
        try {
            const token = await loginUser(request);
            setTokenInfo(token); // -> useEffect가 fetchUserInfo를 호출
        } catch (error) {
            logout(); // 로그인 실패 시 초기화 로직 (logout 재활용)
            setIsLoading(false); // 로그인 실패 시 여기서 로딩 종료
            throw error;    // 로그인 실패 에러를 상위 컴포넌트로 전달
        }
    };

    const value: AuthContextType = {
        isAuthenticated,
        tokenInfo,
        userInfo,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Custom Hook 정의 (사용 편의성)
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};