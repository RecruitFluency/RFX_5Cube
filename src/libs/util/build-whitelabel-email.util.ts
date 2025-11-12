import { IBaseEmail } from '../module/postmark/interface/email-payload.interface';
import { WhiteLabelEntity } from '../../feature/club/entities/white-label.entity';
import { whiteLabelDefaultConst } from '../const/white-label-default.const';

export const buildWhitelabelEmailUtil = (
    wl: WhiteLabelEntity | null,
    clubLogo: string,
    isClubSubscribed: boolean,
): IBaseEmail => {
    if (!isClubSubscribed || !wl) {
        return {
            whiteLabeling: whiteLabelDefaultConst,
        };
    }

    return {
        whiteLabeling: {
            primaryColor: wl.primaryColor || whiteLabelDefaultConst.primaryColor,
            accentColor: wl.accentColor || whiteLabelDefaultConst.accentColor,
            fontColor: wl.fontColor || whiteLabelDefaultConst.fontColor,
            fontColorSecondary: wl.fontColorSecondary || whiteLabelDefaultConst.fontColorSecondary,
            inputBackgroundColor: wl.inputBackgroundColor || whiteLabelDefaultConst.inputBackgroundColor,
            inputBorderColor: wl.inputBorderColor || whiteLabelDefaultConst.inputBorderColor,
            logoUrl: clubLogo || whiteLabelDefaultConst.logoUrl,
        },
    };
};
