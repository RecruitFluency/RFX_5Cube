import { ConsoleLogger, Logger, LoggerService, Module, OnModuleDestroy } from '@nestjs/common';
import { GlobalLoggerService } from './global-logger.service';
import { ConfigModule } from '@nestjs/config';
import { LogtailLoggerService } from './logtail-logger.service';
import * as process from 'node:process';
import { LOGGER_TOKEN } from '../../const/inject-token.const';

const transports =
    process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development'
        ? [LogtailLoggerService]
        : [ConsoleLogger];

@Module({
    imports: [ConfigModule],
    providers: [
        GlobalLoggerService,
        ...transports,
        {
            provide: LOGGER_TOKEN,
            inject: [...transports],
            useFactory: (...transports: LoggerService[]) => transports,
        },
    ],
    exports: [GlobalLoggerService],
})
export class GlobalLoggerModule implements OnModuleDestroy {
    onModuleDestroy(signal?: string) {
        const logger = new Logger('onModuleDestroy');
        logger.error(`onModuleDestroy Hook: Exit Signal ${signal}`);
    }
}
