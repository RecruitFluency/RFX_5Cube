import { Injectable, Logger } from '@nestjs/common';
import { AthleteService } from '../../athlete/athlete.service';
import { CoachToAthleteRepository } from '../repository/coach-to-athlete.repository';
import { Sequelize } from 'sequelize-typescript';
import { CoachEntity } from '../entities/coach.entity';
import { Op, QueryTypes } from 'sequelize';
import { QueryEmailsDto } from '../dto/query-emails.dto';
import { AthleteEntity } from '../../athlete/entities/athlete.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { PostmarkService } from '../../../libs/module/postmark/postmark.service';
import { AxiosError } from 'axios';
import { buildWhitelabelEmailUtil } from '../../../libs/util/build-whitelabel-email.util';

@Injectable()
export class CoachToAthleteService {
    private readonly logger: Logger = new Logger(CoachToAthleteService.name);

    constructor(
        private readonly athleteService: AthleteService,
        private readonly coachToAthleteRepository: CoachToAthleteRepository,
        private readonly sequelize: Sequelize,
        private readonly postmarkService: PostmarkService,
    ) {}

    async main() {
        const limit = 100;
        const currentDate = new Date();
        const date = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1)).toISOString().split('T')[0];

        let currentTrainerBatchLength = 0;
        let offset = 0;

        try {
            do {
                const coachBatch = await this.sequelize.query<CoachEntity>(
                    `
                        SELECT coach.id, coach.email, coach.full_name as "fullName", coach.gender, institute
                        FROM coach
                                 LEFT JOIN coach_to_athlete ON coach.id = coach_to_athlete."coachId"
                        WHERE (coach_to_athlete.date > :date OR coach_to_athlete.date IS NULL)
                          AND coach.is_deleted = false
                        GROUP BY coach.id
                        LIMIT :limit
                        OFFSET :offset;
                    `,
                    { type: QueryTypes.SELECT, replacements: { date, limit, offset } },
                );

                offset += limit;
                currentTrainerBatchLength = coachBatch.length;

                for (const coach of coachBatch) {
                    await this.processCoach(coach, date);
                }
            } while (currentTrainerBatchLength !== 0);
        } catch (e) {
            this.logger.error(`CoachToAthleteService.main Error. Process terminated at offset ${offset}`, e);
        }
    }

    async findAll(query: QueryEmailsDto) {
        return this.coachToAthleteRepository.findAllPaginated(query, {
            where: query.coachId ? { coachId: query.coachId } : {},
            include: [
                {
                    model: AthleteEntity,
                    attributes: ['id'],
                    include: [
                        {
                            model: UserEntity,
                            attributes: ['email', 'fullName'],
                        },
                    ],
                },
                {
                    required: true,
                    model: CoachEntity,
                    attributes: ['email'],
                    where: query.coachEmails?.length ? { email: { [Op.in]: query.coachEmails } } : {},
                },
            ],
            order: [['date', 'DESC']],
        });
    }

    private async processCoach(coach: CoachEntity, date: string) {
        return this.sequelize.transaction(async (transaction) => {
            const transactionHost = { transaction };
            const athletes = await this.athleteService.findAthletesForEmails(
                coach.id,
                coach.gender,
                date,
                transactionHost,
            );

            const idsCreated = await Promise.all(
                athletes.map(async (athlete) => {
                    const whiteLabeling = buildWhitelabelEmailUtil(
                        {
                            primaryColor: athlete.dataValues['primary_color'],
                            accentColor: athlete.dataValues['accent_color'],
                            fontColor: athlete.dataValues['font_color'],
                            fontColorSecondary: athlete.dataValues['font_color_secondary'],
                            inputBackgroundColor: athlete.dataValues['input_background_color'],
                            inputBorderColor: athlete.dataValues['input_border_color'],
                        } as never,
                        athlete.dataValues['club.fileId']
                            ? `${process.env.SERVER_HOST}/api/photo/${athlete.dataValues['club.fileId']}`
                            : null,
                        athlete.dataValues['club.is_subscription_active'],
                    );

                    const isSent = await this.postmarkService
                        .sendAthleteToCoach(coach.email, {
                            athleteEmail: athlete.dataValues['user.email'],
                            coachLastName: coach.fullName?.split(' ').pop() || '',
                            athleteId: athlete.id,
                            coachId: coach.id,
                            athleteName: athlete.dataValues['user.fullName'],
                            clubName: athlete.dataValues['club.title'] || athlete.clubName,
                            collegeName: coach.institute,
                            league: athlete.leagueName,
                            graduationYear: athlete.graduationYear?.toString(),
                            position: athlete.primaryPosition,
                            ...whiteLabeling,
                        })
                        .catch((e: AxiosError) => {
                            this.logger.error(
                                `CoachToAthleteService.processCoach Error: Failed to send athlete(${athlete.id}, ${athlete.dataValues['user.fullName']}) email to ${coach.email}. Reason: ${e.message}`,
                            );

                            return null;
                        });

                    if (isSent) {
                        const coachToAthlete = await this.coachToAthleteRepository.create(
                            {
                                coachId: coach.id,
                                athleteId: athlete.id,
                                date: new Date(),
                            },
                            transactionHost,
                        );

                        return coachToAthlete.id;
                    }

                    return null;
                }),
            );

            return { idsCreated };
        });
    }
}
