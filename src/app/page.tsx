import { generateMetadata } from "@/lib/utils/metadata";
import type { Metadata } from "next";
import { CartoonSectionWrapper } from "@/components/CartoonSectionWrapper";

export const metadata: Metadata = generateMetadata({
  title: "หน้าหลัก",
  description: "ยินดีต้อนรับสู่ Pekotoon - แพลตฟอร์มที่คุณไว้วางใจ",
  keywords: ["Pekotoon", "หน้าหลัก", "home", "มังงะ", "การ์ตูน", "นิยาย"],
});

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Manga Section */}
        <CartoonSectionWrapper
          title="มังงะยอดนิยม"
          description="มังงะที่ได้รับความนิยมมากที่สุด"
          cartoonType="manga"
          type="popular"
          itemsPerView={{
            mobile: 2,
            tablet: 3,
            desktop: 5,
          }}
          className="mb-12"
        />

        {/* Novel Section */}
        <CartoonSectionWrapper
          title="นิยายยอดนิยม"
          description="นิยายที่ได้รับความนิยมมากที่สุด"
          cartoonType="novel"
          type="popular"
          itemsPerView={{
            mobile: 2,
            tablet: 3,
            desktop: 5,
          }}
        />
      </div>
    </div>
  );
}
