import React, { useState } from "react";
import "../styles/CreatePointModal.css";

export interface CreatePointData {
  lat: number;
  long: number;
  descriptor: string;
  tags: string;
  photoUrl: string;
}

interface Props {
  coords: { lat: number; long: number };
  onSubmit(data: CreatePointData): void;
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
  
  console.log('CreatePointModal render, coords=', coords);
  if (!coords) return null;

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
        <label>Photo URL</label>
        <input
          type="text"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
        />
        <div className="modal-buttons">
          <button
            onClick={() =>
              onSubmit({
                lat: coords.lat,
                long: coords.long,
                descriptor,
                tags,
                photoUrl,
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
