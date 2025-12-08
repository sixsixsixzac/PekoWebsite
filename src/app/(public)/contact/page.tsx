import { generateMetadata } from "@/lib/utils/metadata";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Mail, ExternalLink, Phone, Globe, MessageCircle, Link2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = generateMetadata({
  title: "ติดต่อเรา",
  description: "ช่องทางติดต่อ Pekotoon",
  keywords: ["Pekotoon", "ติดต่อ", "contact", "ช่องทางติดต่อ"],
});

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Icon mapping based on contact type
function getContactIcon(type: string) {
  switch (type) {
    case 'email':
      return Mail;
    case 'phone':
      return Phone;
    case 'social':
      return MessageCircle;
    case 'website':
      return Globe;
    default:
      return Link2;
  }
}

// Type label mapping
function getTypeLabel(type: string): string {
  switch (type) {
    case 'email':
      return 'อีเมล';
    case 'phone':
      return 'โทรศัพท์';
    case 'social':
      return 'โซเชียล';
    case 'website':
      return 'เว็บไซต์';
    default:
      return 'อื่นๆ';
  }
}

export default async function ContactPage() {
  // Fetch active contacts from web_contacts table, ordered by displayOrder
  const contacts = await prisma.webContact.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      { displayOrder: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10 lg:py-12">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold tracking-tight">ติดต่อเรา</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                ติดต่อเราผ่านช่องทางต่างๆ ที่สะดวกสำหรับคุณ
              </p>
            </div>
          </div>
          <Separator />
        </div>

        {/* Contacts Grid */}
        {contacts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  ยังไม่มีช่องทางติดต่อในขณะนี้ กรุณาติดต่อทีมงานผ่านช่องทางอื่น
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contacts.map((contact) => {
              const IconComponent = getContactIcon(contact.type);
              return (
                <Card 
                  key={contact.id} 
                  className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                >
                  <CardHeader className="pb-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {getTypeLabel(contact.type)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-semibold">
                      {contact.label}
                    </CardTitle>
                    {contact.description && (
                      <CardDescription className="line-clamp-2 mt-1">
                        {contact.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button
                      asChild
                      variant="default"
                      className="w-full group/button"
                      size="lg"
                    >
                      <a
                        href={contact.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <span>เปิดลิงก์</span>
                        <ExternalLink className="h-4 w-4 transition-transform group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}




