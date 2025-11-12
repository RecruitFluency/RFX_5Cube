import { StatTypeEnum } from '../../statistics/enum/stat-type.enum';

export const queryDivisionsStatsHelper = () => `
    SELECT c.division, COUNT(c.id)
        FROM statistics as s
                 LEFT JOIN public.coach c ON c.id = s.coach_id
        WHERE s.athlete_id = :athleteId
          AND s.type = '${StatTypeEnum.INTEREST}'
          AND s.is_interested = true
        GROUP BY c.division;`;
