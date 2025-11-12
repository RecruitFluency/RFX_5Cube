import { Injectable, LoggerService } from '@nestjs/common';
import { Logtail } from '@logtail/node';
import { ConfigService } from '@nestjs/config';
import { transformLog } from '../../util/transform-log.util';

@Injectable()
export class LogtailLoggerService implements LoggerService {
    private readonly logtail: Logtail;

    constructor(private readonly configService: ConfigService) {
        const token: string = this.configService.getOrThrow('LOGTAIL_TOKEN');

        this.logtail = new Logtail(token);
    }

    error(message: unknown, ...optionalParams: unknown[]): void {
        void this.logtail.error(transformLog(message, ...optionalParams) as never);
    }

    log(message: unknown, ...optionalParams: unknown[]): void {
        void this.logtail.log(transformLog(message, ...optionalParams) as never);
    }

    warn(message: unknown, ...optionalParams: unknown[]): void {
        void this.logtail.warn(transformLog(message, ...optionalParams) as never);
    }
}
