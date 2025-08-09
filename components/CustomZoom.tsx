import React from 'react';
import type MapView from '@arcgis/core/views/MapView';
import { Plus, Minus } from 'lucide-react';

interface CustomZoomProps {
  view: MapView;
  sidebarWidth: number;
}

const CustomZoom: React.FC<CustomZoomProps> = ({ view, sidebarWidth }) => {
  const handleZoomIn = () => {
    if (view) {
      const targetZoom = view.zoom + 1;
      view.goTo({
        zoom: targetZoom
      }, {
        duration: 200,
        easing: "ease-out"
      });
    }
  };

  const handleZoomOut = () => {
    if (view) {
      const targetZoom = view.zoom - 1;
      view.goTo({
        zoom: targetZoom
      }, {
        duration: 200,
        easing: "ease-out"
      });
    }
  };

  return (
    <div className="custom-zoom-control">
      <button
        onClick={handleZoomIn}
        className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-t-md hover:bg-gray-50 focus:outline-none focus:ring-0 focus:border-gray-200"
        aria-label="Zoom in"
      >
        <Plus className="h-4 w-4 text-gray-600" />
      </button>
      <button
        onClick={handleZoomOut}
        className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-b-md hover:bg-gray-50 focus:outline-none focus:ring-0 focus:border-gray-200"
        aria-label="Zoom out"
      >
        <Minus className="h-4 w-4 text-gray-600" />
      </button>
      <style jsx>{`
        .custom-zoom-control {
          position: absolute;
          bottom: 20px;
          left: 80px; /* Position 20px to the right of the 60px left toolbar */
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 1000;
        }

        .zoom-button {
          width: 32px;
          height: 32px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-family: Arial, sans-serif;
          cursor: pointer;
          padding: 0;
          margin: 0;
          color: #374151;
          transition: all 0.15s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          user-select: none;
          -webkit-user-select: none;
        }

        .zoom-button:hover {
          background: #f8f9fa;
          border-color: #d1d5db;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }

        .zoom-button:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .zoom-button:active {
          background: #f3f4f6;
          transform: translateY(0px);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          transition: all 0.05s ease;
        }
      `}</style>
    </div>
  );
};

export default CustomZoom; 