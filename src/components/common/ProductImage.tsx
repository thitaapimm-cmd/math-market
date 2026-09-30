import Image from "next/image";
import type { Product } from "@/types";

export function ProductImage({ product, size = 96 }: { product: Product; size?: number }) {
  if (!product.image_url) return <span aria-hidden="true" className="text-5xl">{product.emoji}</span>;
  return (
    <Image
      src={product.image_url}
      alt={product.name}
      width={size}
      height={size}
      className="mx-auto aspect-square rounded-xl object-contain"
    />
  );
}
