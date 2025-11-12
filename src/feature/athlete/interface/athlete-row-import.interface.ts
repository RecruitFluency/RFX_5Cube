import { ValidationError } from 'class-validator';

export interface IAthleteRowImport {
    email: string;
    i?: number;
    errors?: Partial<ValidationError>[];
}
