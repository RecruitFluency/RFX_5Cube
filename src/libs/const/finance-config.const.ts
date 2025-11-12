import { EFinance } from '../../feature/athlete/enum/finance.enum';

export const financeConfig: Record<EFinance, { min: number; max: number }> = {
    [EFinance.UNTIL_5]: { min: 0, max: 4_999 },
    [EFinance.UNTIL_10]: { min: 5_000, max: 9_999 },
    [EFinance.UNTIL_20]: { min: 10_000, max: 19_999 },
    [EFinance.UNTIL_30]: { min: 20_000, max: 29_999 },
    [EFinance.UNTIL_40]: { min: 30_000, max: 39_999 },
    [EFinance.MAX]: { min: 50_000, max: Number.MAX_SAFE_INTEGER },
};
