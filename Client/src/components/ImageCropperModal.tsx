import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (base64Cropped: string) => void;
  title?: string;
  circularMask?: boolean;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  onClose,
  onCropComplete,
  title = "Crop & Upload Photo",
  circularMask = true
}) => {
  const [imgSource, setImgSource] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset states on close or open
  useEffect(() => {
    if (!isOpen) {
      setImgSource(null);
      setZoom(1);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImgSource(reader.result as string);
        setZoom(1);
        setDragOffset({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imgSource) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imgSource) return;
    setDragOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imgSource || e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - dragOffset.x, y: touch.clientY - dragOffset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !imgSource || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setDragOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleSaveCrop = () => {
    if (!imgSource || !imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;
    
    // Create a virtual canvas to extract the crop area
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 300, 300);

    if (circularMask) {
      ctx.beginPath();
      ctx.arc(150, 150, 150, 0, Math.PI * 2);
      ctx.clip();
    }

    const cWidth = container.clientWidth;
    const cHeight = container.clientHeight;
    
    const natWidth = img.naturalWidth;
    const natHeight = img.naturalHeight;

    const containerRatio = Math.min(cWidth / natWidth, cHeight / natHeight);
    
    const fitWidth = natWidth * containerRatio;
    const fitHeight = natHeight * containerRatio;

    const scale = zoom;
    const w = fitWidth * scale;
    const h = fitHeight * scale;
    const dx = (cWidth - w) / 2 + dragOffset.x;
    const dy = (cHeight - h) / 2 + dragOffset.y;

    const canvasScale = 300 / cWidth;
    ctx.drawImage(img, dx * canvasScale, dy * canvasScale, w * canvasScale, h * canvasScale);
    
    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.85);
    onCropComplete(croppedBase64);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-premium overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/20">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all btn-tap-effect"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 flex flex-col items-center justify-center space-y-6 overflow-y-auto">
          {!imgSource ? (
            /* Upload Selection Stage */
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-64 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-blue-400 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer p-6 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/20 group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload size={22} />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Browse Image File</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Supports PNG, JPG, or JPEG formats up to 5MB</p>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </div>
          ) : (
            /* Cropper Editor Stage */
            <div className="w-full flex flex-col items-center space-y-5">
              {/* Crop Container */}
              <div 
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                className="w-64 h-64 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl relative overflow-hidden cursor-move select-none touch-none"
              >
                {/* Crop Circle Overlay */}
                <div 
                  className={`absolute inset-0 border-[24px] border-slate-900/40 pointer-events-none z-10 flex items-center justify-center ${
                    circularMask ? 'rounded-full scale-[1.01]' : ''
                  }`}
                  style={{
                    boxShadow: circularMask ? '0 0 0 9999px rgba(15, 23, 42, 0.5)' : 'none',
                    borderColor: 'rgba(15, 23, 42, 0.45)'
                  }}
                >
                  <div className={`w-[208px] h-[208px] border-2 border-white border-dashed pointer-events-none ${
                    circularMask ? 'rounded-full' : 'rounded-lg'
                  }`}></div>
                </div>

                {/* Transform Image */}
                <img
                  ref={imageRef}
                  src={imgSource}
                  alt="Source"
                  draggable={false}
                  className="max-w-none origin-center pointer-events-none select-none transition-transform duration-75"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${zoom})`,
                    maxHeight: '100%',
                    maxWidth: '100%'
                  }}
                />
              </div>

              {/* Slider Panel */}
              <div className="w-full space-y-4">
                <div className="flex items-center gap-3">
                  <ZoomOut size={16} className="text-slate-400" />
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <ZoomIn size={16} className="text-slate-400" />
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>Zoom: {zoom.toFixed(1)}x</span>
                  <button 
                    onClick={() => {
                      setZoom(1);
                      setDragOffset({ x: 0, y: 0 });
                    }}
                    className="text-primary dark:text-blue-400 hover:underline btn-tap-effect"
                  >
                    Reset View
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/20 flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all btn-tap-effect"
          >
            Cancel
          </button>
          
          {imgSource && (
            <button 
              onClick={handleSaveCrop}
              className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-md shadow-primary/10 transition-all btn-tap-effect"
            >
              Crop & Apply
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default ImageCropperModal;
