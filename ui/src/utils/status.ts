export const getStatusClass = (status: string): string => {
    const statusMap: Record<string, string> = {
        "OK": "status-success",
        "MISSING": "status-info",
        "DOWNTIME": "status-neutral",
        "WARNING": "status-warning",
        "UNKNOWN": "status-unknown",
        "CRITICAL": "status-error"
    }
    return statusMap[status] ?? "status status-neutral status-lg";
}