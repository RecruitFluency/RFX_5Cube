import { Body, Controller, Logger, Post, Headers, UnauthorizedException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ConfigService } from '@nestjs/config';
import { IPaymentWebhook } from './interface/payment-webhook.interface';

@Controller('payment')
export class PaymentController {
    private readonly token: string;
    private readonly logger: Logger = new Logger(PaymentController.name);

    constructor(
        private readonly paymentService: PaymentService,
        private readonly configService: ConfigService,
    ) {
        this.token = this.configService.getOrThrow('APP_WEBHOOK_TOKEN');
    }

    @Post()
    catchPaymentEvent(@Body() payload: IPaymentWebhook, @Headers('authorization') auth: string) {
        if (!auth) {
            throw new UnauthorizedException();
        }

        const [type, token] = auth.split(' ');

        if (type !== 'Bearer' && token !== this.token) {
            throw new UnauthorizedException();
        }

        this.logger.log(`RevenueCat WH received`, payload);

        void this.paymentService.paymentEventReceived(payload);
    }
}
