import * as crypto from "crypto";

import { Injectable } from "@nestjs/common";

import { HashedToken } from "@apptypes/hashed-token.type";
import { SecuredToken } from "@apptypes/secured-token.type";

@Injectable()
export class OtpGeneratorService {
  generateFullOtpCode(
    length: number = 6,
    minutes: number = 10,
  ): { code: string; token: SecuredToken; tokenHash: HashedToken; expiresAt: Date } {
    const code = this.generateOtpCode(length);
    const token = this.generateToken();
    const tokenHash = this.getHashedToken(token);
    const expiresAt = new Date(Date.now() + minutes * 60_000);
    return { code, token, tokenHash, expiresAt };
  }

  generateOtpCode(length: number = 6): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
  }

  generateHashedToken(): HashedToken {
    return this.generateToken().toLowerCase() as HashedToken;
  }

  generateToken(): SecuredToken {
    return crypto.randomBytes(32).toString("hex") as SecuredToken;
  }

  getHashedToken(token: SecuredToken): HashedToken {
    return crypto.createHash("sha256").update(token).digest("hex") as HashedToken;
  }
}
