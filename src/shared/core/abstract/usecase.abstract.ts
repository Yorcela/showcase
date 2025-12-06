import { Logger } from "@nestjs/common";

export abstract class AbstractUseCase {
  protected readonly logger = new Logger(this.constructor.name);
}
