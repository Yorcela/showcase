import { UowContext } from "@ports/unit-of-work/unit-of-work.port";

import { Cuid2 } from "@apptypes/cuid2.type";
import { UserEntity, UserRawForCreate } from "../../domain/entities/user.entity";

export type UserSearchParams = { search?: string; take?: number; skip?: number };

export interface UserRepoPort {
  getById(id: Cuid2, ctx?: UowContext): Promise<UserEntity | null>;
  findByEmail(email: string, ctx?: UowContext): Promise<UserEntity | null>;
  getCredentials(email: string, ctx?: UowContext): Promise<UserEntity>;
  list(params?: UserSearchParams, ctx?: UowContext): Promise<UserEntity[] | []>;
  create(data: UserRawForCreate, ctx?: UowContext): Promise<UserEntity>;
  update(data: UserEntity, ctx?: UowContext): Promise<void>;
}

export const USER_REPO_PORT = Symbol("USER_REPO_PORT");
