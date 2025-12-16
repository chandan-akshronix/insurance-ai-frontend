export interface ApplicationProcess {
    id: number;
    applicationId: string;
    status: string;
    currentStep: string;
    agentData: any; // detailed AgentState
    stepHistory: AgentStep[];
    reviewReason?: string;
    assignedTo?: string;
    customerId?: number;
    startTime: string;
    lastUpdated: string;
}

export interface AgentStep {
    id: number;
    name: string;
    status: 'pending' | 'in-progress' | 'in_progress' | 'completed' | 'failed';
    timestamp?: string;
    duration?: string;
    summary?: string;
    input?: string[];
    thinking?: string[];
    confidence?: number;
    decision?: {
        outcome: string;
        reasoning?: string;
        metrics?: Metric[];
    };
}

export interface Metric {
    label: string;
    value: string;
    status: 'success' | 'warning' | 'error' | 'info';
}
