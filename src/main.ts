import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { GlobalLoggerService } from './libs/module/logger/global-logger.service';
import { Logger, ValidationPipe } from '@nestjs/common';
import { UniversalExceptionFilter } from './libs/filter/universal-exception.filter';
import * as process from 'node:process';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const config = app.get(ConfigService);
    const port: string = config.getOrThrow('PORT');
    const origins: string[] = config.getOrThrow<string>('APP_CORS_ORIGINS').split(',');
    const nodeEnv: string = config.getOrThrow<string>('NODE_ENV');
    const httpAdapter = app.get(HttpAdapterHost);

    app.useGlobalFilters(new UniversalExceptionFilter(httpAdapter));
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useLogger(await app.resolve(GlobalLoggerService));
    app.enableShutdownHooks();
    app.setGlobalPrefix('api');
    app.enableCors({ origin: origins });

    const swaggerConfig: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
        .setTitle('Recruit Fluency API')
        .setDescription('Recruit Fluency sever API documentation')
        .setVersion('0.1')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);

    if (nodeEnv !== 'production') {
        SwaggerModule.setup('api-docs', app, document);
    }

    await app.listen(port, '0.0.0.0');
}

void bootstrap().then(() => {
    process.on('uncaughtException', (err, origin) => {
        Logger.error(`Uncaught exception: ${err}\n` + `Exception origin: ${origin}\n`);
    });

    process.on('unhandledRejection', (reason, promise) => {
        Logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
});
