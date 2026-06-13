"use client";

import { useState } from "react";

export function OrderStatusEditor({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [value, setValue] = useState(status);
  const [isSaving, setIsSaving] = useState(false);

  async function updateStatus(nextStatus: string) {
    setValue(nextStatus);
    setIsSaving(true);
    await fetch("/api/dashboard/orders/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, order_status: nextStatus }),
    });
    setIsSaving(false);
  }

  return (
    <select
      className="dashboard-field h-10 rounded-full px-3 font-label text-xs uppercase tracking-wider disabled:opacity-60"
      disabled={isSaving}
      onChange={(event) => updateStatus(event.target.value)}
      value={value}
    >
      <option value="pending">Pending</option>
      <option value="processing">Processing</option>
      <option value="delivered">Delivered</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}
