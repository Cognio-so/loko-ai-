"use client";

import { useMemo, useRef, useState, type DragEvent } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function AvatarUploadClient({
  initialAvatar,
  displayName,
  initials,
}: {
  initialAvatar: string | null;
  displayName: string;
  initials: string;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { user, profile, updateProfile, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || initialAvatar || "");
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const loadFile = (nextFile: File) => {
    if (!ACCEPTED.includes(nextFile.type)) {
      setMessage("Use jpg, jpeg, png, or webp.");
      return;
    }
    if (nextFile.size > MAX_SIZE) {
      setMessage("Maximum avatar size is 5MB.");
      return;
    }
    setFile(nextFile);
    setZoom(1);
    setMessage("");
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(nextFile);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const nextFile = event.dataTransfer.files[0];
    if (nextFile) loadFile(nextFile);
  };

  const cropImage = async () => {
    if (!preview) return null;
    const image = new Image();
    image.src = preview;
    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return null;

    const sourceSize = Math.min(image.width, image.height) / zoom;
    const sx = (image.width - sourceSize) / 2;
    const sy = (image.height - sourceSize) / 2;
    context.drawImage(image, sx, sy, sourceSize, sourceSize, 0, 0, size, size);

    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.92));
  };

  const upload = async () => {
    if (!file || !user) return;
    setProgress(12);
    setMessage("Preparing image...");
    const blob = await cropImage();
    if (!blob) return;
    setProgress(38);
    const path = `${user.id}/avatar-${Date.now()}.webp`;
    const { error } = await supabase.storage.from("avatars").upload(path, blob, {
      contentType: "image/webp",
      upsert: true,
    });
    setProgress(78);

    if (error) {
      setMessage("Upload failed. Check the avatars bucket and storage policy.");
      setProgress(0);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await updateProfile({ avatar_url: data.publicUrl });
    await supabase.auth.updateUser({
      data: { avatar_url: data.publicUrl, picture: data.publicUrl },
    });
    await refreshUser();
    setAvatarUrl(data.publicUrl);
    setPreview("");
    setFile(null);
    setProgress(100);
    setMessage("Avatar updated.");
    window.setTimeout(() => setProgress(0), 1200);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Avatar className="h-28 w-28 border border-border shadow-lg">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-sky-500 text-3xl font-bold text-white">{initials}</AvatarFallback>
        </Avatar>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`rounded-2xl border border-dashed p-4 text-center transition ${isDragging ? "border-sky-400 bg-sky-500/10" : "border-border bg-muted/40"}`}
      >
        {preview ? (
          <div className="space-y-4">
            <div className="mx-auto h-40 w-40 overflow-hidden rounded-full border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Avatar crop preview" className="h-full w-full object-cover" style={{ transform: `scale(${zoom})` }} />
            </div>
            <label className="block text-xs font-semibold text-muted-foreground">
              Crop zoom
              <input type="range" min="1" max="2.2" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="mt-2 w-full accent-sky-500" />
            </label>
            <div className="flex justify-center gap-2">
              <Button onClick={() => void upload()}><Upload className="h-4 w-4" /> Upload Image</Button>
              <Button variant="outline" onClick={() => { setPreview(""); setFile(null); }}><X className="h-4 w-4" /> Cancel</Button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full flex-col items-center gap-3 rounded-xl p-6 text-sm font-semibold text-muted-foreground">
            <Camera className="h-8 w-8 text-sky-500" />
            Change Avatar
            <span className="text-xs font-normal">Drag and drop or choose jpg, jpeg, png, webp up to 5MB.</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const nextFile = event.target.files?.[0];
          if (nextFile) loadFile(nextFile);
        }}
      />
      {progress > 0 ? <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-sky-500 transition-all" style={{ width: `${progress}%` }} /></div> : null}
      {message ? <p className="text-center text-xs font-semibold text-muted-foreground">{message}</p> : null}
    </div>
  );
}
