import { generateMetadata } from "@/lib/utils/metadata";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Megaphone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = generateMetadata({
  title: "ประกาศ",
  description: "ประกาศและข่าวสารจาก Pekotoon",
  keywords: ["Pekotoon", "ประกาศ", "announcement", "ข่าวสาร"],
});

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Priority order mapping for sorting
const priorityOrder: Record<string, number> = {
  urgent: 4,
  high: 3,
  normal: 2,
  low: 1,
};

function getPriorityBadgeVariant(priority: string): "default" | "destructive" | "secondary" | "outline" {
  switch (priority) {
    case 'urgent':
      return 'destructive';
    case 'high':
      return 'default';
    case 'normal':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'secondary';
  }
}

function formatPriority(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'ด่วน';
    case 'high':
      return 'สำคัญ';
    case 'normal':
      return 'ปกติ';
    case 'low':
      return 'ต่ำ';
    default:
      return priority;
  }
}

export default async function AnnouncementPage() {
  const now = new Date();

  // Fetch published announcements
  const announcements = await prisma.announcement.findMany({
    where: {
      status: 'published',
      publishedAt: {
        lte: now,
      },
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: now } },
      ],
    },
    include: {
      creator: {
        select: {
          displayName: true,
        },
      },
    },
    orderBy: [
      { priority: 'desc' },
      { publishedAt: 'desc' },
    ],
  });

  // Sort by priority order
  const sortedAnnouncements = announcements.sort((a, b) => {
    const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    if (priorityDiff !== 0) return priorityDiff;
    
    // If same priority, sort by publishedAt (newest first)
    const dateA = a.publishedAt?.getTime() || 0;
    const dateB = b.publishedAt?.getTime() || 0;
    return dateB - dateA;
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:py-10 lg:py-12">
        <div className="flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">ประกาศ</h1>
        </div>

        {sortedAnnouncements.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ยังไม่มีประกาศในขณะนี้
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {sortedAnnouncements.map((announcement) => (
              <Card key={announcement.id.toString()} className="w-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="flex-1">{announcement.title}</CardTitle>
                    <Badge variant={getPriorityBadgeVariant(announcement.priority)}>
                      {formatPriority(announcement.priority)}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {announcement.publishedAt && (
                      <span>
                        วันที่ประกาศ: {new Date(announcement.publishedAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                    {announcement.creator && (
                      <span>
                        โดย: {announcement.creator.displayName}
                      </span>
                    )}
                    {announcement.expiresAt && (
                      <span className="text-xs">
                        หมดอายุ: {new Date(announcement.expiresAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

