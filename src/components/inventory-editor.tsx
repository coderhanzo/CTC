"use client";

import { useState } from "react";

type InventoryEditorProps = {
  variants: Record<string, unknown>[];
};

export function InventoryEditor({ variants }: InventoryEditorProps) {
  const [message, setMessage] = useState<string | null>(null);

  async function updateVariant(formData: FormData) {
    setMessage(null);
    const response = await fetch("/api/dashboard/inventory/update", {
      method: "POST",
      body: JSON.stringify({
        variant_id: formData.get("variant_id"),
        stock_quantity: Number(formData.get("stock_quantity")),
        low_stock_threshold: Number(formData.get("low_stock_threshold")),
        is_active: formData.get("is_active") === "on",
      }),
      headers: { "Content-Type": "application/json" },
    });

    setMessage(response.ok ? "Inventory updated." : "Inventory update failed.");
  }

  return (
    <div className="dashboard-glass rounded-3xl p-4 sm:p-6">
      {message ? (
        <p className="mb-4 rounded-2xl border border-ctc-pink/25 bg-ctc-pink/10 p-3 font-label text-xs text-ctc-pink">
          {message}
        </p>
      ) : null}
      {variants.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
          <p className="text-lg font-bold text-ctc-cream">No variants found</p>
          <p className="mt-2 text-sm text-[#85A3B2]">
            Variant-level stock will appear here when products have variants.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto xl:block">
            <table className="dashboard-table w-full min-w-[1080px] text-left text-sm">
              <thead>
                <tr className="font-label text-[11px] uppercase tracking-[0.18em] text-[#85A3B2]">
                  <th className="font-normal">Product</th>
                  <th className="font-normal">Size</th>
                  <th className="font-normal">Color</th>
                  <th className="font-normal">Stock</th>
                  <th className="font-normal">Reserved</th>
                  <th className="font-normal">Sold</th>
                  <th className="font-normal">Threshold</th>
                  <th className="font-normal">Status</th>
                  <th className="font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => {
                  const product = variant.products as { name?: string } | null;
                  const available =
                    Number(variant.stock_quantity ?? 0) -
                    Number(variant.reserved_quantity ?? 0);
                  const isLow =
                    available <= Number(variant.low_stock_threshold ?? 5);
                  const formId = `variant-row-${variant.id}`;

                  return (
                    <tr
                      className={isLow ? "shadow-[0_0_0_1px_rgba(255,92,141,0.18)]" : ""}
                      key={String(variant.id)}
                    >
                      <td>
                        <p className="font-bold text-ctc-cream">
                          {product?.name ?? "Product"}
                        </p>
                        {isLow ? (
                          <p className="mt-1 font-label text-[10px] uppercase tracking-wider text-ctc-pink">
                            Low stock: {available} available
                          </p>
                        ) : null}
                      </td>
                      <td>{String(variant.size ?? "")}</td>
                      <td>{String(variant.color ?? "-")}</td>
                      <td>
                        <input className={numberInputClass} form={formId} min={0} name="stock_quantity" type="number" defaultValue={Number(variant.stock_quantity ?? 0)} />
                      </td>
                      <td>{Number(variant.reserved_quantity ?? 0)}</td>
                      <td>{Number(variant.sold_quantity ?? 0)}</td>
                      <td>
                        <input className={numberInputClass} form={formId} min={0} name="low_stock_threshold" type="number" defaultValue={Number(variant.low_stock_threshold ?? 5)} />
                      </td>
                      <td>
                        <label className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-wider text-[#85A3B2]">
                          <input form={formId} name="is_active" type="checkbox" defaultChecked={Boolean(variant.is_active)} />
                          {Boolean(variant.is_active) ? "Active" : "Inactive"}
                        </label>
                      </td>
                      <td>
                        <form action={updateVariant} id={formId}>
                          <input name="variant_id" type="hidden" value={String(variant.id)} />
                          <button className="btn-pink h-10 rounded-full px-4 font-label text-xs font-bold uppercase tracking-[0.14em] text-[#142030]" type="submit">
                            Update
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 xl:hidden">
            {variants.map((variant) => {
              const product = variant.products as { name?: string } | null;
              const available =
                Number(variant.stock_quantity ?? 0) -
                Number(variant.reserved_quantity ?? 0);
              const isLow =
                available <= Number(variant.low_stock_threshold ?? 5);

              return (
                <form
                  action={updateVariant}
                  className={`rounded-3xl border p-4 ${
                    isLow
                      ? "border-ctc-pink/30 bg-ctc-pink/10 shadow-[0_0_28px_rgba(255,92,141,0.12)]"
                      : "border-white/10 bg-[#142030]/45"
                  }`}
                  key={String(variant.id)}
                >
                  <input name="variant_id" type="hidden" value={String(variant.id)} />
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-black text-ctc-cream">
                        {product?.name ?? "Product"}
                      </h2>
                      <p className="mt-1 font-label text-xs uppercase tracking-wider text-[#85A3B2]">
                        {String(variant.size ?? "")} / {String(variant.color ?? "-")}
                      </p>
                    </div>
                    <span className={isLow ? "font-label text-xs uppercase text-ctc-pink" : "font-label text-xs uppercase text-[#85A3B2]"}>
                      {available} available
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <LabelValue label="Reserved" value={String(Number(variant.reserved_quantity ?? 0))} />
                    <LabelValue label="Sold" value={String(Number(variant.sold_quantity ?? 0))} />
                    <label className="space-y-2">
                      <span className="font-label text-[10px] uppercase tracking-wider text-[#85A3B2]">Stock</span>
                      <input className="dashboard-field h-11 w-full rounded-full px-3 font-label text-sm" min={0} name="stock_quantity" type="number" defaultValue={Number(variant.stock_quantity ?? 0)} />
                    </label>
                    <label className="space-y-2">
                      <span className="font-label text-[10px] uppercase tracking-wider text-[#85A3B2]">Threshold</span>
                      <input className="dashboard-field h-11 w-full rounded-full px-3 font-label text-sm" min={0} name="low_stock_threshold" type="number" defaultValue={Number(variant.low_stock_threshold ?? 5)} />
                    </label>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <label className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-wider text-[#85A3B2]">
                      <input name="is_active" type="checkbox" defaultChecked={Boolean(variant.is_active)} />
                      Active
                    </label>
                    <button className="btn-pink h-10 rounded-full px-4 font-label text-xs font-bold uppercase tracking-[0.14em] text-[#142030]" type="submit">
                      Update
                    </button>
                  </div>
                </form>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const numberInputClass =
  "dashboard-field h-10 w-24 rounded-full px-3 font-label text-sm";

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="font-label text-[10px] uppercase tracking-wider text-[#85A3B2]">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-ctc-cream">{value}</p>
    </div>
  );
}
