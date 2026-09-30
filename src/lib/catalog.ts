import type { Product, Shop } from "@/types";

export const SHOPS: Shop[] = [
  { id: "shop_rom", name: "ร้านค้าป้ารม", description: "อาหารและเครื่องดื่ม", image_url: "🏪", active: true },
  { id: "shop_coop", name: "สหกรณ์โรงเรียน", description: "ขนมและไอศกรีม", image_url: "🏫", active: true },
];

// Each entry corresponds to one supplied image. The two cola ice creams have
// separate IDs because the folders contain separate 5 and 10 baht products.
export const PRODUCTS: Product[] = [
  { id: "rom_milk_tea", name: "ชานมเย็น", price: 10, emoji: "🧋", image_url: "/products/rom-milk-tea.png", active: true, shop_ids: ["shop_rom"] },
  { id: "rom_thai_tea", name: "ชาไทย", price: 10, emoji: "🧋", image_url: "/products/rom-thai-tea.png", active: true, shop_ids: ["shop_rom"] },
  { id: "rom_cheese_ball", name: "ชีสบอล", price: 10, emoji: "🧀", image_url: "/products/rom-cheese-ball.png", active: true, shop_ids: ["shop_rom"] },
  { id: "rom_blue_hawaii", name: "บลูฮาวาย", price: 10, emoji: "🥤", image_url: "/products/rom-blue-hawaii.png", active: true, shop_ids: ["shop_rom"] },
  { id: "rom_fried_noodles", name: "ผัดมาม่า", price: 15, emoji: "🍜", image_url: "/products/rom-fried-noodles.png", active: true, shop_ids: ["shop_rom"] },
  { id: "rom_fries", name: "เฟรนฟราย", price: 10, emoji: "🍟", image_url: "/products/rom-fries.png", active: true, shop_ids: ["shop_rom"] },
  { id: "rom_cocoa", name: "โกโก้", price: 10, emoji: "🥤", image_url: "/products/rom-cocoa.png", active: true, shop_ids: ["shop_rom"] },
  { id: "rom_bologna", name: "โบโลน่า", price: 10, emoji: "🍖", image_url: "/products/rom-bologna.png", active: true, shop_ids: ["shop_rom"] },
  { id: "rom_fried_chicken", name: "ไก่ทอด", price: 10, emoji: "🍗", image_url: "/products/rom-fried-chicken.png", active: true, shop_ids: ["shop_rom"] },
  { id: "rom_quail_eggs", name: "ไข่นกกระทา", price: 10, emoji: "🥚", image_url: "/products/rom-quail-eggs.png", active: true, shop_ids: ["shop_rom"] },
  { id: "rom_sausage", name: "ไส้กรอก", price: 10, emoji: "🌭", image_url: "/products/rom-sausage.png", active: true, shop_ids: ["shop_rom"] },
  { id: "rom_cheese_sausage", name: "ไส้กรอกชีส", price: 5, emoji: "🌭", image_url: "/products/rom-cheese-sausage.png", active: true, shop_ids: ["shop_rom"] },
  { id: "coop_lip_lai_thang", name: "ขนมลิฟท์", price: 10, emoji: "🍬", image_url: "/products/coop-lip-lai-thang.png", active: true, shop_ids: ["shop_coop"] },
  { id: "coop_cookie", name: "คุกกี้", price: 5, emoji: "🍪", image_url: "/products/coop-cookie.png", active: true, shop_ids: ["shop_coop"] },
  { id: "coop_pocky", name: "ป๊อกกี้", price: 20, emoji: "🍫", image_url: "/products/coop-pocky.png", active: true, shop_ids: ["shop_coop"] },
  { id: "coop_bento", name: "เบนโตะ", price: 5, emoji: "🍬", image_url: "/products/coop-bento.png", active: true, shop_ids: ["shop_coop"] },
  { id: "coop_jelly", name: "เยลลี่", price: 10, emoji: "🍬", image_url: "/products/coop-jelly.png", active: true, shop_ids: ["shop_coop"] },
  { id: "coop_lays", name: "เลย์", price: 10, emoji: "🥔", image_url: "/products/coop-lays.png", active: true, shop_ids: ["shop_coop"] },
  { id: "coop_oreo", name: "โอรีโอ้", price: 5, emoji: "🍪", image_url: "/products/coop-oreo.png", active: true, shop_ids: ["shop_coop"] },
  { id: "coop_butterfly_icecream", name: "ไอติมผีเสื้อ", price: 10, emoji: "🍦", image_url: "/products/coop-butterfly-icecream.png", active: true, shop_ids: ["shop_coop"] },
  { id: "coop_rainbow_icecream", name: "ไอติมเรนโบว์", price: 10, emoji: "🍦", image_url: "/products/coop-rainbow-icecream.png", active: true, shop_ids: ["shop_coop"] },
  { id: "coop_cola_icecream_5", name: "ไอติมโคล่า", price: 5, emoji: "🍦", image_url: "/products/coop-cola-icecream-5.png", active: true, shop_ids: ["shop_coop"] },
  { id: "coop_cola_icecream_10", name: "ไอติมโคล่า", price: 10, emoji: "🍦", image_url: "/products/coop-cola-icecream-10.png", active: true, shop_ids: ["shop_coop"] },
];

export const productById = (id: string): Product => {
  const product = PRODUCTS.find((item) => item.id === id);
  if (!product) throw new Error(`Unknown product: ${id}`);
  return product;
};
