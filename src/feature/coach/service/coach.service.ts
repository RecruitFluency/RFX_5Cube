import { BadRequestException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { CreateCoachDto } from '../dto/create-coach.dto';
import { UpdateCoachDto } from '../dto/update-coach.dto';
import { CoachRepository } from '../repository/coach.repository';
import { PhotoEntity } from '../../photo/entity/photo.entity';
import { QueryCoachDto } from '../dto/query-coach.dto';
import { Op, QueryTypes, Transaction, WhereOptions } from 'sequelize';
import { CoachEntity } from '../entities/coach.entity';
import { writeToBuffer } from 'fast-csv';
import { DivisionEnum } from '../enum/division.enum';
import { ValidationError } from 'class-validator';
import { Sequelize } from 'sequelize-typescript';
import { queryCoachHelper } from '../helper/query-coach.helper';
import { PhotoService } from '../../photo/photo.service';
import { CsvParserService } from '../../../libs/module/csv-parser/csv-parser.service';
import { GenderEnum } from '../../../libs/enum/gender.enum';
import { uncapitalizeUtil } from '../../../libs/util/uncapitalize.util';
import { Response } from 'express';
import { DownloadCoachDto } from '../dto/download-coach.dto';
import { Readable } from 'stream';

export interface ICoachRowImport {
    email: string;
    fullName: string;
    division: DivisionEnum;
    institute: string;
    gender: GenderEnum;
    role: string;
    title: string;
    i?: number;
    errors?: Partial<ValidationError>[];
}
@Injectable()
export class CoachService {
    constructor(
        private readonly coachRepository: CoachRepository,
        private readonly sequelize: Sequelize,
        private readonly photoService: PhotoService,
        private readonly csvParserService: CsvParserService,
    ) {}

    async create(payload: CreateCoachDto) {
        const isEmailTaken = await this.coachRepository.count({ where: { email: payload.email.toLowerCase() } });

        if (isEmailTaken) {
            throw new BadRequestException(`Coach with such id already exists`);
        }

        if (typeof payload.fileId === 'number') {
            await this.photoService.checkIfExistsAndThrow(payload.fileId);
        }

        return this.coachRepository.create(payload);
    }

    async findAll(query: QueryCoachDto) {
        const whereAnd: WhereOptions<CoachEntity> = [];

        const filterLiterals: string[] = [];
        let filterLiteral = '';

        if (query.q) {
            whereAnd.push({
                [Op.or]: [
                    { fullName: { [Op.iLike]: `%${query.q}%` } },
                    { email: { [Op.iLike]: `%${query.q}%` } },
                    { institute: { [Op.iLike]: `%${query.q}%` } },
                ],
            });
            filterLiterals.push('(c."full_name" ILIKE :q OR c.email ILIKE :q OR c.institute ILIKE :q)');
        }

        if (typeof query.isDeleted === 'boolean') {
            whereAnd.push({ isDeleted: query.isDeleted });
            filterLiterals.push(`c.is_deleted = ${query.isDeleted}`);
        }

        if (query.division) {
            whereAnd.push({ division: query.division });
            filterLiterals.push(`c.division = '${query.division}'`);
        }

        if (query.gender) {
            whereAnd.push({ gender: query.gender });
            filterLiterals.push(`c.gender = '${query.gender}'`);
        }

        if (filterLiterals.length) {
            filterLiteral = `WHERE ${filterLiterals.join(' AND\n')}`;
        }

        const data = await this.sequelize.query(queryCoachHelper(query, filterLiteral), {
            type: QueryTypes.SELECT,
            model: CoachEntity,
            replacements: { q: `%${query.q}%` },
        });
        const rows = data.map((row) => ({
            id: row.id,
            email: row.email.toLowerCase(),
            fullName: row.dataValues['full_name'],
            division: row.division,
            institute: row.institute,
            gender: row.gender,
            role: row.role,
            title: row.title,
            isDeleted: row.dataValues['is_deleted'],
            fileId: row.dataValues['file_id'],
            emailsSent: +row.dataValues['emailssent'],
            file: row.dataValues['file_id']
                ? {
                      id: row.dataValues['file_id'],
                      url: `${process.env.SERVER_HOST}/api/photo/${row.dataValues['file_id']}`,
                  }
                : null,
        }));
        const count = await this.coachRepository.count({
            where: { [Op.and]: whereAnd },
        });

        return { count, rows };
    }

    async findOne(id: number) {
        await this.checkIfExistsAndThrow(id);

        return this.coachRepository.findById(id, { include: [{ model: PhotoEntity, attributes: ['id', 'url'] }] });
    }

    async update(id: number, payload: UpdateCoachDto, transaction?: Transaction) {
        await this.checkIfExistsAndThrow(id);

        if (typeof payload.fileId === 'number') {
            await this.photoService.checkIfExistsAndThrow(payload.fileId, transaction);
        }

        return this.coachRepository.update({ where: { id }, transaction }, payload);
    }

    async remove(id: number) {
        await this.checkIfExistsAndThrow(id);

        return this.coachRepository.update({ where: { id } }, { isDeleted: true });
    }

    async checkIfExistsAndThrow(id: number) {
        const isExists = await this.coachRepository.count({ where: { id } });

        if (!isExists) {
            throw new NotFoundException(`Coach not found`);
        }
    }

    async bulkUpload(file: Express.Multer.File) {
        const body = Buffer.from(file.buffer);
        const data: ICoachRowImport[] = await this.csvParserService.readCSVString<ICoachRowImport>(body.toString());
        const serialized: ICoachRowImport[] = data.map((e) => {
            const row: ICoachRowImport = {
                email: null,
                fullName: null,
                division: null,
                institute: null,
                gender: null,
                role: null,
                title: null,
            };

            Object.entries(e).forEach(([key, value]) => {
                const serializedKey = uncapitalizeUtil(key)?.replaceAll(/\s+/g, '');
                if (serializedKey in row) {
                    row[serializedKey] = value;
                }
            });

            return row;
        });
        const { passedData, failedData } = await this.csvParserService.validateRows<ICoachRowImport, CreateCoachDto>(
            serialized,
            CreateCoachDto,
            () => 0,
            true,
        );

        const result = await this.coachRepository.bulkCreate(passedData, {
            updateOnDuplicate: ['fullName', 'division', 'institute', 'role', 'title'],
        });

        return {
            status: result.length ? (result.length === data.length ? 'Success' : 'Incomplete') : 'Failed',
            successfulRecords: result.length,
            failedData,
        };
    }

    async getCsvTemplate() {
        const headers = ['email', 'fullName', 'division', 'institute', 'gender', 'role', 'title'];
        const rows: ICoachRowImport[] = [
            {
                email: 'coach1@email.com',
                fullName: 'Example First',
                division: DivisionEnum.D1,
                institute: 'Example State University',
                gender: GenderEnum.MALE,
                role: 'Role within organization',
                title: 'Title within organization',
            },
            {
                email: 'coach2@email.com',
                fullName: 'Example Second',
                division: DivisionEnum.D2,
                institute: 'Example State University',
                gender: GenderEnum.FEMALE,
                role: 'Role within organization',
                title: 'Title within organization',
            },
            {
                email: 'coach3@email.com',
                fullName: 'Example Third',
                division: DivisionEnum.D3,
                institute: 'Example State University',
                gender: GenderEnum.MALE,
                role: 'Role within organization',
                title: 'Title within organization',
            },
            {
                email: 'coach4@email.com',
                fullName: 'Example Fourth',
                division: DivisionEnum.NAIA,
                institute: 'Example State University',
                gender: GenderEnum.FEMALE,
                role: 'Role within organization',
                title: 'Title within organization',
            },
            {
                email: 'coach5@email.com',
                fullName: 'Example Fifth',
                division: DivisionEnum.JUCO,
                institute: 'Example State University',
                gender: GenderEnum.MALE,
                role: 'Role within organization',
                title: 'Title within organization',
            },
        ];
        return await writeToBuffer(rows, { headers, writeHeaders: true, includeEndRowDelimiter: false });
    }

    async download(payload: DownloadCoachDto, res: Response) {
        const where: WhereOptions = {};

        if (payload.gender) {
            where.gender = payload.gender;
        }

        if (typeof payload.isDeleted === 'boolean') {
            where.isDeleted = payload.isDeleted;
        }

        const data = await this.coachRepository.findAllByOptions({
            where,
            attributes: ['email', 'fullName', 'division', 'institute', 'gender', 'role', 'title'],
        });

        const genderPart = payload.gender ? `-${payload.gender}` : '';
        const deletedPart =
            typeof payload.isDeleted === 'boolean' ? `-${payload.isDeleted ? 'deleted' : 'not-deleted'}` : '';
        const fileName = `coach-export${genderPart}${deletedPart}-${Date.now().toString().split('T')[0]}.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        const buffer = await writeToBuffer(data, { headers: true, transform: (row: CoachEntity) => row.dataValues });
        const stream = Readable.from(buffer);

        return new StreamableFile(stream);
    }
}
