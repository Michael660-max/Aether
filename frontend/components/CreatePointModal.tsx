import React, { useState, Dispatch, SetStateAction } from "react";
import "../styles/CreatePointModal.css";
import { useS3Upload as handleUpload } from "../hooks/useS3Upload";
import { Coords, API, Point } from "./CesiumViewer";
import { Cartesian3, VerticalOrigin, Viewer } from "cesium";
import { makeGlowSprite } from "../utils/glowSprite";
import axios from "axios";

const glowSprite = makeGlowSprite(256);

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
  setPoints: Dispatch<SetStateAction<Point[]>>;
  coords: { lat: number; long: number };
  viewer: Viewer;
  onSubmit(data: PointData): void;
  setNewCoords: React.Dispatch<React.SetStateAction<Coords | null>>;
  onCancel(): void;
}

export default function CreatePointModal({
  setPoints,
  coords,
  viewer,
  setNewCoords,
  onCancel,
}: Props) {
  const [descriptor, setDescriptor] = useState("");
  const [tags, setTags] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  if (!coords) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const publicUrl = await handleUpload(file);
      setPhotoUrl(publicUrl);
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

  const handleSubmit = async (data: PointData) => {
    const { data: newPt } = await axios.post<CreatePointData>(
      `${API}/points`,
      data
    );
    viewer?.entities.add({
      id: newPt.id,
      position: Cartesian3.fromDegrees(newPt.long, newPt.lat),
      billboard: {
        image: glowSprite,
        scale: 0.1,
        verticalOrigin: VerticalOrigin.BOTTOM,
      },
    });
    setPoints((ps) => [...ps, newPt]);
    setNewCoords(null);
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
              handleSubmit({
                lat: coords.lat,
                long: coords.long,
                descriptor,
                tags: handleTags(tags),
                photos: [{ url: photoUrl!, caption }],
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
