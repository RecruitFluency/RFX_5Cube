export const uncapitalizeUtil = (input: string) => {
    if (!input) {
        return null;
    }

    return input.charAt(0).toLowerCase() + input.slice(1);
};
