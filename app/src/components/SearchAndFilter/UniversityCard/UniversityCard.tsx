import { useState, type MouseEvent } from "react";
import { Heart, MapPin } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatCompactNumber } from "@/lib/utils";

/* !!!!!! Check Fonts Later!!!!! */

export interface UniversityCardProps {
  name: string;
  country: string;
  city: string;
  ranking: number;
  professors: number;
  image: string;
  logoImage: string;
  subject: string;
  rankingSubj: number;
  internationalStudents: number;
}

interface UniversityCardComponentProps extends UniversityCardProps {
  onShowProfessors?: (payload: {
    university: string;
    country: string;
    subject: string;
  }) => void;
}

const UniversityCard: React.FC<UniversityCardComponentProps> = ({
  name,
  country,
  city,
  ranking,
  professors,
  image,
  logoImage,
  subject,
  rankingSubj,
  internationalStudents,
  onShowProfessors,
}) => {
  const stop = (e: MouseEvent) => e.stopPropagation();
  const [liked, setLiked] = useState(false);

  const handleException = useMediaQuery("(min-width: 1024px) and (max-width: 1280px)");
  

  return (
    <div
      className="
        bg-white 
        rounded-[24px] 
        shadow-md 
        hover:shadow-2xl 
        transition-transform transition-shadow 
        duration-300 
        overflow-hidden 
        w-full 
        bg-gradient-to-b from-white to-[#B8DAE8]/35 
        max-w-sm 
        px-[12px] 
        py-[12px]
        transform
        hover:-translate-y-1
        hover:scale-[1.01]
      "
    >
      {/* Top Image with Overlay */}
      <div className="relative rounded-[24px] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-[230px] w-full object-cover rounded-[24px]"
        />

        {/* === Progressive Blur & Multi-Stop Gradient Overlay === */}
        <div
          className="absolute bottom-0 left-0 w-full h-[90px] backdrop-blur-[8px] rounded-b-[24px]"
          style={{
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 70%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.6) 90%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 70%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.6) 90%, rgba(0,0,0,0) 100%)",
          }}
        >
          <div
            className="absolute inset-0 rounded-b-[24px]"
            style={{
              background:
                "linear-gradient(to top, rgba(F,F,F,1) 0%, rgba(F,F,F,1) 70%, rgba(F,F,F,1) 80%, rgba(F,F,F,1) 90%, rgba(F,F,F,0.0) 100%)",
            }}
          ></div>
        </div>

        {/* === Text Overlay === */}
        <div className="absolute bottom-0 left-0 w-full px-4 pb-3 flex items-center justify-between">
          {/* Left side: name + location */}
          <div>
            <h2 className="text-white font-semibold text-base leading-tight drop-shadow-sm">
              {name}
            </h2>
            <p className="text-sm text-gray-200 flex items-center gap-1 mt-0.5">
              <MapPin size={14} className="text-white" />
              {country}, {city}
            </p>
          </div>

          {/* Right side: logo */}
          <img
            src={logoImage}
            alt={"logo"}
            className="h-auto w-12 object-contain rounded-[512px]"
          />
        </div>


        {/* Heart Button */}
        <button
          onClick={(e) => {
            stop(e);
            setLiked((l) => !l);
          }}
          className="absolute top-3 right-3 p-2 bg-black/65 backdrop-blur-sm rounded-full shadow-md hover:bg-black/75 transition"
          aria-pressed={liked}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <Heart
            className={`w-5 h-5 ${
              liked ? 'fill-red-500 text-red-500' : 'text-white'
            }`}
          />
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 items-center text-center mt-4 relative h-20">
        <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-px h-10 bg-gray-300"></div>
        <div className="absolute left-2/3 top-1/2 -translate-y-1/2 w-px h-10 bg-gray-300"></div>

        <div className="flex flex-col justify-start items-center h-full pt-4">
          <p className="text-xl font-semibold">{formatCompactNumber(rankingSubj)}</p>
          <p className={handleException ? "text-[10px] text-gray-500" : "text-xs text-gray-500"} >QS At {subject}</p>
        </div>

        <div className="flex flex-col justify-start items-center h-full pt-4">
          <p className="text-xl font-semibold">{formatCompactNumber(ranking)}</p>
          <p className={handleException ? "text-[10px] text-gray-500" : "text-xs text-gray-500"} >QS Ranking</p>
        </div>

        <div className="flex flex-col justify-start items-center h-full pt-4">
          <p className="text-xl font-semibold">{formatCompactNumber(internationalStudents)}</p>
          <p className={handleException ? "text-[10px] text-gray-500" : "text-xs text-gray-500"} >International Students</p>
        </div>
      </div>

      {/* Button */}
      <div className="flex flex-col items-center p-[8px]">
        <p className="text-xs text-gray-500">
          {formatCompactNumber(professors)} featured {professors === 1 ? "professor" : "professors"}
        </p>
        <button
          className="mt-4 w-auto bg-[#2FA3D9] hover:bg-[#238DBF] text-white font-stretch-50% py-2 px-[24px] rounded-md transition cursor-pointer active:scale-95"
          onClick={() =>
            onShowProfessors?.({
              university: name,
              country,
              subject,
            })
          }
        >
          Show Professors
        </button>
      </div>
    </div>
  );
};

export default UniversityCard;
