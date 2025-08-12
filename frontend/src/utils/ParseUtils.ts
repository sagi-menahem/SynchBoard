export const parseRouteId = (id: string | undefined, defaultValue = 0): number => {
    if (!id) {
        return defaultValue;
    }
    
    const parsed = parseInt(id, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};