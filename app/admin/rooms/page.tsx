"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, MoreVertical, BedDouble, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminData } from "@/components/admin-data-provider";
import { isRoomBooked } from "@/lib/admin-store";
import type { AdminRoom, AdminData } from "@/lib/admin-store";
import { useI18n } from "@/lib/i18n";
import { CurrencySymbol } from "@/components/currency-symbol";

const ROOM_TYPES = ["Standard Room", "Deluxe Room", "Premium Suite", "Family Room", "Presidential Suite"];

function EditRoomForm({
  room,
  data,
  updateRoom,
  onClose,
  roomTypes,
  t,
}: {
  room: AdminRoom;
  data: AdminData;
  updateRoom: (id: string, updates: Partial<AdminRoom>) => void;
  onClose: () => void;
  roomTypes: string[];
  t: (key: string) => string;
}) {
  const [number, setNumber] = useState(room.number);
  const [type, setType] = useState(room.type);
  const [price, setPrice] = useState(String(room.price));
  const [capacity, setCapacity] = useState(String(room.capacity));
  const [imageIds, setImageIds] = useState<string[]>(
    () => {
      const existingUrls = room.images && room.images.length > 0 ? room.images : [room.image].filter(Boolean);
      return data.media.filter((m) => existingUrls.includes(m.url)).map((m) => m.id);
    }
  );
  const [status, setStatus] = useState<"available" | "occupied" | "maintenance">(room.status);

  useEffect(() => {
    setNumber(room.number);
    setType(room.type);
    setPrice(String(room.price));
    setCapacity(String(room.capacity));
    setStatus(room.status);
    const existingUrls = room.images && room.images.length > 0 ? room.images : [room.image].filter(Boolean);
    setImageIds(data.media.filter((m) => existingUrls.includes(m.url)).map((m) => m.id));
  }, [room, data.media]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const priceNum = parseInt(price, 10);
        const capacityNum = parseInt(capacity, 10);
        if (!number.trim() || isNaN(priceNum) || priceNum < 0 || isNaN(capacityNum) || capacityNum < 1) return;
        const selectedMedia = data.media.filter((m) => imageIds.includes(m.id));
        const imageUrls = selectedMedia.map((m) => m.url);
        updateRoom(room.id, {
          number: number.trim(),
          type,
          price: priceNum,
          capacity: capacityNum,
          status,
          image: imageUrls[0] ?? room.image,
          images: imageUrls.length > 0 ? imageUrls : room.images,
        });
        onClose();
      }}
      className="grid gap-4 py-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-roomNumber">{t("admin.roomNumber")}</Label>
          <Input
            id="edit-roomNumber"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-roomType">{t("admin.roomType")}</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roomTypes.map((rt) => (
                <SelectItem key={rt} value={rt}>
                  {rt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-price">{t("admin.pricePerNight")}</Label>
          <Input
            id="edit-price"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-capacity">{t("admin.capacityLabel")}</Label>
          <Input
            id="edit-capacity"
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t("admin.status")}</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as "available" | "occupied" | "maintenance")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">{t("admin.available")}</SelectItem>
            <SelectItem value="occupied">{t("admin.booked")}</SelectItem>
            <SelectItem value="maintenance">{t("admin.maintenance")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t("admin.roomImageFromMedia")}</Label>
        {data.media.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("admin.noMediaUploaded")}</p>
        ) : (
          <div className="grid max-h-48 grid-cols-4 gap-2 overflow-y-auto rounded-lg border p-2">
            {data.media.map((item) => {
              const isActive = imageIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setImageIds((prev) =>
                      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                    )
                  }
                  className={`relative aspect-video overflow-hidden rounded-md border-2 transition-colors ${
                    isActive ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                  {isActive && (
                    <span className="absolute inset-0 flex items-center justify-center bg-primary/20">
                      <ImageIcon className="h-6 w-6 text-primary-foreground" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {t("admin.cancel")}
        </Button>
        <Button type="submit">{t("admin.saveChanges")}</Button>
      </DialogFooter>
    </form>
  );
}

export default function RoomsPage() {
  const { t } = useI18n();
  const { data, addRoom, updateRoom, deleteRoom } = useAdminData();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newType, setNewType] = useState("Standard Room");
  const [newPrice, setNewPrice] = useState("");
  const [newCapacity, setNewCapacity] = useState("");
  const [newImageIds, setNewImageIds] = useState<string[]>([]);
  const [editRoomId, setEditRoomId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editRoom = editRoomId ? data.rooms.find((r) => r.id === editRoomId) : null;
  const rooms = data.rooms;
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.number.toLowerCase().includes(search.toLowerCase()) ||
      room.type.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || room.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">{t("admin.available")}</Badge>;
      case "occupied":
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">{t("admin.booked")}</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">{t("admin.maintenance")}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("admin.roomManagement")}</h1>
            <p className="text-muted-foreground">{t("admin.manageRoomsAndAvailability")}</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          {t("general.loading")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("admin.roomManagement")}</h1>
          <p className="text-muted-foreground">{t("admin.manageRoomsAndAvailability")}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="me-2 h-4 w-4" />
              {t("admin.addRoom")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("admin.addNewRoomTitle")}</DialogTitle>
              <DialogDescription>{t("admin.enterNewRoomDetails")}</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const price = parseInt(newPrice, 10);
                const capacity = parseInt(newCapacity, 10);
                if (!newNumber.trim() || isNaN(price) || price < 0 || isNaN(capacity) || capacity < 1) return;
                const selectedMedia = data.media.filter((m) => newImageIds.includes(m.id));
                const imageUrls = selectedMedia.map((m) => m.url);
                addRoom({
                  number: newNumber.trim(),
                  type: newType,
                  price,
                  capacity,
                  status: "available",
                  image: imageUrls[0] ?? "",
                  images: imageUrls,
                });
                setNewNumber("");
                setNewPrice("");
                setNewCapacity("");
                setNewImageIds([]);
                setIsAddDialogOpen(false);
              }}
              className="grid gap-4 py-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">{t("admin.roomNumber")}</Label>
                  <Input
                    id="roomNumber"
                    placeholder="e.g., 101"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomType">{t("admin.roomType")}</Label>
                  <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("admin.selectType")} />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_TYPES.map((rt) => (
                        <SelectItem key={rt} value={rt}>
                          {rt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{t("admin.pricePerNight")}</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    placeholder="350"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">{t("admin.capacityLabel")}</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={1}
                    placeholder="2"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("admin.roomImageFromMedia")}</Label>
                {data.media.length === 0 ? (
                  <p className="rounded-lg border border-dashed bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    {t("admin.uploadInMediaFirst")}
                  </p>
                ) : (
                  <div className="grid max-h-48 grid-cols-4 gap-2 overflow-y-auto rounded-lg border p-2">
                    {data.media.map((item) => {
                      const isActive = newImageIds.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setNewImageIds((prev) =>
                              prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                            )
                          }
                          className={`relative aspect-video overflow-hidden rounded-md border-2 transition-colors ${
                            isActive ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/30"
                          }`}
                        >
                          <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                          {isActive && (
                            <span className="absolute inset-0 flex items-center justify-center bg-primary/20">
                              <ImageIcon className="h-6 w-6 text-primary-foreground" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t("admin.cancel")}
                </Button>
                <Button type="submit">{t("admin.addRoom")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("admin.searchRoomsPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t("admin.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.allStatuses")}</SelectItem>
                <SelectItem value="available">{t("admin.available")}</SelectItem>
                <SelectItem value="occupied">{t("admin.booked")}</SelectItem>
                <SelectItem value="maintenance">{t("admin.maintenance")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Edit Room Dialog */}
      <Dialog open={!!editRoomId} onOpenChange={(open) => !open && setEditRoomId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("admin.editRoom")}</DialogTitle>
            <DialogDescription>{t("admin.updateRoomDetails")}</DialogDescription>
          </DialogHeader>
          {editRoom && (
            <EditRoomForm
              room={editRoom}
              data={data}
              updateRoom={updateRoom}
              onClose={() => setEditRoomId(null)}
              roomTypes={ROOM_TYPES}
              t={t}
            />
          )}
        </DialogContent>
      </Dialog>

      {filteredRooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BedDouble className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm font-medium text-foreground">{t("admin.noRoomsYet")}</p>
            <p className="text-xs text-muted-foreground">{t("admin.addFirstRoom")}</p>
            <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="me-2 h-4 w-4" />
              {t("admin.addRoom")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="overflow-hidden pt-0">
              <div className="relative aspect-video bg-muted">
                {room.image ? (
                  <img
                    src={room.image}
                    alt={`Room ${room.number}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <span className="text-sm">No image</span>
                  </div>
                )}
                <div className="absolute end-2 top-2">
                  {getStatusBadge(room.status)}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{t("admin.roomLabel")} {room.number}</h3>
                    <p className="text-sm text-muted-foreground">{room.type}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditRoomId(room.id)}>
                        <Edit className="me-2 h-4 w-4" />
                        {t("admin.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteRoom(room.id)}
                      >
                        <Trash2 className="me-2 h-4 w-4" />
                        {t("admin.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {t("admin.capacityLabel")}: {room.capacity} {t("admin.capacityGuests")}
                  </div>
                  <div className="font-semibold text-primary">{room.price} <CurrencySymbol /></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
