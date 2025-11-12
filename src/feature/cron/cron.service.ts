import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CoachToAthleteService } from '../coach/service/coach-to-athlete.service';

@Injectable()
export class CronService {
    constructor(private readonly coachToAthleteService: CoachToAthleteService) {}

    @Cron('0 10 * * *', { timeZone: 'America/New_York' })
    athleteDistribution() {
        void this.coachToAthleteService.main();
    }
}
