import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getUserById, touchLastSignedIn } from "../db";
import { getSessionTokenFromRequest, verifySessionToken } from "./session";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const token = getSessionTokenFromRequest(opts.req);
    const session = await verifySessionToken(token);
    if (session) {
      const found = await getUserById(session.userId);
      if (found) {
        user = found;
        // Fire-and-forget; don't block the request on this bookkeeping write.
        void touchLastSignedIn(found.id);
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
