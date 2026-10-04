// src/context/ResumeContext.tsx
import * as React from "react";
import * as resumeService from "@/services/resume.service";
import type { BackendResumeResponse, ResumeListItem } from "@/services/resume.service";
import { useAuth } from "@/hooks/useAuth";
import { calculateCompleteness as calculateResumeCompleteness } from "@/lib/resumeAdapter";

type ResumeContextType = {
  resumes: ResumeListItem[];
  loading: boolean;
  error: string | null;
  refreshResumes: () => Promise<void>;
  createResume: (payload: resumeService.BackendResumePayload) => Promise<BackendResumeResponse>;
  createResumeFromProfile: (title?: string, template?: string) => Promise<BackendResumeResponse>;
  importResume: (file: File) => Promise<BackendResumeResponse>;
  getResume: (id: number | string) => Promise<BackendResumeResponse>;
  updateResume: (id: number | string, updates: Partial<resumeService.BackendResumePayload>) => Promise<BackendResumeResponse>;
  deleteResume: (id: number | string) => Promise<void>;
  duplicateResume: (id: number | string, newTitle?: string) => Promise<BackendResumeResponse>;
  clearError: () => void;
};

const ResumeContext = React.createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [resumes, setResumes] = React.useState<ResumeListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const refreshResumes = React.useCallback(async () => {
    if (!isAuthenticated) { setResumes([]); setLoading(false); return; }
    try {
      setLoading(true); setError(null);
      const response = await resumeService.listResumes();
      setResumes(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load resumes"); setResumes([]);
    } finally { setLoading(false); }
  }, [isAuthenticated]);

  const createResume = React.useCallback(
    async (payload: resumeService.BackendResumePayload): Promise<BackendResumeResponse> => {
      try {
        setError(null);
        
        let score = payload.completeness;
        if (score === undefined && payload.tags) {
          const compTag = payload.tags.find((t: string) => typeof t === 'string' && t.startsWith("completeness:"));
          if (compTag) score = parseInt(compTag.replace("completeness:", ""), 10);
        }
        
        if (score === undefined && payload.sections) {
           score = calculateResumeCompleteness(payload.sections);
        }

        if (score !== undefined) {
           payload.tags = (payload.tags || []).filter((t: string) => typeof t === 'string' && !t.startsWith("completeness:"));
           payload.tags.push(`completeness:${score}`);
           payload.completeness = score;
        }

        // 👈 Definitively prevent backend AI interference when creating a resume, whether from Scratch or from Profile
        payload.source = payload.source || "manual";

        const newResume = await resumeService.createResume(payload);
        
        await refreshResumes();
        
        setResumes((prev) => prev.map((r) => r.id === newResume.id ? { ...r, completeness: score || 0 } : r));
        return { ...newResume, completeness: score || 0 };
      } catch (err: any) { throw err; }
    }, [refreshResumes]
  );

  const createResumeFromProfile = React.useCallback(
    async (title?: string, template?: string): Promise<BackendResumeResponse> => {
      try {
        setError(null);
        const newResume = await resumeService.createResumeFromProfile(title, template);
        
        let finalScore = newResume.completeness;
        if (finalScore === undefined) {
           const existingTags = newResume.tags || (newResume.data?.tags) || [];
           const compTag = existingTags.find((t: string) => typeof t === 'string' && t.startsWith("completeness:"));
           if (compTag) finalScore = parseInt(compTag.replace("completeness:", ""), 10);
        }

        await refreshResumes();
        
        setResumes((prev) => prev.map((r) => r.id === newResume.id ? { ...r, completeness: finalScore || 0 } : r));
        
        return { ...newResume, completeness: finalScore || 0 };
      } catch (err: any) { throw err; }
    }, [refreshResumes]
  );

  const importResume = React.useCallback(
    async (file: File): Promise<BackendResumeResponse> => {
      try {
        setError(null);
        const newResume = await resumeService.importResume(file);
        const calculatedCompleteness = calculateResumeCompleteness(newResume.sections || newResume.data?.sections);
        
        try {
           const existingTags = newResume.tags || (newResume.data?.tags) || [];
           const cleanTags = existingTags.filter((t: string) => typeof t === 'string' && !t.startsWith("completeness:"));
           cleanTags.push(`completeness:${calculatedCompleteness}`);
           await resumeService.updateResume(newResume.id || newResume.data?.id, { tags: cleanTags });
        } catch(e) {}

        await refreshResumes();
        setResumes((prev) => prev.map((r) => r.id === newResume.id ? { ...r, completeness: calculatedCompleteness } : r));
        return { ...newResume, completeness: calculatedCompleteness };
      } catch (err: any) { throw err; }
    }, [refreshResumes]
  );

  const getResume = React.useCallback(
    async (id: number | string): Promise<BackendResumeResponse> => {
      try {
        setError(null);
        const resume = await resumeService.getResume(id);
        const calculatedCompleteness = calculateResumeCompleteness(resume.sections || resume.data?.sections);
        
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        setResumes((prev) => prev.map((r) => r.id === numericId ? { ...r, completeness: calculatedCompleteness } : r));
        return { ...resume, completeness: calculatedCompleteness };
      } catch (err: any) { throw err; }
    }, []
  );

  const updateResume = React.useCallback(
    async (id: number | string, updates: Partial<resumeService.BackendResumePayload>): Promise<BackendResumeResponse> => {
      try {
        setError(null);
        
        if (updates.sections) {
          const score = calculateResumeCompleteness(updates.sections);
          updates.tags = (updates.tags || []).filter((t: string) => typeof t === 'string' && !t.startsWith("completeness:"));
          updates.tags.push(`completeness:${score}`);
        }

        // 👈 Definitively prevent backend AI interference during resume editing and auto-save
        updates.source = updates.source || "manual";

        const updatedResume = await resumeService.updateResume(id, updates);
        const calculatedCompleteness = calculateResumeCompleteness(updatedResume.sections || updatedResume.data?.sections);
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        
        setResumes((prev) => prev.map((r) => r.id === numericId ? {
          ...r,
          title: updatedResume.title,
          style: updatedResume.style || r.style,
          status: updatedResume.status || r.status,
          completeness: calculatedCompleteness,
          updated_at: updatedResume.updated_at
        } : r));
        return { ...updatedResume, completeness: calculatedCompleteness };
      } catch (err: any) { throw err; }
    }, []
  );

  const deleteResume = React.useCallback(
    async (id: number | string): Promise<void> => {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      try {
        setError(null);
        await resumeService.deleteResume(numericId);
        setResumes((prev) => prev.filter((r) => r.id !== numericId));
      } catch (err: any) {
        if (err.response?.status === 404 || err.status === 404) {
          setResumes((prev) => prev.filter((r) => r.id !== numericId));
          return;
        }
        throw err;
      }
    }, []
  );

  const duplicateResume = React.useCallback(
    async (id: number | string, newTitle?: string): Promise<BackendResumeResponse> => {
      try {
        setError(null);
        const duplicated = await resumeService.duplicateResume(id, newTitle);
        const calculatedCompleteness = calculateResumeCompleteness(duplicated.sections || duplicated.data?.sections);
        const resumeWithCompleteness = { ...duplicated, completeness: calculatedCompleteness };
        setResumes((prev) => [resumeWithCompleteness, ...prev]);
        return resumeWithCompleteness;
      } catch (err: any) { throw err; }
    }, []
  );

  const clearError = React.useCallback(() => setError(null), []);
  const hasLoadedRef = React.useRef(false);

  React.useEffect(() => {
    if (isAuthenticated && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      refreshResumes();
    } else if (!isAuthenticated) {
      hasLoadedRef.current = false;
      setResumes([]);
      setLoading(false);
    }
  }, [isAuthenticated, refreshResumes]);

  const value: ResumeContextType = { resumes, loading, error, refreshResumes, createResume, createResumeFromProfile, importResume, getResume, updateResume, deleteResume, duplicateResume, clearError };
  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
}

export function useResume() {
  const context = React.useContext(ResumeContext);
  if (context === undefined) throw new Error("useResume must be used within a ResumeProvider");
  return context;
}