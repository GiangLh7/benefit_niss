export interface RecoverPasswordRequest {
    Niss?: string;
    Email: string;
}

export interface RecoverSetPasswordRequest {
    Token: string;
    Username: string;
    Password: string;
    ConfirmPassword: string;
    UsernameChange: boolean;
}