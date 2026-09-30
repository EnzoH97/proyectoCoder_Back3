export const pick = (source = {}, allowedKeys = []) =>
    allowedKeys.reduce((acc, key) => {
        if (source[key] !== undefined) acc[key] = source[key];
        return acc;
    }, {});
