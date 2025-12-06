import { UserResponsePayloadDto } from "@shared/presenters/dto/user.response.dto";
import { UserEntity } from "../../domain/entities/user.entity";
import { SwaggerUser } from "../swagger/user.decorator.swagger";

export class UsersMePayloadDto {
  @SwaggerUser()
  user!: UserResponsePayloadDto;
  constructor(user: UserResponsePayloadDto) {
    this.user = user;
  }
  static of(user: UserResponsePayloadDto): UsersMePayloadDto {
    return new UsersMePayloadDto(user);
  }
  static fromEntity(entity: UserEntity): UsersMePayloadDto {
    return UsersMePayloadDto.of(UserResponsePayloadDto.fromEntity(entity));
  }
}
