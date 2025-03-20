export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    enabled: boolean;
    mfaEnabled: boolean;
    roles: string[];
    createdAt: string;
    lastLoginAt?: string;
} 