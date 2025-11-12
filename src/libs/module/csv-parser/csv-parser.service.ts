import { BadRequestException, Injectable } from '@nestjs/common';
import { parseString } from 'fast-csv';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GenderEnum } from '../../enum/gender.enum';

@Injectable()
export class CsvParserService {
    readCSVString<T>(csvString: string): Promise<T[]> {
        return new Promise((resolve, reject) => {
            const data: T[] = [];

            try {
                parseString(csvString, { headers: true })
                    .on('error', reject)
                    .on('data', (parsedRow) => {
                        data.push(parsedRow);
                    })
                    .on('end', () => {
                        resolve(data);
                    });
            } catch (e) {
                throw new BadRequestException('CSV file read attempt failed', e);
            }
        });
    }

    async validateRows<T extends { email: string; gender?: GenderEnum }, M extends object>(
        data: T[],
        dto: ClassConstructor<M>,
        validator: (email: string) => Promise<number> | number,
        regardGender = false,
    ) {
        const passedData: T[] = [];
        const failedData: T[] = [];
        const existingEmails = new Set<string>();
        const existingMales = new Set<string>();
        const existingFemales = new Set<string>();

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const test = plainToInstance(dto, row);
            const errors = await validate(test);

            let emailDuplicate = false;
            let isDuplicateFromDB = false;

            if (row.email) {
                if (row.gender && regardGender) {
                    if (row.gender === GenderEnum.FEMALE) {
                        if (existingFemales.has(row.email.toLowerCase())) {
                            emailDuplicate = true;
                            isDuplicateFromDB = false;
                        } else {
                            existingFemales.add(row.email.toLowerCase());
                        }
                    }
                    if (row.gender === GenderEnum.MALE) {
                        if (existingMales.has(row.email.toLowerCase())) {
                            emailDuplicate = true;
                            isDuplicateFromDB = false;
                        } else {
                            existingMales.add(row.email.toLowerCase());
                        }
                    }
                } else {
                    if (existingEmails.has(row.email.toLowerCase())) {
                        emailDuplicate = true;
                        isDuplicateFromDB = false;
                    } else if (await validator(row.email)) {
                        emailDuplicate = true;
                        isDuplicateFromDB = true;
                    } else {
                        existingEmails.add(row.email.toLowerCase());
                    }
                }
            }

            if (emailDuplicate) {
                const err = errors.find((e) => e.property === 'email');

                if (err) {
                    err.constraints.isDuplicate = `email already exists in ${isDuplicateFromDB ? 'the system' : 'the CSV file'}`;
                } else {
                    errors.push({
                        value: row.email,
                        property: 'email',
                        constraints: {
                            isDuplicate: `email already exists in ${isDuplicateFromDB ? 'the system' : 'the CSV file'}`,
                        },
                    });
                }
            }

            if (errors?.length) {
                failedData.push({
                    i: i + 1,
                    ...row,
                    errors: errors.map((e) => ({ constraints: e.constraints, value: e.value })),
                });
            } else {
                if (row.email) {
                    row.email = row.email.toLowerCase();
                }

                passedData.push({ ...row, isDeleted: false });
            }
        }

        return { passedData, failedData };
    }
}
