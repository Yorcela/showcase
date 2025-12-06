import { Global, Module } from "@nestjs/common";

import { PASSWORD_HASH_PORT } from "@ports/security/password-hash.port";
import { CoreConfigModule } from "@shared/modules/config/config.module";
import { PasswordHashArgon2Adapter } from "./argon2/password-hash.adapter";

@Global()
@Module({
  imports: [CoreConfigModule],
  providers: [{ provide: PASSWORD_HASH_PORT, useClass: PasswordHashArgon2Adapter }],
  exports: [PASSWORD_HASH_PORT],
})
export class SecurityModule {}
