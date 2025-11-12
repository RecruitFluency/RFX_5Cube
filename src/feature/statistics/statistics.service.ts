import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { StatisticsRepository } from './statistics.repository';
import { StatTypeEnum } from './enum/stat-type.enum';
import { FindStatisticsDto } from './dto/find-statistics.dto';
import { Op, WhereOptions } from 'sequelize';
import { StatisticsEntity } from './entities/statistics.entity';
import { AthleteService } from '../athlete/athlete.service';
import { CoachService } from '../coach/service/coach.service';
import { UserEntity } from '../user/entities/user.entity';
import { EUserRole } from '../../libs/enum/user-role.enum';
import { CoachEntity } from '../coach/entities/coach.entity';
import { Sequelize } from 'sequelize-typescript';
import { PhotoEntity } from '../photo/entity/photo.entity';
import { photoDefaultInfo } from '../../libs/const/scope.const';
import { PostmarkService } from '../../libs/module/postmark/postmark.service';
import { buildWhitelabelEmailUtil } from '../../libs/util/build-whitelabel-email.util';
import { FindAdminStatisticsDto } from './dto/find-admin-statistics.dto';
import { IBasePaginatedResponse } from '../../libs/interface/base/base-paginated-response.interface';

@Injectable()
export class StatisticsService {
    constructor(
        private readonly statisticsRepository: StatisticsRepository,
        private readonly athleteService: AthleteService,
        private readonly coachService: CoachService,
        private readonly postmarkService: PostmarkService,
    ) {}

    async create(payload: CreateStatisticDto) {
        const athlete = await this.athleteService.findOneWithWl(payload.athleteId);

        await this.coachService.checkIfExistsAndThrow(payload.coachId);

        if (payload.type === StatTypeEnum.INTEREST) {
            const stat = await this.statisticsRepository.findOneByOptions({
                where: { coachId: payload.coachId, athleteId: payload.athleteId, type: StatTypeEnum.INTEREST },
            });

            if (stat) {
                if (stat.isInterested) {
                    throw new BadRequestException(
                        `Coach ${payload.coachId} has already interested in athlete ${payload.athleteId}`,
                    );
                }

                await this.statisticsRepository.update({ where: { id: stat.id } }, payload);
            } else {
                await this.statisticsRepository.create(payload);
            }

            if (athlete.user) {
                const whiteLabeling = buildWhitelabelEmailUtil(
                    athlete.club?.whiteLabel,
                    athlete.club?.file?.url,
                    athlete.club?.isSubscriptionActive,
                );

                await this.postmarkService.sendCoachReaction(athlete.user.email, {
                    firstName: athlete.user.fullName.split(' ').shift(),
                    isInterested: payload.isInterested,
                    ...whiteLabeling,
                });
            }
        } else {
            await this.statisticsRepository.create(payload);
        }

        return { success: true };
    }

    async finsOneByAthlete(query: FindStatisticsDto, user: UserEntity) {
        if (user.role === EUserRole.ATHLETE && query.athleteId !== user.athleteId) {
            throw new ForbiddenException();
        }

        const datesWhere = [];

        if (query.from) {
            datesWhere.push({ createdAt: { [Op.gte]: query.from } });
        }

        if (query.to) {
            datesWhere.push({ createdAt: { [Op.lte]: query.to } });
        }

        const [views, interests, topInterests] = await Promise.all([
            await this.statisticsRepository.count({
                where: { [Op.and]: [{ athleteId: query.athleteId }, { type: StatTypeEnum.VIEW }, ...datesWhere] },
            }),
            await this.statisticsRepository.count({
                where: {
                    [Op.and]: [
                        { athleteId: query.athleteId },
                        { type: StatTypeEnum.INTEREST },
                        { isInterested: true },
                        ...datesWhere,
                    ],
                },
            }),
            await this.statisticsRepository.findAllByOptions({
                where: {
                    [Op.and]: [
                        { athleteId: query.athleteId },
                        { type: StatTypeEnum.INTEREST },
                        { isInterested: true },
                        ...datesWhere,
                    ],
                },
                include: [{ model: CoachEntity, include: [PhotoEntity.scope(photoDefaultInfo)] }],
                offset: 0,
                limit: query.topInterests,
                order: [
                    [
                        Sequelize.literal(`CASE "coach".division
                        WHEN 'D1' THEN 1
                        WHEN 'D2' THEN 2
                        WHEN 'D3' THEN 3
                        WHEN 'NAIA' THEN 4
                        WHEN 'JUCO' THEN 5
                        ELSE 6
                    END`),
                        'ASC',
                    ],
                    ['createdAt', 'DESC'],
                ],
            }),
        ]);

        return { views, interests, conversion: +(interests / views || 0).toFixed(2), topInterests };
    }

    async findAll(query: FindStatisticsDto, user: UserEntity) {
        if (!user) {
            const isAvailable = await this.athleteService.checkIfStatsAvailable(query.athleteId);

            if (!isAvailable) {
                throw new BadRequestException(`Athlete ${query.athleteId} hasn't exposed their stats publicly`);
            }
        }

        const whereAnd: WhereOptions<StatisticsEntity> = [
            { type: StatTypeEnum.INTEREST },
            { isInterested: query.isInterested === null ? true : query.isInterested },
            { athleteId: query.athleteId },
        ];

        if (query.from) {
            whereAnd.push({ createdAt: { [Op.gte]: query.from } });
        }

        if (query.to) {
            whereAnd.push({ createdAt: { [Op.lte]: query.to } });
        }

        return this.statisticsRepository.findAllPaginated(query, {
            where: { [Op.and]: whereAnd },
            include: { model: CoachEntity, include: [PhotoEntity.scope(photoDefaultInfo)] },
            order: [
                [
                    Sequelize.literal(`CASE "coach".division
                        WHEN 'D1' THEN 1
                        WHEN 'D2' THEN 2
                        WHEN 'D3' THEN 3
                        WHEN 'NAIA' THEN 4
                        WHEN 'JUCO' THEN 5
                        ELSE 6
                    END`),
                    'ASC',
                ],
                ['createdAt', 'DESC'],
            ],
        });
    }

    async findAllForAdmin(query: FindAdminStatisticsDto) {
        const whereAnd: WhereOptions<StatisticsEntity> = [{ athleteId: query.athleteId }];
        const whereAndStats: WhereOptions<StatisticsEntity> = [{ athleteId: query.athleteId }];
        const whereCoach: WhereOptions<CoachEntity> = [];

        if (query.from) {
            whereAnd.push({ createdAt: { [Op.gte]: query.from } });
            whereAndStats.push({ createdAt: { [Op.gte]: query.from } });
        }

        if (query.to) {
            whereAnd.push({ createdAt: { [Op.lte]: query.to } });
            whereAndStats.push({ createdAt: { [Op.lte]: query.to } });
        }

        if (query.type) {
            whereAnd.push({ type: query.type });
        }

        if (typeof query.isInterested === 'boolean') {
            whereAnd.push({ isInterested: query.isInterested });
        }

        if (query.division) {
            whereCoach.push({ division: query.division });
        }

        const data: IBasePaginatedResponse<StatisticsEntity> = await this.statisticsRepository.findAllPaginated(query, {
            where: { [Op.and]: whereAnd },
            include: {
                model: CoachEntity,
                include: [PhotoEntity.scope(photoDefaultInfo)],
                where: whereCoach,
                required: true,
            },
            distinct: true,
        });

        const stats = await this.statisticsRepository.findOneByOptions({
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.literal("CASE WHEN type = 'view' THEN 1 END")), 'views'],
                [
                    Sequelize.fn(
                        'COUNT',
                        Sequelize.literal("CASE WHEN type = 'interest' AND is_interested = true THEN 1 END"),
                    ),
                    'interested',
                ],
                [
                    Sequelize.fn(
                        'COUNT',
                        Sequelize.literal("CASE WHEN type = 'interest' AND is_interested = false THEN 1 END"),
                    ),
                    'notInterested',
                ],
            ],
            raw: true,
            where: { [Op.and]: whereAndStats },
            include: { model: CoachEntity, attributes: [], where: whereCoach, required: true },
        });

        Object.entries(stats).forEach(([key, value]) => {
            stats[key] = +value;
        });

        return {
            ...data,
            totalStats: stats,
        };
    }
}
