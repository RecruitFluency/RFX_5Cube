import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class AppService implements OnModuleInit {
    private readonly logger: Logger = new Logger(AppService.name);

    onModuleInit(): void {
        this.logger.log(
            `#TG ${AppService.name} Initialized. #Deployment successfully finished at ${new Date().toLocaleTimeString('ru-RU', { timeZone: 'Europe/Minsk' })} (UTC+3). Await up to 30sec to containers to be switched.`,
        );
    }

    getHello(): string {
        return 'Hello World!';
    }
}
