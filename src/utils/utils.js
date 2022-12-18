export function tierRuleByAccess(accessNumber) {
    if (accessNumber < 500) return 'FMN';
    if (accessNumber >= 500 && accessNumber < 1000) return 1;
    if (accessNumber >= 1000 && accessNumber < 10000) return 2;
    if (accessNumber >= 10000 && accessNumber < 100000) return 3;
    if (accessNumber >= 100000 && accessNumber < 1000000) return 4;
    return 5;
}
