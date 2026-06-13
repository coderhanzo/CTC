"use client";

import { useState } from "react";

import { formatPesewasToGHS, ghsToPesewas, pesewasToGHS } from "@/src/lib/money";

export function DeliveryZoneSettings({
  zones,
}: {
  zones: Record<string, unknown>[];
}) {
  const [message, setMessage] = useState<string | null>(null);

  async function saveZone(formData: FormData) {
    setMessage(null);
    const response = await fetch("/api/dashboard/settings/delivery-zone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        zone_id: formData.get("zone_id"),
        fee_pesewas: ghsToPesewas(String(formData.get("fee_ghs") ?? "0")),
        is_active: formData.get("is_active") === "on",
      }),
    });

    setMessage(response.ok ? "Delivery zone saved." : "Save failed.");
  }

  return (
    <section className="dashboard-glass rounded-3xl p-5 sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-ctc-cream">
          Delivery Zones
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#85A3B2]">
          Update delivery fees and zone availability using the existing settings API.
        </p>
      </div>
      {message ? (
        <p className="mb-4 rounded-2xl border border-ctc-pink/25 bg-ctc-pink/10 p-3 font-label text-xs text-ctc-pink">
          {message}
        </p>
      ) : null}
      <div className="space-y-4">
        {zones.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
            <p className="text-lg font-bold text-ctc-cream">No delivery zones found</p>
            <p className="mt-2 text-sm text-[#85A3B2]">
              Zones will appear here when they exist in Supabase.
            </p>
          </div>
        ) : (
          zones.map((zone) => (
            <form action={saveZone} className="rounded-3xl border border-white/10 bg-[#142030]/45 p-4" key={String(zone.id)}>
              <input name="zone_id" type="hidden" value={String(zone.id)} />
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-ctc-cream">{String(zone.name)}</p>
                  <p className="mt-1 font-label text-xs text-[#85A3B2]">
                    Current: {formatPesewasToGHS(Number(zone.fee_pesewas ?? 0))}
                  </p>
                </div>
                <label className="flex items-center gap-2 font-label text-xs uppercase tracking-wider text-[#85A3B2]">
                  Active
                  <input name="is_active" type="checkbox" defaultChecked={Boolean(zone.is_active)} />
                </label>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  className="dashboard-field h-11 w-full rounded-full px-4 font-label text-sm"
                  name="fee_ghs"
                  min={0}
                  step="0.01"
                  type="number"
                  defaultValue={pesewasToGHS(Number(zone.fee_pesewas ?? 0))}
                />
                <button className="btn-pink h-11 rounded-full px-5 font-label text-xs font-bold uppercase tracking-[0.14em] text-[#142030]" type="submit">
                  Save
                </button>
              </div>
            </form>
          ))
        )}
      </div>
    </section>
  );
}
