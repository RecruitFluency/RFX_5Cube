import { AthleteEntity } from '../entities/athlete.entity';

export const rowAthleteMapperHelper = (row: AthleteEntity) => ({
    id: row.id,
    fileId: row.fileId,
    photo: row.fileId
        ? {
              id: row.fileId,
              url: `${process.env.SERVER_HOST}/api/photo/${row.fileId}`,
          }
        : null,
    user: {
        id: row.dataValues['user.id'],
        fullName: row.dataValues['user.fullName'],
        email: row.dataValues['user.email'],
    },
    isSubscriptionActive: row.dataValues['isSubscriptionActive'],
    phone: row.phone,
    state: row.state,
    city: row.city,
    clubName: row.clubName,
    gender: row.gender,
    graduationYear: row.graduationYear,
    clubId: row.clubId,
    club: row.clubId ? { title: row.dataValues['club.title'] } : undefined,
    createdAt: row.createdAt,
    views: row.dataValues['views'],
    interests: row.dataValues['interests'],
    noInterests: row.dataValues['no_interests'],
});
