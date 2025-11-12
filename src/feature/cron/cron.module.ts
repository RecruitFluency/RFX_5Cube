import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { CoachModule } from '../coach/coach.module';

@Module({
    imports: [ScheduleModule.forRoot(), CoachModule],
    providers: [CronService],
})
export class CronModule {}
