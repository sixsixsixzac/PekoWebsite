import { BookOpen, UserPlus, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { ProfileAvatar } from "@/components/common/ProfileAvatar";
import { FollowUserButtonClient } from "@/components/common/FollowUserButtonClient";
import { ProfileShareButton } from "./ProfileShareButton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface ProfileSectionProps {
  user: {
    id: number;
    uuid: string;
    displayName: string;
    userImg: string;
    detail?: {
      status: string;
    } | null;
  };
  stats: {
    totalCartoons: number;
    followers: number;
    following: number;
  };
  isLoggedIn: boolean;
  currentUser: {
    id: string;
  } | null | undefined;
  isFollowing: boolean;
}

function formatMetricNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function ProfileSection({
  user,
  stats,
  isLoggedIn,
  currentUser,
  isFollowing,
}: ProfileSectionProps) {
  const isOwnProfile = isLoggedIn && currentUser?.id && parseInt(currentUser.id) === user.id;

  return (
    <div className="flex flex-col gap-6 rounded-lg border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:gap-8">
      <ProfileAvatar
        allowUpload={true}
        userImg={user.userImg}
        displayName={user.displayName}
        isOwnProfile={Boolean(isOwnProfile)}
      />

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-col items-center gap-1 sm:items-start sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-2xl font-bold text-card-foreground sm:text-3xl">
              {user.displayName}
            </h1>
            {user.detail?.status === "approve" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex cursor-help">
                    <CheckCircle2 className="size-5 text-blue-500 shrink-0" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>บัญชีที่ยืนยันตัวตนนักเขียนแล้ว</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex cursor-help">
                    <AlertCircle className="size-5 text-muted-foreground shrink-0" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>บัญชีที่ยังไม่ยืนยันตัวตนนักเขียน</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {isOwnProfile && user.uuid && (
            <span className="text-xs text-muted-foreground text-center sm:text-left">
              {user.uuid}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-between gap-6 sm:justify-start sm:gap-8">
          <div className="flex items-center gap-2.5">
            <BookOpen className="size-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {formatMetricNumber(stats.totalCartoons)}
              </span>
              <span className="text-xs text-muted-foreground">เรื่อง</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Users className="size-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {formatMetricNumber(stats.followers)}
              </span>
              <span className="text-xs text-muted-foreground">ผู้ติดตาม</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <UserPlus className="size-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {formatMetricNumber(stats.following)}
              </span>
              <span className="text-xs text-muted-foreground">กำลังติดตาม</span>
            </div>
          </div>
        </div>

        {/* Follow and Share Buttons - Mobile: Full Width Under Stats */}
        <div className="flex gap-2 w-full md:hidden">
          {isLoggedIn && currentUser?.id && parseInt(currentUser.id) !== user.id && (
            <FollowUserButtonClient
              targetUserUuid={user.uuid}
              initialIsFollowing={isFollowing}
              className="flex-1"
            />
          )}
          <ProfileShareButton
            className={
              isLoggedIn && currentUser?.id && parseInt(currentUser.id) !== user.id
                ? "flex-1"
                : "w-full"
            }
          />
        </div>
      </div>

      {/* Follow and Share Buttons - Desktop: Right Side */}
      <div className="hidden md:flex shrink-0 gap-2">
        {isLoggedIn && currentUser?.id && parseInt(currentUser.id) !== user.id && (
          <FollowUserButtonClient
            targetUserUuid={user.uuid}
            initialIsFollowing={isFollowing}
          />
        )}
        <ProfileShareButton />
      </div>
    </div>
  );
}

