import { PaymentSuccessVerifier } from "@/src/components/payment-success-verifier";

type PaymentSuccessPageProps = {
  searchParams: Promise<{ reference?: string | string[] }>;
};

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const params = await searchParams;
  // Paystack redirects with its own `reference` (and `trxref`). If our callback
  // URL also carried one, the key appears twice and Next resolves it to an
  // array — take the first value so verification gets a plain string.
  const reference = Array.isArray(params.reference)
    ? params.reference[0]
    : params.reference;

  return <PaymentSuccessVerifier reference={reference ?? ""} />;
}
