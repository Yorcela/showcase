import { Inject, Injectable } from "@nestjs/common";

import { PASSWORD_HASH_PORT } from "@ports/security/password-hash.port";
import { UowContext } from "@ports/unit-of-work/unit-of-work.port";

import { PasswordHashArgon2Adapter } from "@infrastructure/security/argon2/password-hash.adapter";
import { AuthLoginInvalidCredentialError } from "@modules/auth/domain/errors/login.error";
import { Cuid2 } from "@apptypes/cuid2.type";
import {
  UserEntity,
  UserRawForCreate,
  UserRole,
  UserStatus,
} from "../../domain/entities/user.entity";
import { USER_REPO_PORT, UserRepoPort } from "../ports/user.repo.port";

type ListArgs = { search?: string; take?: number; skip?: number };

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPO_PORT) private readonly repo: UserRepoPort,
    @Inject(PASSWORD_HASH_PORT) private readonly pwdHasher: PasswordHashArgon2Adapter,
  ) {}

  // READ
  getById(id: Cuid2, ctx?: UowContext): Promise<UserEntity | null> {
    return this.repo.getById(id, ctx);
  }

  getByEmail(email: string, ctx?: UowContext): Promise<UserEntity | null> {
    return this.repo.findByEmail(email, ctx);
  }

  /**
   *
   * @param email Returns user ID if credentials are correct
   * @param password
   * @param ctx
   * @returns
   */
  async checkCredentials(email: string, password: string, ctx?: UowContext): Promise<Cuid2> {
    const user: UserEntity = await this.getCredentials(email, ctx);
    const isPasswordValid = await this.comparePassword(user, password);
    if (!isPasswordValid) throw new AuthLoginInvalidCredentialError({ user });
    return user.id;
  }

  list(args: ListArgs, _ctx?: UowContext): Promise<UserEntity[]> {
    // (si besoin un repo.list(args, ctx) plus tard)
    return this.repo.list(args);
  }

  // READ and/or WRITE
  async findOrCreate(email: string, ctx?: UowContext): Promise<UserEntity> {
    let user = await this.getByEmail(email, ctx);
    if (!user) user = await this.registerByEmail(email, ctx);
    return user;
  }

  // WRITE
  async register(data: UserRawForCreate, ctx?: UowContext): Promise<UserEntity> {
    return this.repo.create(data, ctx);
  }

  async registerByEmail(email: string, ctx?: UowContext): Promise<UserEntity> {
    return this.register(
      {
        email,
        role: UserRole.USER,
        status: UserStatus.PENDING_VERIFICATION,
      },
      ctx,
    );
  }

  async activate(user: UserEntity, ctx?: UowContext): Promise<void> {
    user.activate();
    return this.repo.update(user, ctx);
  }

  private getCredentials(email: string, ctx?: UowContext): Promise<UserEntity> {
    return this.repo.getCredentials(email, ctx);
  }

  private comparePassword(user: UserEntity, password: string): Promise<boolean> {
    return user.comparePassword(password, this.pwdHasher);
  }
}
