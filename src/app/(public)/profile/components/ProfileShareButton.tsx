"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/common/ShareDialog";

interface ProfileShareButtonProps {
  className?: string;
}

export function ProfileShareButton({ className }: ProfileShareButtonProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShareDialogOpen(true)}
        className={className}
        aria-label="Share profile"
      >
        <Share2 className="size-4 mr-2" />
        <span>แชร์</span>
      </Button>
      <ShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
      />
    </>
  );
}

