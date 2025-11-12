export function transformLog(message: unknown, ...optionalParams: unknown[]) {
    return optionalParams?.length > 0
        ? {
              message,
              ...transformOptionalParams(optionalParams as never),
          }
        : message;
}

function transformOptionalParams(params: object[]) {
    if (Array.isArray(params) && params?.length > 0) {
        if (params?.length === 1) {
            return Object.prototype.toString.call(params[0]) === '[object Object]' && Object.keys(params[0]).length <= 1
                ? { ...params[0] }
                : { data: params[0] };
        }

        const object = {};
        params.forEach((value, index) => {
            object[`data${index + 1}`] = value;
        });

        return object;
    }

    return null;
}
