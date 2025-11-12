export interface IBasePaginatedResponse<T = unknown> {
    rows: T[];
    count: number;
}
