import React, { useState } from "react";
import "../styles/CreatePointModal.css";

export interface Photo {
  url: string;
  caption?: string;
}

export interface CreatePointData {
  id: string;
  lat: number;
  long: number;
  descriptor?: string;
  tags: string[];
  photos: Photo[];
}

export interface PointData {
  lat: number;
  long: number;
  descriptor?: string;
  tags: string[];
  photos: Photo[];
}

interface Props {
  coords: { lat: number; long: number };
  onSubmit(data: PointData): void;
  onCancel(): void;
}

export default function CreatePointModal({
  coords,
  onSubmit,
  onCancel,
}: Props) {
  const [descriptor, setDescriptor] = useState("");
  const [tags, setTags] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [caption, setCaption] = useState("");

  if (!coords) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.error("Could not load file");
      return;
    }

    const url = URL.createObjectURL(file);
    try {
      new URL(url);
      setPhotoUrl(url);
    } catch {
      alert("Invalid Image URL");
    }
  };

  const handleTags = (s: string) => {
    return s
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length);
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create New Point</h2>
        <p>
          Coordinates: {coords.lat.toFixed(4)}, {coords.long.toFixed(4)}
        </p>
        <label>Descriptor</label>
        <input
          type="text"
          value={descriptor}
          onChange={(e) => setDescriptor(e.target.value)}
        />
        <label>Tags (comma-separated)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <label>Photo Caption</label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <label>Photo URL</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {photoUrl && <img src={photoUrl} className="modal-photo" />}
        <div className="modal-buttons">
          <button
            onClick={() =>
              onSubmit({
                lat: coords.lat,
                long: coords.long,
                descriptor,
                tags: handleTags(tags),
                photos: [{ url: photoUrl, caption }],
              })
            }
          >
            Create
          </button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
