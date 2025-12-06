export interface PasswordHashPort {
  hash(password: string): Promise<string>;
  compare(hash: string, password: string): Promise<boolean>;
}
export const PASSWORD_HASH_PORT = Symbol("PASSWORD_HASH_PORT");
