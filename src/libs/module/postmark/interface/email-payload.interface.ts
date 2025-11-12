import { EPositionType } from '../../../../feature/athlete/enum/position-type.enum';

export interface IBaseEmail {
    whiteLabeling: {
        primaryColor: string;
        accentColor: string;
        fontColor: string;
        fontColorSecondary: string;
        inputBackgroundColor: string;
        inputBorderColor: string;
        logoUrl: string;
    };
}

export interface IPassResetCodeEmail extends IBaseEmail {
    code: string;
    fullName: string;
}

export interface IAthleteInviteEmail extends IBaseEmail {
    fullName: string;
    clubName: string;
}

export interface IAccountDeleteEmail extends IBaseEmail {
    email: string;
}

export interface IAthleteToCoach extends IBaseEmail {
    athleteEmail: string;
    athleteId: number;
    coachId: number;
    athleteName: string;
    position: EPositionType;
    coachLastName: string;
    clubName: string;
    league: string;
    collegeName: string;
    graduationYear: string;
}

export interface ICoachReaction extends IBaseEmail {
    firstName: string;
    isInterested: boolean;
}
