import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const baseReq = { protocol: "https", headers: {} } as TrpcContext["req"];
const baseRes = { clearCookie: () => undefined } as TrpcContext["res"];

function context(user?: NonNullable<TrpcContext["user"]>): TrpcContext { return { user: user ?? null, req: baseReq, res: baseRes }; }

const baseUser = {
  passwordHash: "hashed",
  googleId: null,
  loginMethod: "password",
  avatarUrl: null,
  phone: null,
  company: null,
  address: null,
  status: "active" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("platform access boundaries", () => {
  it("rejects portal access without an authenticated user", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.portal.dashboard()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects admin dashboard access for regular users", async () => {
    const caller = appRouter.createCaller(context({ ...baseUser, id: 12, name: "Client", email: "client@example.com", role: "user" }));
    await expect(caller.admin.dashboard()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("validates project request email and description", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.requests.create({ name: "A", email: "not-an-email", projectName: "X", projectType: "Web", description: "short" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
