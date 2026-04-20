"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, type User } from "@/lib/api";
import { useFilteredTable } from "@/hooks/use-filtered-table";
import { PagePagination } from "@/components/page-pagination";
import { TableSkeleton } from "@/components/table-skeleton";
import { ErrorState } from "@/components/error-state";
import { EditUserDialog } from "@/components/edit-user-dialog";
import { DeleteUserDialog } from "@/components/delete-user-dialog";
import { ChangeRoleDialog } from "@/components/change-role-dialog";
import { AddUserDialog } from "@/components/add-user-dialog";
import { UsersTable } from "@/components/users/users-table";
import { UsersFilters } from "@/components/users/users-filters";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [changeRoleUser, setChangeRoleUser] = useState<User | null>(null);

  const { data: users, total, page, setPage, totalPages, loading, error, refetch } =
    useFilteredTable<User, { search?: string; status?: string }>(
      async (page, limit, { search, status }) => {
        const res = await api.getUsers(page, limit, search, status);
        return { data: res.data.users ?? [], total: res.data.total };
      },
      { search, status: statusFilter },
    );

  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage and view all registered users
          </p>
        </div>
        <AddUserDialog onSuccess={refetch} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {total} total user{total !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsersFilters
            search={search}
            onSearchChange={setSearch}
            status={statusFilter}
            onStatusChange={setStatusFilter}
          />

          {loading ? (
            <TableSkeleton />
          ) : (
            <UsersTable
              users={users}
              onEdit={setEditUser}
              onChangeRole={setChangeRoleUser}
              onDelete={setDeleteUser}
            />
          )}

          <PagePagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>

      {editUser && (
        <EditUserDialog
          user={editUser}
          open={!!editUser}
          onOpenChange={(open) => !open && setEditUser(null)}
          onSuccess={refetch}
        />
      )}

      {deleteUser && (
        <DeleteUserDialog
          user={deleteUser}
          open={!!deleteUser}
          onOpenChange={(open) => !open && setDeleteUser(null)}
          onSuccess={refetch}
        />
      )}

      {changeRoleUser && (
        <ChangeRoleDialog
          user={changeRoleUser}
          open={!!changeRoleUser}
          onOpenChange={(open) => !open && setChangeRoleUser(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
