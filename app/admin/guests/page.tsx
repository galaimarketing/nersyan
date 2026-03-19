"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Mail, Phone, ArrowLeft, Users, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminData } from "@/components/admin-data-provider";
import { useI18n } from "@/lib/i18n";

export default function AdminGuestsPage() {
  const { t } = useI18n();
  const { data, deleteGuest } = useAdminData();
  const [search, setSearch] = useState("");
  const [deleteConfirmGuestId, setDeleteConfirmGuestId] = useState<string | null>(null);

  const guests = data.guests;
  const bookingCountByGuest = (guestId: string) =>
    data.bookings.filter((b) => b.guestId === guestId).length;
  const filtered = guests.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{t("admin.guestsTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("admin.manageGuestRecords")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.allGuests")}</CardTitle>
          <CardDescription>{t("admin.searchAndViewGuests")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("admin.searchByNameOrEmail")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {guests.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-medium text-foreground">{t("admin.noGuestsYet")}</p>
              <p className="text-xs text-muted-foreground">{t("admin.guestRecordsAppearHere")}</p>
            </div>
          ) : (
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20%] text-start">{t("admin.name")}</TableHead>
                  <TableHead className="w-[28%] text-start">{t("admin.email")}</TableHead>
                  <TableHead className="w-[22%] text-start">{t("admin.phone")}</TableHead>
                  <TableHead className="w-[12%] text-center">{t("admin.bookingsTitle")}</TableHead>
                  <TableHead className="w-[18%] text-end">{t("admin.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell className="w-[20%] text-start font-medium">{guest.name}</TableCell>
                    <TableCell className="w-[28%] text-start">
                      <span className="inline-flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{guest.email || "—"}</span>
                      </span>
                    </TableCell>
                    <TableCell className="w-[22%] text-start">
                      <span className="inline-flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{guest.phone || "—"}</span>
                      </span>
                    </TableCell>
                    <TableCell className="w-[12%] text-center">{bookingCountByGuest(guest.id)}</TableCell>
                    <TableCell className="w-[18%] text-end">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            href={`/admin/bookings?guest=${guest.id}`}
                            aria-label={t("admin.view")}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteConfirmGuestId(guest.id)}
                          aria-label={t("admin.delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteConfirmGuestId !== null} onOpenChange={(open) => !open && setDeleteConfirmGuestId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.delete")}</AlertDialogTitle>
            <AlertDialogDescription>{t("admin.deleteGuestConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirmGuestId) {
                  deleteGuest(deleteConfirmGuestId);
                  setDeleteConfirmGuestId(null);
                }
              }}
            >
              {t("admin.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button variant="outline" asChild>
        <Link href="/admin" className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("admin.backToDashboard")}
        </Link>
      </Button>
    </div>
  );
}
