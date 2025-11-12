import { QueryAthlete } from '../dto/query-athlete.dto';

export const queryAthletesHelper = (clubId: number, query: QueryAthlete) => {
    const dateFilterValue = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        .toISOString()
        .split('T')
        .shift();
    const searchFilter = query.q ? `u."fullName" ILIKE :search` : '';
    const clubIdFilter = clubId ? `a."clubId" = :clubId` : '';
    const clubFilter =
        typeof query.isClubMember === 'boolean' ? `a."clubId" ${query.isClubMember ? 'IS NOT NULL' : 'IS NULL'}` : '';
    const subscriptionFilter =
        typeof query.isSubscriptionActive === 'boolean' ? `a."is_subscription_active" = :subscriptionActive` : '';
    const graduationFromFilter = query.graduationYearFrom ? `a."graduationYear" >= :graduationYearFrom` : '';
    const graduationToFilter = query.graduationYearTo ? `a."graduationYear" <= :graduationYearTo` : '';
    const graduationFilter =
        graduationFromFilter || graduationToFilter
            ? `(${[graduationFromFilter, graduationToFilter].filter(Boolean).join(' AND ')})`
            : ``;
    const genderFilter = query.gender ? `a."gender" = :gender` : '';
    const filters = [searchFilter, clubIdFilter, clubFilter, subscriptionFilter, graduationFilter, genderFilter].filter(
        Boolean,
    );
    const filterQuery = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    return `
            SELECT a."id",
                   a."fileId",
                   a."createdAt",
                   a."clubId",
                   a."clubName",
                   a."state",
                   a."city",
                   a."gender",
                   a."graduationYear",
                   a."is_subscription_active"                                       AS "isSubscriptionActive",
                   a."phone",
                   u."id"       AS "user.id",
                   u."fullName" AS "user.fullName",                                            
                    u."email" AS "user.email",
                c.title      AS "club.title",
                   CAST(COUNT(CASE WHEN s.type = 'view' THEN 1 END) AS INTEGER)    AS views,
                   CAST(COUNT(CASE WHEN s.type = 'interest' AND is_interested = true THEN 1 END) AS INTEGER) AS interests,
                   CAST(COUNT(CASE WHEN s.type = 'interest' AND is_interested = false THEN 1 END) AS INTEGER) AS no_interests
            FROM athlete a
                LEFT JOIN statistics s
                ON
                    s.athlete_id = a.id
                    AND s."createdAt" >= '${dateFilterValue}'
                INNER JOIN "user" AS u ON a."userId" = u."id"
                LEFT JOIN "club" as c on a."clubId" = c.id
            ${filterQuery}
        GROUP BY a.id, a."createdAt", u."id", a."clubId", c.title, a."clubName", a."state", a."city", a."gender"
        ORDER BY a."createdAt" DESC
        LIMIT ${query.limit || 20} OFFSET ${query.offset || 0};`;
};
