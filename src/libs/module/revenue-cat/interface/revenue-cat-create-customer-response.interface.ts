export interface ICreateCustomerResponse {
    object: string;
    id: string;
    project_id: string;
    first_seen_at: number;
    last_seen_at: number;
    active_entitlements: {
        object: string;
        items: {
            object: string;
            entitlement_id: string;
            expires_at: number;
        }[];
        next_page: string;
        url: string;
    };
    experiment: {
        object: string;
        id: string;
        variant: string;
    };
    attributes: {
        object: string;
        items: {
            object: string;
            name: string;
            value: string;
            updated_at: number;
        }[];
        next_page: string;
        url: string;
    };
}
