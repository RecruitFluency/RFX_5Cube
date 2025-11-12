import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

export const IsPastYear = (options?: ValidationOptions) => {
    return (object: unknown, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options,
            constraints: [options],
            validator: PastYearDecorator,
        });
    };
};

@ValidatorConstraint({ name: IsPastYear.name })
class PastYearDecorator implements ValidatorConstraintInterface {
    validate(year: number): boolean {
        return year > 999 && year <= new Date().getFullYear();
    }

    defaultMessage(): string {
        return 'foundationYear must be a 4 digit past date';
    }
}
