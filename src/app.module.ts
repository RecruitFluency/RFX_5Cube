import { Logger, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './feature/auth/auth.module';
import { UserModule } from './feature/user/user.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { GlobalLoggerModule } from './libs/module/logger/global-logger.module';
import { AthleteModule } from './feature/athlete/athlete.module';
import { CoachModule } from './feature/coach/coach.module';
import { ClubModule } from './feature/club/club.module';
import { PhotoModule } from './feature/photo/photo.module';
import { LoggerMiddleware } from './libs/middleware/logger.middleware';
import { StatisticsModule } from './feature/statistics/statistics.module';
import { PaymentModule } from './feature/payment/payment.module';
import { CronModule } from './feature/cron/cron.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            expandVariables: true,
        }),
        AuthModule,
        UserModule,
        SequelizeModule.forRootAsync({
            inject: [ConfigService],
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                dialect: 'postgres',
                host: config.getOrThrow('POSTGRES_HOST'),
                port: +config.getOrThrow('POSTGRES_PORT'),
                username: config.getOrThrow('POSTGRES_USER'),
                password: config.getOrThrow('POSTGRES_PASSWORD'),
                database: config.getOrThrow('POSTGRES_DB'),
                autoLoadModels: config.getOrThrow('POSTGRES_AUTOLOAD_MODELS') === 'true',
                synchronize: config.getOrThrow('POSTGRES_SYNCHRONIZE') === 'true',
                logging:
                    config.getOrThrow('POSTGRES_LOGGING') === 'true'
                        ? (sql) => {
                              Logger.log(`SQL: ${sql}`);
                          }
                        : false,
                ...(['development', 'production'].includes(config.getOrThrow('NODE_ENV'))
                    ? {
                          ssl: true,
                          dialectOptions: {
                              ssl: {
                                  ca: config.getOrThrow<string>('POSTGRES_CA'),
                              },
                          },
                      }
                    : {}),
                retryAttempts: 0,
            }),
        }),
        GlobalLoggerModule,
        AthleteModule,
        CoachModule,
        ClubModule,
        PhotoModule,
        StatisticsModule,
        PaymentModule,
        CronModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}
