import {
  DashboardFrame,
  DashboardTopBar,
  GlassPanel,
  StatusPill,
} from "@/src/components/dashboard-ui";
import { DeliveryZoneSettings } from "@/src/components/delivery-zone-settings";
import { requireAdmin } from "@/src/lib/auth";
import { getOptionalEnv } from "@/src/lib/env";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { supabase, user } = await requireAdmin();
  const { data: zones } = await supabase
    .from("delivery_zones")
    .select("*")
    .order("name", { ascending: true });

  return (
    <DashboardFrame active="settings">
      <DashboardTopBar
        eyebrow="Control room"
        title="Settings"
        description="Read-only platform status plus editable delivery zones backed by the existing dashboard API."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <DeliveryZoneSettings zones={zones ?? []} />
          <GlassPanel className="p-5 sm:p-6">
            <h2 className="text-2xl font-black text-ctc-cream">
              Brand / Platform
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoLine label="Brand" value="CTC / CrackTheCode" />
              <InfoLine label="Portal" value="Owner management" />
              <InfoLine label="Storefront" value="Supabase backed" />
              <InfoLine label="Checkout" value="Paystack flow" />
            </div>
          </GlassPanel>
        </div>

        <aside className="dashboard-right-panel rounded-3xl p-5 sm:p-6">
          <section>
            <p className="font-label text-xs uppercase tracking-[0.22em] text-ctc-pink">
              Owner/Admin
            </p>
            <h2 className="mt-2 text-2xl font-black text-ctc-cream">
              Account Access
            </h2>
            <div className="mt-5 space-y-3">
              <InfoLine label="Signed in as" value={user.email ?? "Authenticated admin"} />
              <InfoLine label="Owner email" value={getOptionalEnv("OWNER_EMAIL") ?? "Not configured"} />
              <InfoLine label="Support/contact" value={getOptionalEnv("OWNER_EMAIL") ?? "Not configured"} />
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-white/10 bg-[#142030]/35 p-4">
            <p className="font-label text-xs uppercase tracking-[0.22em] text-ctc-pink">
              Integration Status
            </p>
            <div className="mt-4 space-y-3">
              <StatusLine label="Paystack secret" value={Boolean(getOptionalEnv("PAYSTACK_SECRET_KEY"))} />
              <StatusLine label="Paystack subaccount" value={Boolean(getOptionalEnv("PAYSTACK_SUBACCOUNT_CODE"))} />
              <StatusLine label="Resend API key" value={Boolean(getOptionalEnv("RESEND_API_KEY"))} />
              <InfoLine label="Email sender" value={getOptionalEnv("RESEND_FROM_EMAIL") ?? "Not configured"} />
            </div>
          </section>
        </aside>
      </div>
    </DashboardFrame>
  );
}

function StatusLine({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm">
      <span className="text-[#85A3B2]">{label}</span>
      <StatusPill status={value ? "Configured" : "Missing"} />
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="font-label text-[10px] uppercase tracking-[0.18em] text-[#85A3B2]">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-bold text-ctc-cream">
        {value}
      </p>
    </div>
  );
}
