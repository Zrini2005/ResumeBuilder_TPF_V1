import React, { forwardRef } from "react";
import type { ResumeData } from "../../types";

interface ResumePreviewProps {
  resumeData: ResumeData;
}

const HeaderSection = ({ title }: { title: string }) => (
  <h3 className="text-lg font-bold tracking-widest text-gray-800 uppercase mb-1">
    {title}
  </h3>
);

// Custom List Item for consistency
const CustomListItem: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <li className="relative pl-5 mb-1 last:mb-0 before:content-[''] before:absolute before:left-0 before:top-[0.55em] before:w-1.5 before:h-1.5 before:bg-gray-600 before:rounded-full leading-relaxed">
    {children}
  </li>
);

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ resumeData }, ref) => {
    const {
      personalDetails,
      education,
      projects,
      internships,
      achievements,
      skills,
      positions,
      activities,
      webLinks,
      coursework,
    } = resumeData;

    const renderHTML = (text: string) => {
      if (!text) return "";
      let processedText = text
        .replace(/<b>/g, "<strong>")
        .replace(/<\/b>/g, "</strong>");
      return processedText.replace(/\n/g, "<br />");
    };

    return (
      <div
        ref={ref}
        className="bg-white min-h-[297mm] w-full px-8 pt-5 pb-8 text-gray-800"
        style={{ fontFamily: "Lato, sans-serif" }}
      >
        {/* Header */}
        <header className="text-center mb-2">
          <h1 className="text-4xl font-light text-gray-900 mb-1 tracking-wide">
            {personalDetails.name}
          </h1>

          <div className="text-sm text-gray-600 flex justify-center items-center gap-2 mt-1 font-medium">
            {personalDetails.email && <span>{personalDetails.email}</span>}
            {personalDetails.email && personalDetails.contact && (
              <span className="text-gray-400">|</span>
            )}
            {personalDetails.contact && <span>{personalDetails.contact}</span>}
          </div>
        </header>

        <hr className="border-t border-gray-300 mb-5 -mx-8" />

        {/* Two Column Layout */}
        <div className="flex flex-row gap-6">
          {/* Left Column (Approx 35-40%) */}
          <div className="w-[35%] flex-shrink-0 flex flex-col gap-5">
            {/* EDUCATION */}
            {education && education.length > 0 && (
              <section>
                <HeaderSection title="Education" />
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <div className="font-bold text-base uppercase text-gray-900">
                        {edu.institution}
                      </div>
                      <div className="font-bold text-sm text-gray-700">
                        {edu.degree}
                      </div>
                      <div className="text-sm text-gray-600 italic">
                        {edu.year}
                      </div>
                      <div className="text-sm text-gray-600">{edu.grade}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* LINKS */}
            {webLinks && webLinks.length > 0 && (
              <section>
                <HeaderSection title="Links" />
                <div className="space-y-1 text-sm">
                  {webLinks.map((link) => (
                    <div key={link.id}>
                      <span className="text-gray-600">{link.name}://</span>{" "}
                      <span className="font-medium text-gray-700">
                        {link.url}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* COURSEWORK */}
            {coursework && coursework.length > 0 && (
              <section>
                <HeaderSection title="Coursework" />
                <div className="space-y-3">
                  {coursework.map((cw) => (
                    <div key={cw.id}>
                      <div className="font-bold text-sm uppercase mb-1 text-gray-800">
                        {cw.category}
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {cw.subjects.split("\n").map((subj, i) => (
                          <div key={i}>{subj}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SKILLS */}
            {skills && skills.length > 0 && (
              <section>
                <HeaderSection title="Skills" />
                <div className="space-y-3">
                  {skills.map((skill) => (
                    <div key={skill.id}>
                      <div className="font-bold text-sm uppercase mb-1 text-gray-800">
                        {skill.category}
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {skill.skills}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column (Approx 60-65%) */}
          <div className="flex-grow flex flex-col gap-5">
            {/* INTERNSHIP EXPERIENCE */}
            {internships && internships.length > 0 && (
              <section>
                <HeaderSection title="Internship Experience" />
                <div className="space-y-4">
                  {internships.map((intern) => (
                    <div key={intern.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <div className="font-bold text-base uppercase text-gray-900">
                          {intern.title}
                        </div>
                        <div className="text-sm text-gray-500 italic font-medium">
                          {intern.date}
                        </div>
                      </div>
                      <div
                        className="text-sm text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: renderHTML(intern.description),
                        }}
                      ></div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* PROJECTS */}
            {projects && projects.length > 0 && (
              <section>
                <HeaderSection title="Projects" />
                <div className="space-y-4">
                  {projects.map((proj) => (
                    <div key={proj.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <div className="font-bold text-base uppercase text-gray-900">
                          {proj.name}
                        </div>
                        <div className="text-sm text-gray-500 italic font-medium">
                          {proj.date}
                        </div>
                      </div>
                      <div
                        className="text-sm text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: renderHTML(proj.description),
                        }}
                      ></div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ACHIEVEMENTS AND INTERESTS */}
            {achievements && achievements.length > 0 && (
              <section>
                <HeaderSection title="Achievements and Interests" />
                <ul className="text-sm text-gray-700">
                  {achievements.map((ach) => (
                    <CustomListItem key={ach.id}>
                      <span
                        dangerouslySetInnerHTML={{ __html: ach.description }}
                      ></span>
                    </CustomListItem>
                  ))}
                </ul>
              </section>
            )}

            {/* POSITIONS OF RESPONSIBILITY */}
            {positions && positions.length > 0 && (
              <section>
                <HeaderSection title="Positions of Responsibility" />
                <ul className="text-sm text-gray-700">
                  {positions.map((pos) => (
                    <CustomListItem key={pos.id}>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: renderHTML(pos.description),
                        }}
                      ></span>
                    </CustomListItem>
                  ))}
                </ul>
              </section>
            )}

            {/* EXTRACURRICULAR ACTIVITIES */}
            {activities &&
              activities.map(
                (act) =>
                  act.title.includes("EXTRA") &&
                  act.description && (
                    <section key={act.id}>
                      <HeaderSection title="Extracurricular Activities" />
                      <ul className="text-sm text-gray-700">
                        {act.description.split("\n").map(
                          (line, i) =>
                            line.trim() && (
                              <CustomListItem key={i}>
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: line
                                      .replace(/<b>/g, "<strong>")
                                      .replace(/<\/b>/g, "</strong>"),
                                  }}
                                ></span>
                              </CustomListItem>
                            )
                        )}
                      </ul>
                    </section>
                  )
              )}
          </div>
        </div>
      </div>
    );
  }
);

export default ResumePreview;
