"use client";

import { useEffect, useState } from "react";
import { Search, Trash2, Hourglass, Info, Ban, UserCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFilteredTable } from "@/hooks/use-filtered-table";
import { PagePagination } from "@/components/page-pagination";
import { TableSkeleton } from "@/components/table-skeleton";
import { ErrorState } from "@/components/error-state";
import { AddAccessControlEmailDialog } from "@/components/access-control/add-access-control-email-dialog";
import { RemoveAccessControlEmailDialog } from "@/components/access-control/remove-access-control-email-dialog";
import { EmptyTableRow } from "@/components/table/empty-table-row";
import { api, type AccessControlEntry, type AccessListType } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function AccessControlPage() {
  const [waitlistEnabled, setWaitlistEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getSettings();
        setWaitlistEnabled(res.data.WAITLIST_ENABLED?.value === "true");
      } catch {
        toast.error("Failed to load waitlist setting");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function onToggle(next: boolean) {
    const prev = waitlistEnabled;
    setWaitlistEnabled(next);
    setSaving(true);
    try {
      await api.setWaitlistEnabled(next);
      toast.success(next ? "Waitlist enabled" : "Waitlist disabled");
    } catch (err) {
      setWaitlistEnabled(prev);
      toast.error(
        err instanceof Error ? err.message : "Failed to update setting",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
        <p className="text-muted-foreground">
          Gate new signups with a global waitlist, a per-email allowlist, and a
          per-email blocklist.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hourglass className="h-5 w-5" />
            Global waitlist
          </CardTitle>
          <CardDescription>
            When enabled, all new signups see the waitlist screen unless their
            email is on the allowlist.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="waitlist-toggle">Waitlist enabled</Label>
              <p className="text-sm text-muted-foreground">
                Off — everyone can sign up (except blocklisted emails).
                <br />
                On — everyone is waitlisted (except allowlisted emails).
              </p>
            </div>
            <Switch
              id="waitlist-toggle"
              checked={waitlistEnabled}
              disabled={loading || saving}
              onCheckedChange={onToggle}
            />
          </div>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>How the lists interact</AlertTitle>
            <AlertDescription>
              <span className="block">
                <strong>Blocklist</strong> always blocks, regardless of the
                waitlist toggle.
              </span>
              <span className="block">
                <strong>Allowlist</strong> only matters when the waitlist is
                enabled — listed emails bypass the waitlist.
              </span>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs defaultValue="ALLOWLIST">
        <TabsList>
          <TabsTrigger value="ALLOWLIST">
            <UserCheck className="mr-1 h-4 w-4" />
            Allowlist
            {waitlistEnabled && (
              <Badge variant="default" className="ml-2">
                active
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="BLOCKLIST">
            <Ban className="mr-1 h-4 w-4" />
            Blocklist
            <Badge variant="default" className="ml-2">
              active
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ALLOWLIST">
          <AccessControlTable
            listType="ALLOWLIST"
            enforced={waitlistEnabled}
            description="Emails here bypass the global waitlist and can onboard. Only relevant when the waitlist is enabled."
          />
        </TabsContent>
        <TabsContent value="BLOCKLIST">
          <AccessControlTable
            listType="BLOCKLIST"
            enforced={true}
            description="Emails here are always blocked, even when the waitlist is disabled."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AccessControlTable({
  listType,
  enforced,
  description,
}: {
  listType: AccessListType;
  enforced: boolean;
  description: string;
}) {
  const [search, setSearch] = useState("");
  const [removeEntry, setRemoveEntry] = useState<AccessControlEntry | null>(
    null,
  );

  const {
    data: entries,
    total,
    page,
    setPage,
    totalPages,
    loading,
    error,
    refetch,
  } = useFilteredTable<AccessControlEntry, { search?: string; listType: AccessListType }>(
    async (page, limit, { search, listType }) => {
      const res = await api.getAccessControlList(listType, page, limit, search);
      return { data: res.data.entries, total: res.data.total };
    },
    { search, listType },
  );

  const label = listType === "BLOCKLIST" ? "Blocklist" : "Allowlist";

  if (error) return <ErrorState message={error} />;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{label}</CardTitle>
            <CardDescription>
              {total} {total === 1 ? "entry" : "entries"}
              {!enforced && " — not currently enforced"}
            </CardDescription>
          </div>
          <AddAccessControlEmailDialog
            listType={listType}
            onSuccess={refetch}
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email (exact match)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <TableSkeleton />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <EmptyTableRow colSpan={4}>No entries</EmptyTableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry.email}
                      </TableCell>
                      <TableCell className="max-w-[300px] text-sm text-muted-foreground">
                        {entry.reason || (
                          <span className="italic">No reason</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setRemoveEntry(entry)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Remove from {label.toLowerCase()}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <PagePagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </CardContent>

      {removeEntry && (
        <RemoveAccessControlEmailDialog
          entry={removeEntry}
          open={!!removeEntry}
          onOpenChange={(open) => !open && setRemoveEntry(null)}
          onSuccess={refetch}
        />
      )}
    </Card>
  );
}
