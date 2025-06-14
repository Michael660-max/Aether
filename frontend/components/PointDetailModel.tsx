import React from "react";
import { CreatePointData as Point } from "../components/CreatePointModal";
import "../styles/PointDetailModel.css";
import { Viewer } from "cesium";

type Props = {
  setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
  viewer: Viewer;
  point: Point;
  onClose: () => void;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

const onDelete = async (
  setPoints: React.Dispatch<React.SetStateAction<Point[]>>,
  viewer: Viewer,
  pointId: string,
  onClose: () => void
) => {
  try {
    onClose();
    viewer?.entities.removeById(pointId);
    setPoints((prev) => prev.filter((p) => p.id !== pointId));
    await axios.delete(`${API}/points/${pointId}`);
  } catch {
    console.error("Delete point failed");
  }
};

export default function PointDetailModel({
  setPoints,
  viewer,
  point,
  onClose,
}: Props) {
  if (!point) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={() => onDelete(setPoints, viewer, point.id, onClose)}
        >
          ✕
        </button>
        <h2 className="modal-title">{point.descriptor || "Untitled"}</h2>
        {point.photos.map((p, i) => (
          <div key={i} className="modal-photo-block">
            <img src={p.url} alt={p.caption} className="modal-photo" />
            {p.caption && <p className="modal-caption">{p.caption}</p>}
          </div>
        ))}
        {point.tags.length > 0 && (
          <div className="modal-tags">
            {point.tags.map((t) => (
              <span key={t} className="modal-tag">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
