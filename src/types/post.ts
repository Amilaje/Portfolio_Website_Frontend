// 게시글 목록의 각 항목
export interface PostListResponse {
  id: number;
  title: string;
  authorUsername: string;
  viewCount: number;
  createdAt: string; // ISO 8601 형식 문자열
}

// 게시글 상세 정보
export interface PostDetailResponse {
  id: number;
  title: string;
  content: string;
  authorUsername: string;
  viewCount: number;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// 게시글 목록 (페이징 정보 포함) 응답
export interface PostPageResponse {
  content: PostListResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  size: number;
  first: boolean;
  last: boolean;
}

// 게시글 작성 요청 (ADMIN용)
export interface PostCreateRequest {
  title: string;
  content: string;
  fileUrl?: string;
}

// 게시글 수정 요청 (ADMIN용)
export interface PostUpdateRequest {
  title: string;
  content: string;
  fileUrl?: string;
}