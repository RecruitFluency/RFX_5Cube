import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { randomUUID } from 'node:crypto';
import { UserEntity } from '../../../feature/user/entities/user.entity';
import { catchError, lastValueFrom, map, Observable, retry, throwError, timer } from 'rxjs';
import { ICreateCustomerResponse } from './interface/revenue-cat-create-customer-response.interface';
import { IRevenueCatError } from './interface/revenue-cat-error.interface';
import { IGetCustomerResponse } from './interface/revenue-cat-get-customer-response.interface';

@Injectable()
export class RevenueCatService {
    static entitlements: { basic: { id: string; name: string }; whiteLabeling: { id: string; name: string } };
    private readonly retryAfterCode: number = HttpStatus.TOO_MANY_REQUESTS;
    private readonly projectId: string;
    private readonly logger: Logger = new Logger(RevenueCatService.name);
    private readonly maxRetryCount: number = 2;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.projectId = this.configService.getOrThrow('REVENUECAT_PROJECT_ID');

        const API_KEY = `Bearer ${this.configService.getOrThrow('REVENUECAT_API_KEY')}`;

        this.httpService.axiosRef.defaults.baseURL = this.configService.getOrThrow('REVENUECAT_BASE_URL');
        this.httpService.axiosRef.defaults.headers.common['Authorization'] = API_KEY;
        this.httpService.axiosRef.defaults.headers.common['Content-Type'] = 'application/json';

        RevenueCatService.entitlements = {
            basic: {
                id: this.configService.getOrThrow('REVENUECAT_BASIC_ENTITLEMENT_ID'),
                name: this.configService.getOrThrow('REVENUECAT_BASIC_ENTITLEMENT_NAME'),
            },
            whiteLabeling: {
                id: this.configService.getOrThrow('REVENUECAT_WHITE_LABEL_ENTITLEMENT_ID'),
                name: this.configService.getOrThrow('REVENUECAT_WHITE_LABEL_ENTITLEMENT_NAME'),
            },
        };
    }

    async createCustomer(user: UserEntity): Promise<ICreateCustomerResponse> {
        const path = `projects/${this.projectId}/customers`;
        const payload: { id: string; attributes: { name: string; value: string }[] } = {
            id: randomUUID(),
            attributes: [{ name: '$email', value: user.email }],
        };
        const createCustomer$ = this.httpService.post<ICreateCustomerResponse>(path, payload, {}).pipe(
            map((res) => res.data),
            retry({
                delay: (err: AxiosError<IRevenueCatError>, i) => this.retryCallback(err, i),
            }),
            catchError((err: AxiosError<IRevenueCatError>) => this.handleError(err)),
        );

        return await lastValueFrom(createCustomer$);
    }

    async getCustomer(externalId: string): Promise<IGetCustomerResponse> {
        const path = `projects/${this.projectId}/customers/${externalId}`;
        const getCustomer$ = this.httpService.get<IGetCustomerResponse>(path).pipe(
            map((res) => res.data),
            retry({
                delay: (err: AxiosError<IRevenueCatError>, i) => this.retryCallback(err, i),
            }),
            catchError((err: AxiosError<IRevenueCatError>) => this.handleError(err)),
        );

        return await lastValueFrom(getCustomer$);
    }

    private retryCallback(err: AxiosError<IRevenueCatError>, i: number): Observable<0> {
        return i >= this.maxRetryCount || !(this.retryAfterCode === err.response?.status)
            ? throwError(() => {
                  this.logger.error('RevenueCat API request failed', { err });
                  return err;
              })
            : timer(err.response.data.backoff_ms || 100);
    }

    private handleError(err: AxiosError<IRevenueCatError>): Observable<never> {
        this.logger.error('RevenueCat API request failed', {
            response: err.response.data,
        });

        return throwError(() => err);
    }
}
