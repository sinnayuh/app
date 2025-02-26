export interface ContainerStatus {
    Id: string;
    Names: string[];
    State: string;
    Status: string;
    Created: number;
    StartedAt: string;
}

export interface ServiceStatus {
    name: string;
    isOnline: boolean;
    uptime: string;
    lastChecked: string;
}
