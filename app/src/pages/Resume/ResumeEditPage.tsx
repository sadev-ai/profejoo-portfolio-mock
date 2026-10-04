// src/pages/ResumeEditPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ResumeScratchPageNew from "./ResumeScratchPageNew";
import type { BackendResumeResponse } from "@/services/resume.service";
import { useResume } from "@/context/ResumeContext";
import { resumeToProfileData } from "@/lib/resumeAdapter";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";

export default function ResumeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getResume } = useResume();
  const [resume, setResume] = useState<BackendResumeResponse | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate(ROUTES.DASHBOARD_RESUME_MAKER, { replace: true });
      return;
    }

    const loadResume = async () => {
      try {
        setLoading(true);
        const fetchedResume = await getResume(id);
        setResume(fetchedResume);
      } catch (error: any) {
        console.error("[ResumeEditPage] Failed to load resume:", error);
        toast.error("Failed to load resume");
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [id, navigate, getResume]);

  if (loading) {
    return (
      <div className="profejoo flex h-dvh items-center justify-center">
        <p className="text-muted-foreground">Loading resume...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="profejoo flex h-dvh items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Resume not found</p>
          <button onClick={() => navigate(ROUTES.DASHBOARD_RESUME_MAKER)} className="text-primary hover:underline">
            Back to Resume Maker
          </button>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="profejoo flex h-dvh items-center justify-center">
        <p className="text-muted-foreground">No resume data</p>
      </div>
    );
  }

  const profileData = resumeToProfileData(resume);

  return (
    <ResumeScratchPageNew 
      initialData={profileData} 
      resumeId={id} 
      currentStatus={resume.status}
    />
  );
}