// src/lib/latexGenerator.ts

export const generateLatexString = (data: any): string => {
  // Helper function for escaping special LaTeX characters
  const escapeLatex = (str: string = "") => {
    if (!str) return "";
    return str.replace(/[&%$#_{}~^\\]/g, (match) => {
      if (match === '\\') return '\\textbackslash{}';
      if (match === '~') return '\\textasciitilde{}';
      if (match === '^') return '\\textasciicircum{}';
      return '\\' + match;
    });
  };

  // Extract contact info
  const email = data.contacts?.find((c: string) => c.includes('@')) || '';
  const phone = data.contacts?.find((c: string) => /[\d\+\-]{7,}/.test(c)) || '';
  const linkedin = data.contacts?.find((c: string) => c.toLowerCase().includes('linkedin')) || '';
  const website = data.contacts?.find((c: string) => 
    (c.includes('www') || c.includes('http')) && !c.toLowerCase().includes('linkedin')
  ) || '';

  const firstName = escapeLatex(data.name?.split(' ')[0] || '');
  const lastName = escapeLatex(data.name?.split(' ').slice(1).join(' ') || '');

  // LaTeX file header and initial settings (using the moderncv class)
  let tex = `\\documentclass[11pt,a4paper,sans]{moderncv}\n`;
  tex += `\\moderncvstyle{classic}\n`;
  tex += `\\moderncvcolor{blue}\n`;
  tex += `\\usepackage[scale=0.75]{geometry}\n\n`;

  // Personal information
  tex += `\\name{${firstName}}{${lastName}}\n`;
  if (data.headline) tex += `\\title{${escapeLatex(data.headline)}}\n`;
  if (phone) tex += `\\phone[mobile]{${escapeLatex(phone)}}\n`;
  if (email) tex += `\\email{${escapeLatex(email)}}\n`;
  if (website) tex += `\\homepage{${escapeLatex(website.replace(/^https?:\/\//, ''))}}\n`;
  
  // Extract the LinkedIn ID for nicer formatting in LaTeX
  if (linkedin) {
    const linkedinId = linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '');
    tex += `\\social[linkedin]{${escapeLatex(linkedinId)}}\n`;
  }
  
  tex += `\n\\begin{document}\n\\makecvtitle\n\n`;

  // Summary
  if (data.summary) {
    tex += `\\section{Summary}\n${escapeLatex(data.summary)}\n\n`;
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    tex += `\\section{Experience}\n`;
    data.experience.forEach((exp: any) => {
      tex += `\\cventry{${escapeLatex(exp.dates)}}{${escapeLatex(exp.title)}}{${escapeLatex(exp.org)}}{${escapeLatex(exp.location)}}{}{\n`;
      if (exp.bullets && exp.bullets.length > 0) {
        tex += `  \\begin{itemize}\n`;
        exp.bullets.forEach((bullet: string) => {
          tex += `    \\item ${escapeLatex(bullet)}\n`;
        });
        tex += `  \\end{itemize}\n`;
      } else if (exp.description) {
        tex += `  ${escapeLatex(exp.description)}\n`;
      }
      tex += `}\n\n`;
    });
  }

  // Education
  if (data.education && data.education.length > 0) {
    tex += `\\section{Education}\n`;
    data.education.forEach((edu: any) => {
      tex += `\\cventry{${escapeLatex(edu.dates)}}{${escapeLatex(edu.title)}}{${escapeLatex(edu.institution)}}{${escapeLatex(edu.location)}}{}{}\n`;
    });
    tex += `\n`;
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    tex += `\\section{Skills}\n`;
    data.skills.forEach((skill: any) => {
      tex += `\\cvitem{${escapeLatex(skill.name)}}{${escapeLatex(skill.items.join(', '))}}\n`;
    });
    tex += `\n`;
  }

  // Projects - handled completely separately
  if (data.projects && data.projects.length > 0) {
    tex += `\\section{Projects}\n`;
    data.projects.forEach((proj: any) => {
      tex += `\\cventry{${escapeLatex(proj.year)}}{${escapeLatex(proj.title)}}{${escapeLatex(proj.venue)}}{}{}{${escapeLatex(proj.summary)}}\n`;
    });
    tex += `\n`;
  }

  // Publications - handled completely separately
  if (data.publications && data.publications.length > 0) {
    tex += `\\section{Publications}\n`;
    data.publications.forEach((pub: any) => {
      tex += `\\cventry{${escapeLatex(pub.year)}}{${escapeLatex(pub.title)}}{${escapeLatex(pub.venue)}}{}{}{${escapeLatex(pub.summary)}}\n`;
    });
    tex += `\n`;
  }

  // Talks
  if (data.talks && data.talks.length > 0) {
    tex += `\\section{Talks}\n`;
    data.talks.forEach((talk: any) => {
      tex += `\\cventry{${escapeLatex(talk.year)}}{${escapeLatex(talk.title)}}{${escapeLatex(talk.venue)}}{}{}{${escapeLatex(talk.summary)}}\n`;
    });
    tex += `\n`;
  }

  // Honors & Awards
  if (data.honors && data.honors.length > 0) {
    tex += `\\section{Honors \\& Awards}\n`;
    data.honors.forEach((honor: any) => {
      tex += `\\cventry{${escapeLatex(honor.year)}}{${escapeLatex(honor.title)}}{${escapeLatex(honor.venue)}}{}{}{${escapeLatex(honor.summary)}}\n`;
    });
    tex += `\n`;
  }

  // Credentials
  if (data.credentials && data.credentials.length > 0) {
    tex += `\\section{Credentials}\n`;
    data.credentials.forEach((cred: any) => {
      tex += `\\cventry{${escapeLatex(cred.year)}}{${escapeLatex(cred.title)}}{${escapeLatex(cred.issuer)}}{}{}{}\n`;
    });
    tex += `\n`;
  }

  // Supplementary information (languages, interests, additional links)
  const hasLanguages = data.languages && data.languages.length > 0;
  const hasInterests = data.interests && data.interests.length > 0;
  const hasLinks = data.links && data.links.length > 0;

  if (hasLanguages || hasInterests || hasLinks) {
    tex += `\\section{Additional Info}\n`;
    if (hasLanguages) {
      tex += `\\cvitem{Languages}{${escapeLatex(data.languages.join(', '))}}\n`;
    }
    if (hasInterests) {
      tex += `\\cvitem{Interests}{${escapeLatex(data.interests.join(', '))}}\n`;
    }
    if (hasLinks) {
      const linksStr = data.links.map((l: any) => `${escapeLatex(l.title)}: ${escapeLatex(l.url)}`).join(', ');
      tex += `\\cvitem{Links}{${linksStr}}\n`;
    }
    tex += `\n`;
  }

  // Extracurricular activities (Extras)
  if (data.extras && data.extras.length > 0) {
    tex += `\\section{Extracurriculars}\n`;
    data.extras.forEach((ex: any) => {
      tex += `\\cvitem{${escapeLatex(ex.title)}}{${escapeLatex(ex.detail)}}\n`;
    });
    tex += `\n`;
  }

  tex += `\\end{document}\n`;
  
  return tex;
};