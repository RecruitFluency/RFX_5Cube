import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly logger: Logger;
    private readonly keysBlackList: string[] = ['password', 'code', 'oldPassword'];
    private readonly nodeEnv: string;

    constructor(private readonly configService: ConfigService) {
        this.logger = new Logger(LoggerMiddleware.name);
        this.nodeEnv = this.configService.getOrThrow('NODE_ENV');
    }

    use(req: Request, _res: Response, next: NextFunction) {
        const logBody: Request = req.body ? JSON.parse(JSON.stringify(req.body)) : {};

        if (this.nodeEnv === 'production') {
            if (logBody && typeof logBody === 'object') {
                this.keysBlackList.forEach((key) => {
                    if (logBody?.[key]) {
                        logBody[key] = 'sanitized';
                    }
                });
            }
        }

        this.logger.log(`HTTP request`, {
            body: logBody,
            path: req.originalUrl,
            method: req.method,
        });

        if (next) {
            next();
        }
    }
}
