import { PaymentEventTypeEnum } from '../enum/payment-event-type.enum';

export interface IPaymentWebhook {
    api_version: string;
    event: IEvent;
}

export interface IEvent {
    aliases: string[];
    app_id: string;
    app_user_id: string;
    commission_percentage: number;
    country_code: string;
    currency: string;
    entitlement_ids: string[];
    environment: string;
    event_timestamp_ms: number;
    expiration_at_ms: number;
    id: string;
    is_family_share: boolean;
    original_app_user_id: string;
    original_transaction_id: string;
    period_type: string;
    presented_offering_id: string;
    price: number;
    price_in_purchased_currency: number;
    product_id: string;
    purchased_at_ms: number;
    renewal_number: number;
    store: string;
    subscriber_attributes: ISubscriberAttributes;
    takehome_percentage: number;
    tax_percentage: number;
    transaction_id: string;
    type: PaymentEventTypeEnum;
}

export interface IEvent {
    app_id: string;
    environment: string;
    event_timestamp_ms: number;
    id: string;
    store: string;
    subscriber_attributes: {};
    transferred_from: string[];
    transferred_to: string[];
    type: PaymentEventTypeEnum;
}

export interface ISubscriberAttributes {}
