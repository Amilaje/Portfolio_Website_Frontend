// 💡 챗봇 관련 타입 정의 (types 폴더에 정의되어 있지 않다고 가정하고 임시로 여기에 정의)
// Spring Boot DTO와 Flask Pydantic Model에 맞춥니다.
export interface ChatQueryRequest {
    query: string;
}

export interface ChatResponse {
    response: string;
    latencyMs: number;
    sourceDocuments: string[];
}