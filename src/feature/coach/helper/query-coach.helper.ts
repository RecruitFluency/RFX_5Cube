import { QueryCoachDto } from '../dto/query-coach.dto';

export const queryCoachHelper = (query: QueryCoachDto, filterLiteral: string) => `
    SELECT c.id,
           c."id",
           c."email",
           c."full_name",
           c."division",
           c."institute",
           c."gender",
           c."role",
           c."title",
           c."is_deleted",
           c."file_id",
           "file"."id"                 AS "file.id",
           "file"."file"               AS "file.file",
           COUNT(cta.id) AS emailsSent
    FROM "coach" AS c
             LEFT OUTER JOIN "photo" AS "file" ON c."file_id" = "file"."id"
             LEFT OUTER JOIN "coach_to_athlete" AS cta ON c."id" = cta."coachId"
        ${filterLiteral}
    group by "file"."id",
        "file"."file",
        c.id,
        c."createdAt",
        c."email",
        c."full_name",
        c."division",
        c."institute",
        c."gender",
        c."role",
        c."title",
        c."is_deleted",
        c."file_id",
        c.id
    ORDER BY c.id DESC
    LIMIT ${query.limit || 10} OFFSET ${query.offset || 0};`;
