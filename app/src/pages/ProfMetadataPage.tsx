// pages/ProfMetadataPage.tsx
import React, { useEffect, useState } from "react";
import { type Professor } from "@/components/ProfessorMetadata/types";
import TopCard from "@/components/ProfessorMetadata/Topcard/TopCard";
import HighlightsCard from "@/components/ProfessorMetadata/HighlightsCard";
import BiographyCard from "@/components/ProfessorMetadata/BiographyCard";
import ArticleCarousel from "@/components/ProfessorMetadata/Papers/ArticleCarousel";
import { useParams } from "react-router-dom";
import {
  getProfessorMetadata,
  type ProfessorMetadata,
} from "@/services/profmd.service";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/footer/Footer";
import Chatbot from "@/components/FaqChatbot/Chatbot";

type MetadataParams = {
  profId?: string;
};

const mockProfessor: Professor = {
  name: "Dr. Mehrdad Ashtiani",
  department: "Department of Computer Science",
  university: "Iran University Of Science and Technology",
  city: "Tehran",
  country: "Iran",
  avatarUrl:
    "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=800",
  stats: { citations: 15000, hIndex: 45, yearsOfActivity: 45 },
  tags: [
    "Machine Learning",
    "Computer Vision",
    "NLP",
    "Artificial Intelligence",
    "Neural Networks",
    "Large Language Models",
  ],
  links: {
    scholar: "https://scholar.google.com/",
    openalex: "https://openalex.org/",
    orcid: "https://orcid.org/",
    linkedin: "https://www.linkedin.com/",
    website: "https://example.com/",
  },
  highlights: [
    "NSF CAREER Award Recipient (2015)",
    "ACM Prize in Computing (2019)",
    "Published 100+ peer-reviewed papers",
    "Led development of widely-used ML framework with 50K+ GitHub stars",
  ],
  biography:
    `Dr. Sarah Mitchell is a distinguished professor of Computer Science at MIT, where she leads the Artificial Intelligence Research Lab. 
She received her Ph.D. from Stanford University in 2005 and has since made significant contributions to the field of machine learning and natural language processing. 
Her groundbreaking work on neural network architectures has been cited over 15,000 times and has influenced the development of modern AI systems.`,
};

const deriveYearsOfActivity = (
  yearsActive?: ProfessorMetadata["years_active"]
): number => {
  if (typeof yearsActive === "number") return yearsActive;
  if (typeof yearsActive === "string") {
    const matches = yearsActive.match(/\d{4}/g);
    if (matches?.length) {
      const startYear = Number(matches[0]);
      const endYear = matches[1]
        ? Number(matches[1])
        : new Date().getFullYear();
      if (!Number.isNaN(startYear)) {
        const validEndYear = Number.isNaN(endYear)
          ? new Date().getFullYear()
          : endYear;
        return Math.max(validEndYear - startYear + 1, 0);
      }
    }
  }
  return 0;
};

const mapProfessorMetadataToViewModel = (
  data: ProfessorMetadata
): Professor => {
  const primaryUniversity = data.primary_university ?? data.universities?.[0];
  const yearsOfActivity = deriveYearsOfActivity(data.years_active);
  const apiTags =
    Array.isArray(data.tags) && data.tags.length > 0
      ? data.tags
      : data.subject
        ? [data.subject]
        : [];

  const apiHighlights =
    Array.isArray(data.highlights) && data.highlights.length > 0
      ? data.highlights
      : [
          data.works_count !== undefined
            ? `${data.works_count} published works`
            : undefined,
          data.cited_by_count !== undefined
            ? `${data.cited_by_count} citations`
            : undefined,
        ].filter(Boolean) as string[];

  return {
    name: data.display_name ?? mockProfessor.name,
    department:
      data.department ?? data.subject ?? mockProfessor.department,
    university: primaryUniversity?.name ?? mockProfessor.university,
    city: primaryUniversity?.city ?? mockProfessor.city,
    country: primaryUniversity?.country ?? mockProfessor.country,
    avatarUrl:
      data.photo_url ??
      primaryUniversity?.logo_url ??
      mockProfessor.avatarUrl,
    stats: {
      citations: data.cited_by_count ?? mockProfessor.stats.citations,
      hIndex: data.h_index ?? mockProfessor.stats.hIndex,
      yearsOfActivity:
        yearsOfActivity || mockProfessor.stats.yearsOfActivity,
    },
    tags: apiTags.length > 0 ? apiTags : mockProfessor.tags,
    links: {
      scholar: data.scholar_link ?? mockProfessor.links.scholar,
      openalex: data.openalex_id ?? mockProfessor.links.openalex,
      orcid: data.orcid ?? mockProfessor.links.orcid,
      linkedin: mockProfessor.links.linkedin,
      website: primaryUniversity?.website ?? mockProfessor.links.website,
    },
    highlights:
      apiHighlights.length > 0 ? apiHighlights : mockProfessor.highlights,
    biography: data.bio ?? mockProfessor.biography,
  };
};

const ProfMetadataPage: React.FC = () => {
  const { profId } = useParams<MetadataParams>();
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    setIsLoading(true);
    getProfessorMetadata(profId)
      .then((data) => {
        if (!isMounted) return;
        setProfessor(mapProfessorMetadataToViewModel(data));
      })
      .catch((err) => {
        console.error("[PROF-MD] Failed to fetch professor metadata:", err);
        setProfessor(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [profId]);

  if (!professor && isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center bg-slate-50">
        <Navbar />
        <div className="flex flex-col justify-start max-w-6xl md:mx-12 space-y-8 py-28 px-4 md:px-8">
          <div className="text-center text-gray-500">Loading professor data...</div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentProfessor = professor ?? mockProfessor;
  const articles = [
    {
      id: "1",
      title: "Title Of The Articlelk sdsdfsljd",
      authors: ["Dr. Mehrdad Ashtiani", "Dr. Mohammadreza"],
      semester: "Spring 2025",
      citations: 500,
    },
    {
      id: "2",
      title: "Revisiting Sparse Attention for Long-Context Models",
      authors: ["Dr. Mehrdad Ashtiani", "Dr. L. Haddad"],
      semester: "Fall 2024",
      citations: 210,
    },
    {
      id: "3",
      title: "Self-Supervised Vision Transformers in Robotics",
      authors: ["Dr. Mehrdad Ashtiani", "Dr. S. Karimi"],
      semester: "Spring 2024",
      citations: 145,
    },
    {
      id: "4",
      title: "Efficient Multimodal Retrieval with Contrastive Pretraining",
      authors: ["Dr. Mehrdad Ashtiani", "Dr. N. Jamali"],
      semester: "Fall 2023",
      citations: 98,
    },
    {
      id: "5",
      title: "Uncertainty-Aware NLP for Clinical Decision Support",
      authors: ["Dr. Mehrdad Ashtiani", "Dr. A. Rahimi"],
      semester: "Spring 2023",
      citations: 76,
    },
    {
      id: "6",
      title: "Graph Neural Networks for Urban Traffic Forecasting",
      authors: ["Dr. Mehrdad Ashtiani", "Dr. P. Moradi"],
      semester: "Fall 2022",
      citations: 64,
    },
    {
      id: "7",
      title: "Federated Learning with Noisy Labels at Scale",
      authors: ["Dr. Mehrdad Ashtiani", "Dr. H. Ghaffari"],
      semester: "Spring 2022",
      citations: 58,
    },
    {
      id: "8",
      title: "Composable Agents for Scientific Literature Review",
      authors: ["Dr. Mehrdad Ashtiani", "Dr. R. Tavakoli"],
      semester: "Fall 2021",
      citations: 44,
    },
    {
      id: "9",
      title: "Continual Learning for Low-Resource Languages",
      authors: ["Dr. Mehrdad Ashtiani", "Dr. M. Farzan"],
      semester: "Spring 2021",
      citations: 39,
    },
    {
      id: "10",
      title: "Robust Adversarial Training in Vision Systems",
      authors: ["Dr. Mehrdad Ashtiani", "Dr. E. Shafi"],
      semester: "Fall 2020",
      citations: 31,
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-slate-50">
      <Navbar />

      <div className="w-full px-4 md:px-8 pt-28 pb-10">
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="flex gap-6 items-start">
            {/* LEFT CONTENT */}
            <div className="flex-1 min-w-0">
              <div className="space-y-8">
                <TopCard prof={currentProfessor} />

                <section className="flex flex-col md:flex-row gap-6">
                  <HighlightsCard items={currentProfessor.highlights} />
                  <BiographyCard text={currentProfessor.biography} />
                </section>

                {/* Articles */}
                <ArticleCarousel articles={articles} />
              </div>
            </div>

            {/* RIGHT CHATBOT */}
            {/* <aside className="hidden lg:block w-[420px] shrink-0">
              <div className="sticky top-28 h-[calc(100vh-7rem)] w-[420px]">
                <Chatbot page="md" />
              </div>
            </aside> */}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfMetadataPage;
