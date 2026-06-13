import "server-only";

import { Resend } from "resend";

import { getRequiredEnv } from "@/src/lib/env";

export function createResendClient() {
  return new Resend(getRequiredEnv("RESEND_API_KEY"));
}
