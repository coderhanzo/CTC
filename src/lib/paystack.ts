import "server-only";

import { getOptionalEnv, getRequiredEnv } from "@/src/lib/env";

type InitializePaystackTransactionInput = {
  email: string;
  amount: number;
  reference: string;
  callback_url: string;
  metadata: Record<string, unknown>;
};

export type PaystackInitializeResponse = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type PaystackVerifyResponse = {
  status: string;
  amount: number;
  reference: string;
  paid_at: string | null;
  channel: string | null;
  currency: string;
  gateway_response: string;
};

async function paystackRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getRequiredEnv("PAYSTACK_SECRET_KEY")}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json()) as {
    status: boolean;
    message: string;
    data: T;
  };

  if (!response.ok || !payload.status) {
    throw new Error(payload.message || "Paystack request failed.");
  }

  return payload.data;
}

export async function initializePaystackTransaction(
  input: InitializePaystackTransactionInput,
) {
  return paystackRequest<PaystackInitializeResponse>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amount,
      reference: input.reference,
      callback_url: input.callback_url,
      metadata: input.metadata,
      subaccount: getRequiredEnv("PAYSTACK_SUBACCOUNT_CODE"),
      bearer: getOptionalEnv("PAYSTACK_FEE_BEARER") || "subaccount",
    }),
  });
}

export async function verifyPaystackTransaction(reference: string) {
  return paystackRequest<PaystackVerifyResponse>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}
