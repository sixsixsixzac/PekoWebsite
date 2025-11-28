"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";

interface AvatarUploadButtonProps {
  onFileSelect: (file: File) => void;
}

export function AvatarUploadButton({ onFileSelect }: AvatarUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Validate file type
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      const fileType = file.type.toLowerCase();
      
      if (allowedTypes.includes(fileType)) {
        onFileSelect(file);
      } else {
        toast.error("กรุณาเลือกไฟล์รูปภาพที่เป็น PNG, JPG หรือ WebP เท่านั้น");
      }
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <div
        onClick={handleClick}
        className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
      >
        <Camera className="size-6 text-white" />
      </div>
    </>
  );
}

