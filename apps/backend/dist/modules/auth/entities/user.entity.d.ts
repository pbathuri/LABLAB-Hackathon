export declare enum UserRole {
    USER = "user",
    ADMIN = "admin"
}
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    walletAddress: string;
    role: UserRole;
    isActive: boolean;
    preferences: {
        riskTolerance: number;
        notifications: boolean;
        theme: 'light' | 'dark';
    };
    createdAt: Date;
    updatedAt: Date;
}
