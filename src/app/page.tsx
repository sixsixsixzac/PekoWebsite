import { generateMetadata } from "@/lib/utils/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
  title: "หน้าหลัก",
  description: "ยินดีต้อนรับสู่ Pekotoon - แพลตฟอร์มที่คุณไว้วางใจ",
  keywords: ["Pekotoon", "หน้าหลัก", "home", "มังงะ", "การ์ตูน", "นิยาย"],
});

export default async function RootPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Welcome to Pekotoon</h1>
    </div>
  );
}

