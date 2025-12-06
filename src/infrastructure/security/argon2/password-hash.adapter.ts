import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";

import { PasswordHashPort } from "@ports/security/password-hash.port";
import { AppConfig } from "@shared/modules/config/app.config";

@Injectable()
export class PasswordHashArgon2Adapter implements PasswordHashPort {
  constructor(private readonly appConfig: AppConfig) {}

  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: this.appConfig.getArgon2Memory(),
      timeCost: this.appConfig.getArgon2Iterations(),
      parallelism: this.appConfig.getArgon2Parallelism(),
    });
  }

  async compare(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }
}
