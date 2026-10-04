import React from "react";

type BackgroundImageProps = {
  /** Local image path, e.g. /images/hero-bg.jpg */
  src?: string;
  /** Optional alt text for accessibility */
  alt?: string;
};

const BackgroundImage: React.FC<BackgroundImageProps> = ({
  src = "/images/hero-bg.jpg",
  alt = "Hero background",
}) => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
};

export default BackgroundImage;