import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class ConsoleLoggerService implements LoggerService {
    error(message: string, ...optionalParams: unknown[]) {
        console.error(message, ...optionalParams);
    }

    log(message: string, ...optionalParams: unknown[]) {
        console.log(message, ...optionalParams);
    }

    warn(message: string, ...optionalParams: unknown[]) {
        console.warn(message, ...optionalParams);
    }
}
