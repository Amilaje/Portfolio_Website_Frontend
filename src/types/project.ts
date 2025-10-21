// src/types/project.ts

export interface ProjectResponse {
    id: number;
    title: string;
    summary: string; // 목록에서 사용될 요약 설명
    description: string; // 상세 내용
    skills: string; // 사용 기술 (쉼표로 구분된 문자열)
    projectLink: string | null;
    githubLink: string | null;
    imageUrl: string | null; // 썸네일/대표 이미지 URL
    startDate: string; // LocalDateTime을 문자열(ISO 8601)로 받음
    endDate: string; // LocalDateTime을 문자열(ISO 8601)로 받음
    createdAt: string;
    updatedAt: string;
}

// 프로젝트 목록 (페이징 정보 포함) 응답
export interface ProjectPageResponse {
    content: ProjectResponse[];
    totalPages: number;
    totalElements: number;
    currentPage: number; // 0-based index
    size: number;
    first: boolean;
    last: boolean;
}

// 프로젝트 생성 및 수정 요청 DTO (ADMIN 전용)
export interface ProjectRequest {
    title: string;
    summary: string;
    description: string;
    skills: string;
    projectLink?: string;
    githubLink?: string;
    imageUrl?: string;
    startDate: string; // "yyyy-MM-dd'T'HH:mm:ss" 형식
    endDate: string; // "yyyy-MM-dd'T'HH:mm:ss" 형식
}