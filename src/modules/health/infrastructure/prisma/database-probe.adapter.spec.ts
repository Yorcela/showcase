import { PrismaService } from "@infrastructure/orm/prisma/prisma.service";

import { PrismaDatabaseProbe } from "./database-probe.adapter";

describe("PrismaDatabaseProbe", () => {
  let prisma: jest.Mocked<Pick<PrismaService, "$queryRaw">>;
  let probe: PrismaDatabaseProbe;

  beforeEach(() => {
    prisma = {
      $queryRaw: jest.fn(),
    } as unknown as jest.Mocked<Pick<PrismaService, "$queryRaw">>;

    probe = new PrismaDatabaseProbe(prisma as unknown as PrismaService);
  });

  it("should measure response time when query succeeds", async () => {
    jest.spyOn(Date, "now").mockReturnValueOnce(1_000).mockReturnValueOnce(1_015);
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([1]);

    const result = await probe.ping();

    expect(prisma.$queryRaw).toHaveBeenCalledWith(expect.any(Object));
    expect(result).toBe(15);
  });

  it("should propagate errors from prisma", async () => {
    const error = new Error("db down");
    (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(error);

    await expect(probe.ping()).rejects.toThrow(error);
  });
});
