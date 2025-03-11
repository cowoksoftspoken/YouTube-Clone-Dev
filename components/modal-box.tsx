"use client";

import { useState } from "react";
import { DialogHeader, Dialog, DialogContent } from "./ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  video: any;
  onEdit: (videoId: string, title: string, description: string) => void;
  onDelete: (videoId: string) => void;
}

export default function VideoModal({
  isOpen,
  onClose,
  type,
  video,
  onEdit,
  onDelete,
}: VideoModalProps) {
  const [title, setTitle] = useState(video?.snippet?.title || "");
  const [description, setDescription] = useState(
    video?.snippet?.description || ""
  );

  const handleSave = () => {
    onEdit(video?.snippet?.resourceId?.videoId, title, description);
    onClose();
  };

  const handleDelete = () => {
    onDelete(video?.snippet?.resourceId?.videoId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "edit" ? "Edit Video" : "Delete Confirmation"}
          </DialogTitle>
        </DialogHeader>

        {type === "edit" ? (
          <div className="space-y-4">
            <Input
              aria-label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              aria-label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p>Are you sure you want to delete this video?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Yes, Delete
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
