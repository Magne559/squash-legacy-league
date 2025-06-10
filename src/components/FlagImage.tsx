
import { useState } from "react";

interface FlagImageProps {
  src: string;
  alt: string;
  className?: string;
  nationality?: string;
}

export const FlagImage = ({ src, alt, className = "w-6 h-4", nationality }: FlagImageProps) => {
  const [imageError, setImageError] = useState(false);

  // If the image fails to load or we have an error, show a fallback
  if (imageError || !src) {
    return (
      <div 
        className={`${className} bg-gradient-to-r from-gray-400 to-gray-600 rounded-sm flex items-center justify-center text-xs text-white font-bold`}
        title={alt}
      >
        {nationality ? nationality.slice(0, 2).toUpperCase() : '??'}
      </div>
    );
  }

  return (
    <img 
      src={src}
      alt={alt}
      className={`${className} object-cover rounded-sm border border-gray-600/30`}
      onError={() => setImageError(true)}
      onLoad={() => setImageError(false)}
    />
  );
};
