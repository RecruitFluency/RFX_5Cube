import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class UniversalExceptionFilter implements ExceptionFilter {
    private readonly logger: Logger;

    constructor(private readonly httpAdapterHost: HttpAdapterHost) {
        this.logger = new Logger(UniversalExceptionFilter.name);
    }

    catch(exception: unknown, host: ArgumentsHost) {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const msg = exception?.['message'] || 'Internal Server Error';
        const isProduction = process.env.NODE_ENV === 'production';
        const payload = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            error: exception,
            msg,
        };

        this.logger.error(JSON.stringify(payload));

        if (isProduction) {
            delete payload.error;
        }

        httpAdapter.reply(response, payload, status);
    }
}
