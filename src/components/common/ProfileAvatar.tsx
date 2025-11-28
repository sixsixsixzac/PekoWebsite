"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { constructAuthorAvatarUrl } from "@/lib/utils/image-url";
import { AvatarUploadButton } from "./AvatarUploadButton";
import { toast } from "sonner";

interface ProfileAvatarProps {
  userImg: string;
  displayName: string;
  isOwnProfile: boolean;
  allowUpload: boolean;
}

export function ProfileAvatar({
  userImg,
  displayName,
  isOwnProfile,
  allowUpload = false,
}: ProfileAvatarProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(userImg);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Upload file to backend
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload avatar");
      }

      // Update current avatar with the new path
      setCurrentAvatar(data.avatarPath);
      // Clear preview to show the uploaded image
      setPreviewUrl(null);
      toast.success("อัปโหลดรูปโปรไฟล์สำเร็จ");
      
      // Refresh the page to show the new avatar
      window.location.reload();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปโหลด");
      // Clear preview on error
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Clean up preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Update current avatar when userImg prop changes
  useEffect(() => {
    setCurrentAvatar(userImg);
  }, [userImg]);

  // Determine which image to show
  const avatarSrc = previewUrl || constructAuthorAvatarUrl(currentAvatar);

  return (
    <div className="relative mx-auto sm:mx-0 group">
      <Avatar className="size-24 shrink-0 border-4 border-background shadow-lg">
        <AvatarImage
          src={avatarSrc}
          alt={`${displayName} avatar`}
        />
        <AvatarFallback className="text-2xl">
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/70">
          <div className="size-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      )}
      {isOwnProfile && allowUpload && !isUploading && (
        <AvatarUploadButton onFileSelect={handleFileSelect} />
      )}
    </div>
  );
}

