"use client";

import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SettingsCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  children: React.ReactNode;
}

export function SettingsCard({
  title,
  description,
  icon: Icon,
  loading = false,
  children,
}: SettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

interface LastUpdatedProps {
  at: string | null;
}

export function LastUpdated({ at }: LastUpdatedProps) {
  if (!at) return null;
  return (
    <p className="text-xs text-muted-foreground">
      Last updated: {new Date(at).toLocaleString()}
    </p>
  );
}
