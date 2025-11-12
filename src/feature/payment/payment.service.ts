import { Injectable, Logger } from '@nestjs/common';
import { IPaymentWebhook } from './interface/payment-webhook.interface';
import { PaymentEventTypeEnum } from './enum/payment-event-type.enum';
import { AthleteService } from '../athlete/athlete.service';
import { ClubService } from '../club/club.service';
import { RevenueCatService } from '../../libs/module/revenue-cat/revenue-cat.service';
import { AthleteEntity } from '../athlete/entities/athlete.entity';
import { ClubEntity } from '../club/entities/club.entity';

@Injectable()
export class PaymentService {
    private readonly logger: Logger = new Logger(PaymentService.name);
    private readonly updateSubscriptionMap = new Map<
        string,
        (payload: IPaymentWebhook, isActive: boolean) => Promise<void>
    >([
        [RevenueCatService.entitlements.basic.name, this.updateAthleteSubscription.bind(this)],
        [RevenueCatService.entitlements.whiteLabeling.name, this.updateClubSubscription.bind(this)],
    ]);

    constructor(
        private readonly athleteService: AthleteService,
        private readonly clubService: ClubService,
    ) {}

    async paymentEventReceived(payload: IPaymentWebhook) {
        try {
            if (
                payload.event.type === PaymentEventTypeEnum.INITIAL_PURCHASE ||
                payload.event.type === PaymentEventTypeEnum.RENEWAL ||
                payload.event.type === PaymentEventTypeEnum.EXPIRATION
            ) {
                for (const entitlement of payload.event.entitlement_ids) {
                    const method = this.updateSubscriptionMap.get(entitlement);

                    if (!method) {
                        this.logger.warn(
                            `Unknown entitlement occurred. Entitlement ID: ${entitlement}. Customer ID: ${payload.event.app_user_id}`,
                        );
                        continue;
                    }

                    await method(payload, payload.event.type !== PaymentEventTypeEnum.EXPIRATION).catch((e) => {
                        this.logger.error(
                            `Error updating subscription status. Entitlement ID: ${entitlement}. Customer ID: ${payload.event.app_user_id}`,
                            e,
                        );
                    });
                }

                return;
            }

            if (payload.event.type === PaymentEventTypeEnum.TRANSFER) {
                const prevA = await this.tryFindAthletes(payload.event.transferred_from);
                const prevC = await this.tryFindClubs(payload.event.transferred_from);

                const newA = await this.tryFindAthletes(payload.event.transferred_to);
                const newC = await this.tryFindClubs(payload.event.transferred_to);

                if (newA.length && newC.length) {
                    this.logger.warn(
                        `PaymentService.paymentEventReceived WARN: ${payload.event.type} received for multiple customer id as transfer receivers`,
                    );

                    return;
                }

                if (newA.length && !newC.length && !prevA.length && prevC.length) {
                    this.logger.warn(
                        `PaymentService.paymentEventReceived WARN: ${payload.event.type} received for Athlete with previous Club subscription`,
                    );

                    return;
                }

                if (newC.length && !newA.length && !prevC.length && prevA.length) {
                    this.logger.warn(
                        `PaymentService.paymentEventReceived WARN: ${payload.event.type} received for Club with previous Athlete subscription`,
                    );

                    return;
                }

                if (newA.length) {
                    await this.transferAthleteSubscription(prevA, newA);

                    return;
                }

                if (newC.length) {
                    await this.transferClubSubscription(prevC, newC);

                    return;
                }
            }
        } catch (e) {
            this.logger.error(
                `PaymentService.paymentEventReceived ERROR: ${payload.event.type} ${payload.event.id} event processing failed`,
                e,
            );
        }
    }

    async tryFindAthletes(customerIds: string[]) {
        return await this.athleteService.findByCustomerIds(customerIds);
    }
    async tryFindClubs(customerIds: string[]) {
        return await this.clubService.findByCustomerIds(customerIds);
    }

    async updateAthleteSubscription(payload: IPaymentWebhook, isActive: boolean) {
        const athlete = await this.athleteService.findByCustomerIds([payload.event.app_user_id]);

        if (!athlete[0]) {
            this.logger.warn(
                `Customer ID ${payload.event.app_user_id} not found in athletes directory. Entitlement ID: ${RevenueCatService.entitlements.basic.name}`,
            );

            return;
        }

        await this.athleteService.updateInternal(athlete[0].id, { isSubscriptionActive: isActive });
    }

    async updateClubSubscription(payload: IPaymentWebhook, isActive: boolean) {
        const club = await this.clubService.findByCustomerIds([payload.event.app_user_id]);

        if (!club[0]) {
            this.logger.warn(
                `Customer ID ${payload.event.app_user_id} not found in clubs directory. Entitlement ID: ${RevenueCatService.entitlements.whiteLabeling.name}`,
            );

            return;
        }

        await this.clubService.updateInternal(club[0].id, { isSubscriptionActive: isActive });
    }

    async transferAthleteSubscription(prevAthletes: AthleteEntity[], newAthletes: AthleteEntity[]) {
        await this.athleteService.bulkUpdateInternal(
            prevAthletes.map((e) => e.id),
            { isSubscriptionActive: false },
        );
        await this.athleteService.bulkUpdateInternal(
            newAthletes.map((e) => e.id),
            { isSubscriptionActive: true },
        );
    }

    async transferClubSubscription(prevClubs: ClubEntity[], newClubs: ClubEntity[]) {
        await this.clubService.bulkUpdateInternal(
            prevClubs.map((e) => e.id),
            { isSubscriptionActive: false },
        );
        await this.clubService.bulkUpdateInternal(
            newClubs.map((e) => e.id),
            { isSubscriptionActive: true },
        );
    }
}
