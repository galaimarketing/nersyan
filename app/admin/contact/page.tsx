"use client";

import Link from "next/link";
import { ArrowLeft, CheckCheck, Inbox, Mail, Phone, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useState } from "react";

export default function AdminContactMessagesPage() {
  const { data, deleteContactMessage, markContactMessageRead } = useAdminData();
  const { t } = useI18n();
  const messages = data.contactMessages ?? [];
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{t("admin.contactMessages")}</h2>
        <p className="text-sm text-muted-foreground">{t("admin.contactMessagesDesc")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.inbox")}</CardTitle>
          <CardDescription>{t("admin.contactInboxHelp")}</CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <Inbox className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-medium text-foreground">{t("admin.noContactMessages")}</p>
              <p className="text-xs text-muted-foreground">{t("admin.contactMessagesWillAppear")}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {messages.map((m) => (
                <li key={m.id} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.createdAt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!m.read && <Badge variant="secondary">{t("admin.unread")}</Badge>}
                      {!m.read && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          aria-label={t("admin.markRead")}
                          onClick={() => markContactMessageRead(m.id)}
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        aria-label={t("admin.delete")}
                        onClick={() => setDeleteConfirmId(m.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${m.email}`} className="hover:underline">
                        {m.email}
                      </a>
                    </p>
                    {m.phone ? (
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${m.phone}`} className="hover:underline" dir="ltr">
                          {m.phone}
                        </a>
                      </p>
                    ) : null}
                    <p className="mt-2 rounded-md bg-muted/40 p-3 text-foreground">{m.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Button variant="outline" asChild>
        <Link href="/admin" className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("admin.backToDashboard")}
        </Link>
      </Button>

      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.delete")}</AlertDialogTitle>
            <AlertDialogDescription>{t("admin.deleteContactMessageConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirmId) {
                  deleteContactMessage(deleteConfirmId);
                  setDeleteConfirmId(null);
                }
              }}
            >
              {t("admin.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

