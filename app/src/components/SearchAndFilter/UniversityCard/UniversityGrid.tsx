import React from "react";
import UniversityCard, {
  type UniversityCardProps,
} from "@/components/SearchAndFilter/UniversityCard/UniversityCard";

interface UniversityGridProps {
  universities: UniversityCardProps[];
  onShowProfessors?: (payload: {
    university: string;
    country: string;
    subject: string;
  }) => void;
}

const UniversityGrid: React.FC<UniversityGridProps> = ({
  universities,
  onShowProfessors,
}) => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start justify-items-center sm:justify-items-stretch">
        {universities.map((uni, index) => (
          <UniversityCard
            key={index}
            name={uni.name}
            country={uni.country}
            city={uni.city}
            ranking={uni.ranking}
            professors={uni.professors}
            image={uni.image}
            logoImage={uni.logoImage}
            subject={uni.subject}
            rankingSubj={uni.rankingSubj}
            internationalStudents={uni.internationalStudents}
            onShowProfessors={onShowProfessors}
          />
        ))}
      </div>
    </div>
  );
};

export default UniversityGrid;
