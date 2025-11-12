import { EPositionType } from '../../../../feature/athlete/enum/position-type.enum';

export interface IBaseTemplate {
    primaryColor: string;
    accentColor: string;
    fontColor: string;
    fontColorSecondary: string;
    inputBackgroundColor: string;
    inputBorderColor: string;
    logoUrl: string;
}

export interface IAccountDeleteTemplate extends IBaseTemplate {
    email_s: string;
}

export interface IPasswordResetCodeTemplate extends IBaseTemplate {
    code_1: string;
    code_2: string;
    code_3: string;
    code_4: string;
    code_5: string;
    code_6: string;
    fullName: string;
}

export interface IAthleteInviteTemplate extends IBaseTemplate {
    fullName: string;
    clubName: string;
}

export interface IAthleteToCoachTemplate extends IBaseTemplate {
    full_name: string;
    link: string;
    coach_lastname: string;
    position: EPositionType;
    grad_year: string;
    club_name: string;
    league: string;
    college_name: string;
}

export interface ICoachReactionTemplate extends IBaseTemplate {
    first_name: string;
}
