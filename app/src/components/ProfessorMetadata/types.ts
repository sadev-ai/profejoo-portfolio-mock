// types.ts
export type Professor = {
  name: string;
  department: string;
  university: string;
  city: string;
  country: string;
  avatarUrl: string;
  stats: {
    citations: number;
    hIndex: number;
    yearsOfActivity: number;
  };
  tags: string[];
  links: {
    scholar?: string;
    openalex?: string;
    orcid?: string;
    linkedin?: string;
    website?: string;
  };
  highlights: string[];
  biography: string;
};
