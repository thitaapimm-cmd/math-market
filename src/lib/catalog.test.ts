import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PRODUCTS, SHOPS } from "./catalog";

describe("shop catalog", () => {
  it("includes every supplied product image with a valid shop, price, and public image", () => {
    expect(SHOPS).toHaveLength(2);
    expect(PRODUCTS).toHaveLength(23);
    expect(new Set(PRODUCTS.map((product) => product.id)).size).toBe(23);
    for (const product of PRODUCTS) {
      expect(product.price).toBeGreaterThan(0);
      expect(product.shop_ids).toHaveLength(1);
      expect(SHOPS.some((shop) => shop.id === product.shop_ids[0])).toBe(true);
      expect(existsSync(join(process.cwd(), "public", product.image_url!))).toBe(true);
    }
    expect(PRODUCTS.filter((product) => product.name === "ไอติมโคล่า").map((product) => product.price).sort((a, b) => a - b)).toEqual([5, 10]);
    expect(PRODUCTS.find((product) => product.id === "rom_cheese_sausage")).toEqual(expect.objectContaining({ name: "ไส้กรอกชีส", price: 5 }));
    expect(PRODUCTS.find((product) => product.id === "coop_lip_lai_thang")).toEqual(expect.objectContaining({ name: "ขนมลิฟท์", price: 10 }));
    expect(PRODUCTS.find((product) => product.id === "coop_pocky")).toEqual(expect.objectContaining({ name: "ป๊อกกี้", price: 20 }));
    expect(PRODUCTS.find((product) => product.id === "coop_oreo")).toEqual(expect.objectContaining({ name: "โอรีโอ้", price: 5 }));
  });
});
