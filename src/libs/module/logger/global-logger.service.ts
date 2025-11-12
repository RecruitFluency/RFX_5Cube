import { Inject, Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { LOGGER_TOKEN } from '../../const/inject-token.const';

@Injectable()
export class GlobalLoggerService implements LoggerService {
    constructor(@Inject(LOGGER_TOKEN) private readonly transportList: LoggerService[]) {}

    log(message: string, ...optionalParams: unknown[]) {
        this.deliver('log', message, optionalParams);
    }

    error(message: string, ...optionalParams: unknown[]) {
        this.deliver('error', message, optionalParams);
    }

    warn(message: string, ...optionalParams: unknown[]) {
        this.deliver('warn', message, optionalParams);
    }

    private deliver(level: LogLevel, message: unknown, optionList: unknown[]): void {
        this.transportList.forEach((transport: LoggerService) => {
            transport?.[level]?.call(transport, message, ...optionList);
        });
    }
}
