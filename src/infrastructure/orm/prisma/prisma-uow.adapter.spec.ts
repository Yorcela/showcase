import { Prisma } from "@prisma/client";

import { PrismaUnitOfWorkAdapter } from "./prisma-uow.adapter";
import { PrismaService } from "./prisma.service";

describe("PrismaUnitOfWorkAdapter", () => {
  it("should execute callback within prisma transaction", async () => {
    const txClient = {} as Prisma.TransactionClient;
    const fn = jest.fn().mockResolvedValue("result");
    const prisma = {
      $transaction: jest.fn((callback) => callback(txClient)),
    } as unknown as PrismaService;
    const adapter = new PrismaUnitOfWorkAdapter(prisma);

    const result = await adapter.runInTransaction(fn);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith({ tx: txClient });
    expect(result).toBe("result");
  });
});
