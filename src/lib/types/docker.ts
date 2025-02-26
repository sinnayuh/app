export interface ContainerStatus {
    Id: string;
    Names: string[];
    State: string;
    Status: string;
    Created: number;
    StartedAt: string;
}

export interface ContainerConfig {
    containerId: string;
    displayName: string;
}

export interface UptimeStats {
    uptime: number;
    lastDay: number;
    lastWeek: number;
    lastMonth: number;
    history: {
        timestamp: Date;
        isOnline: boolean;
    }[];
}

export interface ServiceStatus {
    name: string;
    displayName: string;
    isOnline: boolean;
    uptime: string;
    lastChecked: string;
    stats: UptimeStats;
}
