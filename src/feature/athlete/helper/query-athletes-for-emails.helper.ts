import { EUserStatus } from '../../../libs/enum/user-status.enum';

export const queryAthletesForEmailsHelper = (status = EUserStatus.ACTIVE): string => `SELECT *
FROM (SELECT ROW_NUMBER() OVER (ORDER BY a."createdAt") AS row,
             a."id",
             "user"."email"                             AS "user.email",
             "user"."fullName"                          AS "user.fullName",
             a."clubName",
             a."leagueName",
             a."graduationYear",
             a."primaryPosition",
             c.title                                    AS "club.title",
             c."fileId"                                 AS "club.fileId",
             c.is_subscription_active                   AS "club.is_subscription_active",
             wl.primary_color,
             wl.accent_color,
             wl.font_color,
             wl.font_color_secondary,
             wl.input_background_color,
             wl.input_border_color
      FROM athlete AS a
               INNER JOIN "user" ON a."userId" = "user"."id" AND "user"."status" = '${status}'
               LEFT JOIN club c on c.id = a."clubId"
               LEFT JOIN white_label wl on c.white_label_id = wl.id
      WHERE a."id" NOT IN (SELECT "athleteId"
                           FROM "coach_to_athlete"
                           WHERE "coachId" = :coachId
                             AND "date" >= :date)
        AND a."is_subscription_active" = true 
        AND a.gender = :gender
        AND a."youtubeLink" is not null
      ) AS athlete
WHERE row IN (:indexes);`;
