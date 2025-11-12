import { RevenueCatErrorTypeEnum } from '../enum/revenue-cat-error-type.enum';

export interface IRevenueCatError {
    type: RevenueCatErrorTypeEnum;
    param: string;
    message: string;
    retryable: boolean;
    doc_url: string;
    backoff_ms: number;
}
