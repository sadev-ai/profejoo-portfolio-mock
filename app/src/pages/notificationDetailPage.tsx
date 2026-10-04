// src/pages/NotificationDetailPage.tsx
import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import ExpandableProfessorCard, {
  type Professor,
} from "@/components/SearchAndFilter/ProfessorCard/ProfessorExpandableCard";

// ---- Mock data for now (you'll later replace with data from API) ----
const MOCK_PROFESSORS: Professor[] = [
  {
    id: "p1",
    name: "Dr. Sarah Chen",
    university: "Stanford University",
    field: "Computer Science | AI",
    department: "Computer Science",
    tags: ["Deep Learning", "Computer Vision", "Neural Networks"],
    stats: {
      yearsActivity: 12,
      hIndex: 42,
      citations: 1245,
    },
    avatar: "https://via.placeholder.com/160x160.png?text=SC",
    about:
      "Dr. Chen focuses on deep learning methods for large-scale visual understanding.",
    highlights: [
      "Leads a research group on multimodal AI",
      "Published 50+ top-tier conference papers",
    ],
  } as Professor,
  {
    id: "p2",
    name: "Dr. Michael Rodriguez",
    university: "MIT",
    field: "Robotics | Engineering",
    department: "Mechanical Engineering",
    tags: ["Autonomous Systems", "Human-Robot Interaction"],
    stats: {
      yearsActivity: 10,
      hIndex: 35,
      citations: 892,
    },
    avatar: "https://via.placeholder.com/160x160.png?text=MR",
    about:
      "Dr. Rodriguez works on robust control for collaborative robots in dynamic environments.",
    highlights: [
      "Co-founded a robotics startup",
      "Leads multiple industry collaborations",
    ],
  } as Professor,
  {
    id: "p3",
    name: "Dr. Emily Thompson",
    university: "Carnegie Mellon University",
    field: "Data Science | ML",
    department: "Computer Science",
    tags: ["Natural Language Processing", "Big Data Analytics"],
    stats: {
      yearsActivity: 9,
      hIndex: 38,
      citations: 1089,
    },
    avatar: "https://via.placeholder.com/160x160.png?text=ET",
    about:
      "Dr. Thompson researches scalable ML systems for large-scale language modeling.",
    highlights: ["PI of multiple funded research projects"],
  } as Professor,
];

const NotificationDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // later you can change this to depend on notification type / data_json
  const professors = useMemo(() => MOCK_PROFESSORS, [id]);

  return (
    <div className="min-h-screen bg-[#f5f7fb] px-4 py-6 md:px-10 md:py-10">
      <div className="mx-auto max-w-6xl">
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate(ROUTES.DASHBOARD_NOTIFICATIONS)}
          className="mb-6 flex items-center gap-2 text-sm text-sky-600 hover:underline"
        >
          <span className="text-lg">←</span>
          <span>Back to Notifications</span>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Weekly Recommended Professors
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-3xl">
            Based on your research interests and profile, we've selected these
            professors for you this week. These recommendations match your areas
            of expertise and could be great collaboration opportunities.
          </p>

        </div>

        {/* Professor cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {professors.map((prof) => (
            <ExpandableProfessorCard
              key={prof.id}
              professor={prof}
              height={430}
              expandable={false}
            />
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-slate-500">
          New recommendations are generated every week based on your profile
          updates and activity.
        </p>
      </div>
    </div>
  );
};

export default NotificationDetailPage;
