import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export abstract class AbstractService {
  protected readonly logger = new Logger(this.constructor.name);
}
