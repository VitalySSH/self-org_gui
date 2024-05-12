export function encryptPassword(unsecured: string): string {
    /** Зашифровать пароль */
    let secret = '';
    for (const char of unsecured) {
        const code: number = char.charCodeAt(0);
        secret += String.fromCharCode(code ^ 127);
    }
    return secret;
}