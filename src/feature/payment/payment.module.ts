import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { AthleteModule } from '../athlete/athlete.module';
import { ClubModule } from '../club/club.module';

@Module({
    imports: [AthleteModule, ClubModule],
    controllers: [PaymentController],
    providers: [PaymentService],
})
export class PaymentModule {}
