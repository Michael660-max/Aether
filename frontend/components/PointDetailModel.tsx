import React from "react";
import { CreatePointData as Point } from "../components/CreatePointModal";
import "../styles/PointDetailModel.css";

type Props = {
  point: Point;
  onClose: () => void;
};

export default function PointDetailModel({ point, onClose }: Props) {
  if (!point) return null;
  console.log(point);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
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
