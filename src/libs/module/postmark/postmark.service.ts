import { Injectable } from '@nestjs/common';
import { ServerClient, TemplatedMessage } from 'postmark';
import { ConfigService } from '@nestjs/config';
import {
    IAccountDeleteEmail,
    IAthleteInviteEmail,
    IAthleteToCoach,
    ICoachReaction,
    IPassResetCodeEmail,
} from './interface/email-payload.interface';
import {
    IAccountDeleteTemplate,
    IAthleteInviteTemplate,
    IAthleteToCoachTemplate,
    ICoachReactionTemplate,
    IPasswordResetCodeTemplate,
} from './interface/template-data.interface';

@Injectable()
export class PostmarkService {
    private readonly client: ServerClient;
    private readonly from: string;
    private readonly templates: Record<string, string> = {};
    private readonly athletePublicUrlBuilder = (athleteId: number, coachId: number) =>
        `https://app.recruit.soccer/coachAthletePage?id=${athleteId}&coachId=${coachId}`;

    constructor(private readonly configService: ConfigService) {
        this.client = new ServerClient(this.configService.getOrThrow('POSTMARK_API_KEY'));
        this.from = this.configService.getOrThrow('POSTMARK_FROM');
        this.templates.deleteAccount = this.configService.getOrThrow('POSTMARK_TEMPLATE_DELETE_ACCOUNT');
        this.templates.introduceAthlete = this.configService.getOrThrow('POSTMARK_TEMPLATE_INTRODUCE_ATHLETE');
        this.templates.passwordRecovery = this.configService.getOrThrow('POSTMARK_TEMPLATE_PASSWORD_RECOVERY');
        this.templates.platformInvitation = this.configService.getOrThrow('POSTMARK_TEMPLATE_PLATFORM_INVITATION');
        this.templates.coachReactionPos = this.configService.getOrThrow('POSTMARK_TEMPLATE_COACH_INTERESTED');
        this.templates.coachReactionNeg = this.configService.getOrThrow('POSTMARK_TEMPLATE_COACH_NOT_INTERESTED');
    }

    async sendPasswordResetCodeEmail(to: string, data: IPassResetCodeEmail) {
        const [code_1, code_2, code_3, code_4, code_5, code_6] = [...data.code];
        const content: IPasswordResetCodeTemplate = {
            code_1,
            code_2,
            code_3,
            code_4,
            code_5,
            code_6,
            fullName: data.fullName,
            ...data.whiteLabeling,
        };

        return await this.sendTemplateEmail(to, this.templates.passwordRecovery, content);
    }

    async sendAthleteInviteEmail(to: string, data: IAthleteInviteEmail) {
        const content: IAthleteInviteTemplate = {
            fullName: data.fullName,
            clubName: data.clubName,
            ...data.whiteLabeling,
        };

        return await this.sendTemplateEmail(to, this.templates.platformInvitation, content);
    }

    async requestAccountDelete(to: string, data: IAccountDeleteEmail) {
        const templateData: IAccountDeleteTemplate = {
            email_s: data.email,
            ...data.whiteLabeling,
        };

        return await this.sendTemplateEmail<IAccountDeleteTemplate>(to, this.templates.deleteAccount, templateData);
    }

    async sendAthleteToCoach(to: string, data: IAthleteToCoach) {
        const content: IAthleteToCoachTemplate = {
            link: this.athletePublicUrlBuilder(data.athleteId, data.coachId),
            full_name: data.athleteName,
            league: data.league,
            position: data.position,
            coach_lastname: data.coachLastName,
            club_name: data.clubName,
            college_name: data.collegeName,
            grad_year: data.graduationYear,
            ...data.whiteLabeling,
        };

        const overrideFromWith = data.athleteName
            ? `${data.athleteName?.split(' ').filter(Boolean).join('.').toLowerCase()}@recruit.soccer`
            : this.from;

        return await this.sendTemplateEmail(
            to,
            this.templates.introduceAthlete,
            content,
            overrideFromWith,
            data.athleteEmail,
        );
    }

    async sendCoachReaction(to: string, data: ICoachReaction) {
        const content: ICoachReactionTemplate = {
            first_name: data.firstName,
            ...data.whiteLabeling,
        };

        return await this.sendTemplateEmail(
            to,
            data.isInterested ? this.templates.coachReactionPos : this.templates.coachReactionNeg,
            content,
        );
    }

    private async sendTemplateEmail<T extends object>(
        to: string,
        templateId: string,
        data: T,
        overrideFromWith?: string,
        replyTo?: string,
    ) {
        if (overrideFromWith) {
            overrideFromWith = overrideFromWith?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }

        const email: TemplatedMessage = {
            From: overrideFromWith || this.from,
            ReplyTo: replyTo || this.from,
            To: to,
            TemplateAlias: templateId,
            TemplateModel: data,
        };

        return this.client.sendEmailWithTemplate(email);
    }
}
