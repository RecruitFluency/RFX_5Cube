import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAthleteDto } from './dto/create-athlete.dto';
import { UpdateAthleteDto } from './dto/update-athlete.dto';
import { AthleteRepository } from './repository/athlete.repository';
import { UserEntity } from '../user/entities/user.entity';
import { Sequelize } from 'sequelize-typescript';
import { athleteDefaultInfo } from '../../libs/const/scope.const';
import { FindAttributeOptions, Includeable, Op, QueryTypes, Transaction, WhereOptions } from 'sequelize';
import { QueryAthlete } from './dto/query-athlete.dto';
import { UserService } from '../user/user.service';
import { InviteDto } from './dto/invite.dto';
import { EUserStatus } from '../../libs/enum/user-status.enum';
import { InviteFollowUpDto } from './dto/invite-follow-up.dto';
import { EUserRole } from '../../libs/enum/user-role.enum';
import { PhotoEntity } from '../photo/entity/photo.entity';
import { QueryPublicAthleteDto } from './dto/query-public-athlete.dto';
import { ClubEntity } from '../club/entities/club.entity';
import { StatTypeEnum } from '../statistics/enum/stat-type.enum';
import { AthleteEntity } from './entities/athlete.entity';
import { PostmarkService } from '../../libs/module/postmark/postmark.service';
import { RevenueCatService } from '../../libs/module/revenue-cat/revenue-cat.service';
import { queryAthletesHelper } from './helper/query-athletes.helper';
import { rowAthleteMapperHelper } from './helper/row-athlete-mapper.helper';
import { PhotoService } from '../photo/photo.service';
import { WhiteLabelEntity } from '../club/entities/white-label.entity';
import { DivisionEnum } from '../coach/enum/division.enum';
import { queryDivisionsStatsHelper } from '../coach/helper/query-divisions-stats.helper';
import { IAthleteRowImport } from './interface/athlete-row-import.interface';
import { CsvParserService } from '../../libs/module/csv-parser/csv-parser.service';
import { queryAthletesForEmailsHelper } from './helper/query-athletes-for-emails.helper';
import { getRandomIntUtil } from '../../libs/util/get-random-int.util';
import { GenderEnum } from '../../libs/enum/gender.enum';
import { uncapitalizeUtil } from '../../libs/util/uncapitalize.util';
import { buildWhitelabelEmailUtil } from '../../libs/util/build-whitelabel-email.util';
import { AttachClubDto } from './dto/attach-club.dto';

@Injectable()
export class AthleteService {
    constructor(
        private readonly athleteRepository: AthleteRepository,
        private readonly sequelize: Sequelize,
        private readonly userService: UserService,
        private readonly postmarkService: PostmarkService,
        private readonly revenueCatService: RevenueCatService,
        private readonly photoService: PhotoService,
        private readonly csvParserService: CsvParserService,
    ) {}

    async create(payload: CreateAthleteDto, user: UserEntity) {
        return this.sequelize.transaction(async (transaction) => {
            const isAthleteExist = await this.athleteRepository.findOneByOptions({
                where: { userId: user.id },
                transaction,
            });

            if (isAthleteExist) {
                throw new BadRequestException('Athlete profile for this user already exists');
            }

            if (typeof payload.fileId === 'number') {
                await this.photoService.checkIfExistsAndThrow(payload.fileId, transaction);
            }

            if (payload.customerId) {
                const isCustomerIdExists = await this.athleteRepository.count({
                    where: { customerId: payload.customerId },
                    transaction,
                });

                if (isCustomerIdExists) {
                    throw new BadRequestException(`Customer id already exists`);
                }
            }

            const athlete = await this.athleteRepository.create({ ...payload, userId: user.id });

            await this.userService.updateInternal(user.id, { athleteId: athlete.id }, transaction);

            return { success: true, id: athlete.id };
        });
    }

    async validatePayment(user: UserEntity) {
        const athlete = await this.athleteRepository.findById(user.athleteId);

        if (!athlete) {
            throw new BadRequestException(`User does not have athlete profile yet`);
        }

        if (!athlete.customerId) {
            throw new BadRequestException(`Athlete does not have customerId yet`);
        }

        const customer = await this.revenueCatService.getCustomer(athlete.customerId);

        if (!customer) {
            throw new NotFoundException("The athlete's customer id does not exist in revenue cat");
        }

        if (!customer.active_entitlements?.items?.length) {
            const entitlementFound = customer.active_entitlements.items.find(
                (item) => item.entitlement_id === RevenueCatService.entitlements.basic.id,
            );

            if (entitlementFound) {
                const expiresAt = new Date(entitlementFound.expires_at);

                await this.athleteRepository.update(
                    { where: { id: user.athleteId } },
                    { isSubscriptionActive: expiresAt < new Date() },
                );

                return { success: true, isActive: expiresAt < new Date() };
            }

            return { success: true, isActive: false };
        }
    }

    async inviteAthlete(payload: InviteDto, user: UserEntity) {
        return this.sequelize.transaction(async (transaction) => {
            if (!user.clubId) {
                throw new BadRequestException('User does not have club profile yet');
            }

            const newUser = await this.userService.createInvitedUser(
                { ...payload, clubId: user.clubId, status: EUserStatus.INVITED },
                transaction,
            );
            const athlete = await this.athleteRepository.create(
                { userId: newUser.id, clubId: user.clubId },
                { transaction },
            );

            await this.userService.updateInternal(newUser.id, { athleteId: athlete.id }, transaction);

            const whiteLabeling = buildWhitelabelEmailUtil(
                user.club?.whiteLabel,
                user.club?.file?.url,
                user.club?.isSubscriptionActive,
            );

            await this.postmarkService.sendAthleteInviteEmail(payload.email, {
                clubName: user.club.title,
                fullName: user.fullName,
                ...whiteLabeling,
            });

            return { success: true };
        });
    }

    async keepInvitation(payload: InviteFollowUpDto, user: UserEntity) {
        return this.sequelize.transaction(async (transaction) => {
            if (user.status !== EUserStatus.INVITED) {
                throw new ForbiddenException();
            }

            const result: {
                success: boolean;
                role?: EUserRole;
                status: EUserStatus;
                clubId?: number;
            } = {
                success: true,
                status: EUserStatus.ACTIVE,
            };

            if (payload.role === EUserRole.CLUB) {
                await this.userService.updateInternal(
                    user.id,
                    {
                        athleteId: null,
                        role: EUserRole.CLUB,
                        status: EUserStatus.ACTIVE,
                    },
                    transaction,
                );
                await this.athleteRepository.delete({ where: { id: user.athleteId }, transaction });

                result.role = EUserRole.CLUB;
                return result;
            }

            result.role = EUserRole.ATHLETE;

            await this.userService.updateInternal(
                user.id,
                {
                    role: EUserRole.ATHLETE,
                    clubId: null,
                    status: EUserStatus.ACTIVE,
                },
                transaction,
            );

            if (!payload.isClubMember) {
                await this.userService.updateInternal(
                    user.id,
                    {
                        role: EUserRole.ATHLETE,
                        clubId: null,
                        status: EUserStatus.ACTIVE,
                    },
                    transaction,
                );
                await this.athleteRepository.delete({ where: { id: user.athleteId }, transaction });

                return result;
            }

            result.clubId = user.clubId;

            return result;
        });
    }

    async findAll(query: QueryAthlete, user: UserEntity) {
        let clubId = null;

        if (user.role === EUserRole.CLUB) {
            clubId = user.clubId;
        } else if (query.clubId) {
            clubId = query.clubId;
        }

        const data = await this.sequelize.query(queryAthletesHelper(clubId, query), {
            type: QueryTypes.SELECT,
            replacements: {
                clubId: clubId,
                search: `%${query.q?.toLowerCase()}%`,
                subscriptionActive: query.isSubscriptionActive,
                graduationYearFrom: query.graduationYearFrom,
                graduationYearTo: query.graduationYearTo,
                gender: query.gender,
            },
            model: AthleteEntity,
        });
        const rows = data.map(rowAthleteMapperHelper);
        const include: Includeable[] = [
            {
                model: UserEntity,
                attributes: ['fullName'],
                required: true,
                where: query.q ? { fullName: { [Op.iLike]: `%${query.q.toLowerCase()}%` } } : {},
            },
        ];
        const whereAnd: WhereOptions<AthleteEntity> = [];

        if (clubId) {
            whereAnd.push({ clubId: clubId });
        }

        if (typeof query.isClubMember === 'boolean') {
            whereAnd.push({ clubId: query.isClubMember ? { [Op.ne]: null } : { [Op.eq]: null } });
        }

        if (typeof query.isSubscriptionActive === 'boolean') {
            whereAnd.push({ isSubscriptionActive: query.isSubscriptionActive });
        }

        if (query.graduationYearFrom || query.graduationYearTo) {
            const gradYearAnd = [];

            if (query.graduationYearFrom) {
                gradYearAnd.push({ [Op.gte]: query.graduationYearFrom });
            }

            if (query.graduationYearTo) {
                gradYearAnd.push({ [Op.lte]: query.graduationYearTo });
            }

            whereAnd.push({ graduationYear: { [Op.and]: gradYearAnd } });
        }

        if (query.gender) {
            whereAnd.push({ gender: query.gender });
        }

        const count = await this.athleteRepository.count({ distinct: true, where: { [Op.and]: whereAnd }, include });

        return { count, rows };
    }

    async findOne(id: number) {
        await this.checkIfExistsAndThrow(id);

        const athlete = await this.athleteRepository.findById(id, {}, athleteDefaultInfo);
        const res = athlete.dataValues;
        const divisions = await this.getAthleteStatsDistribution(id);

        return { ...res, divisions };
    }

    async findOneWithWl(id: number) {
        await this.checkIfExistsAndThrow(id);

        return await this.athleteRepository.findById(
            id,
            { include: [{ model: ClubEntity, include: [PhotoEntity, WhiteLabelEntity] }] },
            athleteDefaultInfo,
        );
    }

    async findOnePublic(id: number, query: QueryPublicAthleteDto) {
        await this.checkIfExistsAndThrow(id);

        const isAvailable = await this.checkIfStatsAvailable(id);
        const attributes: FindAttributeOptions = {
            include: [
                [
                    Sequelize.literal(
                        `(SELECT is_interested
                                FROM statistics 
                                WHERE statistics.athlete_id="AthleteEntity".id 
                                    AND statistics.type = '${StatTypeEnum.INTEREST}'
                                    AND statistics.coach_id = ${query.coachId}
                                )`,
                    ),
                    'isCoachInterested',
                ],
            ],
            exclude: ['isSubscriptionActive', 'userId', 'customerId'],
        };

        if (isAvailable) {
            attributes.include.push([
                Sequelize.literal(
                    `(SELECT COUNT(*)
                                FROM statistics 
                                WHERE statistics.athlete_id="AthleteEntity".id 
                                    AND statistics.type = '${StatTypeEnum.VIEW}'
                                )`,
                ),
                'views',
            ]);
            attributes.include.push([
                Sequelize.literal(
                    `(SELECT COUNT(*)
                                FROM statistics 
                                WHERE statistics.athlete_id="AthleteEntity".id 
                                    AND statistics.type = '${StatTypeEnum.INTEREST}'
                                    AND statistics.is_interested = true
                                )`,
                ),
                'interests',
            ]);
        }

        const athlete = await this.athleteRepository.findById(
            id,
            {
                attributes,
                include: [
                    { model: UserEntity, attributes: ['email', 'fullName'] },
                    { model: PhotoEntity, attributes: ['id', 'url'] },
                    { model: ClubEntity, include: [{ model: WhiteLabelEntity }] },
                ],
            },
            athleteDefaultInfo,
        );

        const res: Record<string, unknown> = { ...athlete.dataValues };
        res.views = +res.views;
        res.interests = +res.interests;

        if (isAvailable) {
            res.divisions = await this.getAthleteStatsDistribution(id);
            res.conversion = +(+res.interests / +res.views).toFixed(2) || 0;
        }

        return res;
    }

    async findByCustomerIds(customerIds: string[]) {
        return await this.athleteRepository.findAllByOptions({ where: { customerId: { [Op.in]: customerIds } } });
    }

    async checkIfStatsAvailable(id: number) {
        return this.athleteRepository.count({ where: { id, isStatsExposed: true } });
    }

    async update(id: number, payload: UpdateAthleteDto, user: UserEntity) {
        if (user.athleteId !== id) {
            throw new ForbiddenException();
        }

        await this.checkIfExistsAndThrow(id);

        if (typeof payload.fileId === 'number') {
            await this.photoService.checkIfExistsAndThrow(payload.fileId);
        }

        if (payload.customerId) {
            const isCustomerIdExists = await this.athleteRepository.count({
                where: { customerId: payload.customerId, id: { [Op.ne]: id } },
            });

            if (isCustomerIdExists) {
                throw new BadRequestException(`Customer id already exists`);
            }
        }

        delete payload.clubId;

        await this.athleteRepository.update({ where: { id } }, payload);

        return { success: true };
    }

    async attachClub(id: number, payload: AttachClubDto) {
        await this.checkIfExistsAndThrow(id);
        await this.athleteRepository.update({ where: { id } }, { clubId: payload.clubId });

        return { success: true };
    }

    async updateInternal(id: number, payload: UpdateAthleteDto) {
        return await this.athleteRepository.update({ where: { id } }, payload);
    }

    async bulkUpdateInternal(ids: number[], payload: UpdateAthleteDto) {
        return await this.athleteRepository.update({ where: { id: { [Op.in]: ids } } }, payload);
    }

    remove(id: number) {
        return `This action removes a #${id} athlete`;
    }

    async findAthletesForEmails(
        coachId: number,
        gender: GenderEnum,
        date: string,
        transaction?: { transaction: Transaction },
    ) {
        const where: WhereOptions = {
            id: {
                [Op.notIn]: Sequelize.literal(
                    `(
                    SELECT "athleteId" FROM "coach_to_athlete"
                    WHERE "coachId" = ${coachId} AND "date" >= '${date}'
                    )`,
                ),
            },
            gender: gender,
            isSubscriptionActive: true,
            youtubeLink: { [Op.ne]: null },
        };

        const count = await this.athleteRepository.count({
            distinct: true,
            where: where,
            include: [{ model: UserEntity, required: true, where: { status: EUserStatus.ACTIVE } }],
            ...transaction,
        });

        if (!count) {
            Logger.warn(
                `AthleteService.findAthletesForEmails: No athletes found for coachId ${coachId}, gender ${gender} since ${date}`,
            );

            return [];
        }

        const randomIndexes = this.getRandomUniqueIntegers(1, count);

        return await this.sequelize.query(queryAthletesForEmailsHelper(), {
            type: QueryTypes.SELECT,
            model: AthleteEntity,
            replacements: {
                coachId: coachId,
                date: date,
                indexes: randomIndexes,
                gender: gender,
            },
            ...transaction,
        });
    }

    async bulkUpload(file: Express.Multer.File, user: UserEntity) {
        const body = Buffer.from(file.buffer);
        const data: IAthleteRowImport[] = await this.csvParserService.readCSVString<IAthleteRowImport>(body.toString());
        const serialized: IAthleteRowImport[] = data.map((e) => {
            const row: IAthleteRowImport = { email: null };

            Object.entries(e).forEach(([key, value]) => {
                const serializedKey = uncapitalizeUtil(key).replaceAll(/\s+/g, '');
                if (serializedKey in row) {
                    row[serializedKey] = value;
                }
            });

            return row;
        });
        const { passedData, failedData } = await this.csvParserService.validateRows<IAthleteRowImport, InviteDto>(
            serialized,
            InviteDto,
            this.userService.checkIfExistsByEmail.bind(this.userService),
        );
        const result: PromiseSettledResult<Awaited<Promise<void>>>[] = await Promise.allSettled(
            passedData.map(async (athlete) => {
                await this.inviteAthlete({ email: athlete.email }, user);
            }),
        );
        const inviteFailed = [];

        result.forEach((res, i) => {
            if (res.status !== 'fulfilled') {
                inviteFailed.push({ ...passedData[i], reason: 'Failed to send invitation' });
            }
        });

        return {
            status: result.length ? (result.length === data.length ? 'Success' : 'Incomplete') : 'Failed',
            successfulRecords: result.length,
            failedData,
            inviteFailed,
        };
    }

    async checkIfExistsAndThrow(id: number) {
        const isExists = await this.athleteRepository.count({ where: { id } });

        if (!isExists) {
            throw new NotFoundException(`Athlete not found`);
        }
    }

    private async getAthleteStatsDistribution(athleteId: number) {
        const divisions = {
            [DivisionEnum.D1]: 0,
            [DivisionEnum.D2]: 0,
            [DivisionEnum.D3]: 0,
            [DivisionEnum.JUCO]: 0,
            [DivisionEnum.NAIA]: 0,
            none: 0,
        };
        const divisionQuery: { division: string | null; count: string }[] = await this.sequelize.query(
            queryDivisionsStatsHelper(),
            { type: QueryTypes.SELECT, replacements: { athleteId: athleteId } },
        );

        for (const row of divisionQuery) {
            if (row?.['division']) {
                divisions[row?.['division']] = +row?.['count'] || 0;
            } else {
                divisions.none = +row?.['count'] || 0;
            }
        }

        return divisions;
    }

    private getRandomUniqueIntegers(min: number, max: number): number[] {
        const uniqueNumbers = new Set<number>();
        const setLimit = max - min > 4 ? 5 : max - min + 1;

        while (uniqueNumbers.size < setLimit) {
            uniqueNumbers.add(getRandomIntUtil(min, max));
        }

        return [...uniqueNumbers];
    }
}
