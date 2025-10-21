// src/types/guestbook.ts

// Guestbook 항목 하나의 데이터 구조
export interface GuestbookListResponse {
    id: number;
    content: string;
    authorUsername: string;
    imageUrl: string | null;
    createdAt: string; // ISO 8601 string
}

// 방명록 목록의 페이지네이션 응답 구조 (백엔드의 GuestbookPageResponse와 일치)
export interface GuestbookPageResponse {
    content: GuestbookListResponse[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
    size: number;
    first: boolean;
    last: boolean;
}

// 방명록 작성 요청 데이터 구조 (백엔드의 GuestbookCreateRequest와 일치)
export interface GuestbookCreateRequest {
    content: string;
    imageUrl?: string; // 현재는 사용하지 않지만, DTO에 맞춰 정의
}
