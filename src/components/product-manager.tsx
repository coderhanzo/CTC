"use client";

import Image from "next/image";
import { useState } from "react";

import { formatPesewasToGHS } from "@/src/lib/money";

export function ProductManager({
  products,
}: {
  products: Record<string, unknown>[];
}) {
  const [message, setMessage] = useState<string | null>(null);

  async function saveProduct(formData: FormData) {
    setMessage(null);
    const response = await fetch("/api/dashboard/products/upsert", {
      method: "POST",
      body: formData,
    });
    const payload = await response.json();
    setMessage(response.ok ? "Product saved." : payload.error || "Save failed.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="dashboard-glass rounded-3xl p-5 sm:p-6">
        <h2 className="mb-2 text-2xl font-black text-ctc-cream">
          Add / Edit Product
        </h2>
        <p className="mb-6 text-sm leading-6 text-[#85A3B2]">
          Create a new drop or update product details without changing store integrations.
        </p>
        <form action={saveProduct} className="space-y-4">
          <input name="product_id" type="hidden" />
          <Field label="Name" name="name" />
          <Field label="Slug" name="slug" />
          <Field label="Category" name="category" />
          <label className="block space-y-2">
            <span className="font-label text-xs uppercase tracking-wider text-[#85A3B2]">Description</span>
            <textarea className="dashboard-field h-28 w-full resize-none rounded-2xl px-4 py-3 text-sm" name="description" />
          </label>
          <Field label="Base Price (GHS)" name="base_price_ghs" type="number" />
          <label className="block space-y-2">
            <span className="font-label text-xs uppercase tracking-wider text-[#85A3B2]">Status</span>
            <select className="dashboard-field h-12 w-full rounded-full px-4 text-sm" name="status" defaultValue="active">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="block space-y-2">
            <span className="font-label text-xs uppercase tracking-wider text-[#85A3B2]">Featured Image</span>
            <input className="dashboard-field w-full rounded-2xl px-4 py-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-ctc-pink file:px-3 file:py-1.5 file:font-label file:text-xs file:font-bold file:uppercase file:text-[#142030]" name="image" type="file" accept="image/*" />
          </label>
          {message ? (
            <p className="rounded-2xl border border-ctc-pink/25 bg-ctc-pink/10 p-3 font-label text-xs text-ctc-pink">
              {message}
            </p>
          ) : null}
          <button className="btn-pink h-12 w-full rounded-full font-label text-xs font-bold uppercase tracking-[0.18em] text-[#142030]" type="submit">
            Save Product
          </button>
        </form>
      </section>
      <section className="space-y-4">
        {products.length === 0 ? (
          <div className="dashboard-glass rounded-3xl p-8 text-center">
            <p className="text-lg font-bold text-ctc-cream">No products found</p>
            <p className="mt-2 text-sm text-[#85A3B2]">
              Add the first product to start building the catalog.
            </p>
          </div>
        ) : (
          products.map((product) => (
            <ProductRow
              key={String(product.id)}
              product={product}
              saveProduct={saveProduct}
            />
          ))
        )}
      </section>
    </div>
  );
}

function ProductRow({
  product,
  saveProduct,
}: {
  product: Record<string, unknown>;
  saveProduct: (formData: FormData) => Promise<void>;
}) {
  const variants = Array.isArray(product.product_variants)
    ? (product.product_variants as Record<string, unknown>[])
    : [];
  const totalStock = variants.reduce(
    (sum, variant) => sum + Number(variant.stock_quantity ?? 0),
    0,
  );
  const reserved = variants.reduce(
    (sum, variant) => sum + Number(variant.reserved_quantity ?? 0),
    0,
  );
  const activeVariants = variants.filter((variant) =>
    Boolean(variant.is_active),
  ).length;

  return (
    <form
      action={saveProduct}
      className="dashboard-glass grid gap-5 rounded-3xl p-4 md:grid-cols-[112px_minmax(0,1fr)] xl:grid-cols-[128px_minmax(0,1fr)_170px]"
    >
              <input name="product_id" type="hidden" value={String(product.id)} />
      <div className="relative aspect-square w-full overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#142030]/55 md:size-28 xl:size-32">
        {product.featured_image_url ? (
          <Image
            alt={String(product.name)}
            className="object-cover"
            fill
            sizes="128px"
            src={String(product.featured_image_url)}
          />
        ) : (
          <div className="grid h-full place-items-center text-[#85A3B2]">
            No image
          </div>
        )}
      </div>
      <div className="grid min-w-0 gap-3 md:grid-cols-2">
        <input className="dashboard-field h-11 rounded-full px-4 font-label text-sm" name="name" defaultValue={String(product.name)} required />
        <input className="dashboard-field h-11 rounded-full px-4 font-label text-sm" name="slug" defaultValue={String(product.slug)} required />
        <input className="dashboard-field h-11 rounded-full px-4 font-label text-sm" name="category" defaultValue={String(product.category ?? "")} />
        <input className="dashboard-field h-11 rounded-full px-4 font-label text-sm" name="base_price_ghs" type="number" min={0} defaultValue={Number(product.base_price_pesewas ?? 0) / 100} required />
        <textarea className="dashboard-field h-20 resize-none rounded-2xl px-4 py-3 font-label text-sm md:col-span-2" name="description" defaultValue={String(product.description ?? "")} />
        <input className="dashboard-field rounded-2xl px-4 py-3 font-label text-xs file:mr-3 file:rounded-full file:border-0 file:bg-ctc-pink file:px-3 file:py-1 file:font-label file:text-[10px] file:font-bold file:uppercase file:text-[#142030] md:col-span-2" name="image" type="file" accept="image/*" />
      </div>
      <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-1">
        <div className="rounded-3xl border border-white/10 bg-[#142030]/35 p-4">
          <p className="font-label text-[10px] uppercase tracking-[0.18em] text-[#85A3B2]">
            Stock Summary
          </p>
          <p className="mt-2 text-2xl font-black text-ctc-cream">{totalStock}</p>
          <p className="mt-1 text-xs text-[#85A3B2]">
            {activeVariants} active variants, {reserved} reserved
          </p>
        </div>
        <p className="font-label text-sm text-ctc-pink">
          {formatPesewasToGHS(Number(product.base_price_pesewas ?? 0))}
        </p>
        <select className="dashboard-field h-11 rounded-full px-4 text-sm" name="status" defaultValue={String(product.status)}>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <button className="btn-pink h-11 rounded-full px-4 font-label text-xs font-bold uppercase tracking-[0.16em] text-[#142030]" type="submit">
          Save
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="font-label text-xs uppercase tracking-wider text-[#85A3B2]">{label}</span>
      <input className="dashboard-field h-12 w-full rounded-full px-4 text-sm" min={type === "number" ? 0 : undefined} name={name} required type={type} />
    </label>
  );
}
