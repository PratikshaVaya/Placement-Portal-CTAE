const ResumePreview = ({ data }) => {
  if (!data) {
    return <div className="text-gray-500 text-center py-8">No resume data yet. Start filling in your details.</div>;
  }

  const formatDate = (startMonth, startYear, endMonth, endYear, isCurrent) => {
    const start = startMonth && startYear ? `${startMonth} ${startYear}` : '';
    const end = isCurrent ? 'Present' : endMonth && endYear ? `${endMonth} ${endYear}` : '';
    return start && end ? `${start} – ${end}` : start || end || '';
  };

  return (
    <div id="resume-print-area" className="bg-white p-6 font-sans text-sm leading-snug" style={{ fontSize: '10pt', color: 'black', boxSizing: 'border-box' }}>
      {/* Header */}
      <div className="text-center mb-1">
        <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
          {data.header?.firstName} {data.header?.lastName}
        </h1>
      </div>

      {/* Contact Info */}
      <div className="text-center text-xs mb-1">
        {[
          data.header?.address,
          data.header?.city,
          data.header?.state,
          data.header?.zipCode,
        ]
          .filter(Boolean)
          .join(', ')}{' '}
        • {data.header?.email} • {data.header?.phone}
      </div>
      {/* Profile Links */}
      <div className="text-center text-xs mb-2 pb-1 border-b border-gray-300">
        {[
          data.header?.linkedIn && {
            name: 'LinkedIn',
            url: data.header.linkedIn,
          },
          data.header?.github && {
            name: 'GitHub',
            url: data.header.github,
          },
          data.header?.leetcode && {
            name: 'LeetCode',
            url: data.header.leetcode,
          },
        ]
          .filter(Boolean)
          .map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener"
              className="text-blue-700 hover:underline"
            >
              {link.name}
            </a>
          ))
          .reduce((prev, curr) => [
            prev,
            ' • ',
            curr,
          ], [])}
      </div>

      {/* Education Section */}
      {data.education && data.education.length > 0 && (
        <div className="mb-2">
          <h2 className="font-bold text-xs uppercase border-b border-gray-300 mb-1 pb-0.5 text-gray-800">Education</h2>
          {data.education.map((edu, idx) => (
            <div key={idx} className="mb-1.5 leading-tight">
              <div className="flex justify-between items-baseline font-bold text-gray-900">
                <span>{edu.institution}</span>
                <span className="font-normal text-xs">{edu.city}{edu.state ? `, ${edu.state}` : ''}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="italic">{edu.degree}{edu.concentration && `, ${edu.concentration}`}</span>
                <span className="text-xs">{edu.graduationMonth && edu.graduationYear ? `${edu.graduationMonth} ${edu.graduationYear}` : ''}</span>
              </div>
              {(edu.gpa || edu.relevantCoursework) && (
                <div className="text-xs mt-0.5">
                  {edu.gpa && <span className="mr-3"><span className="font-semibold">GPA:</span> {edu.gpa}</span>}
                  {edu.relevantCoursework && <span><span className="font-semibold">Relevant Coursework:</span> {edu.relevantCoursework}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Experience Section */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-2">
          <h2 className="font-bold text-xs uppercase border-b border-gray-300 mb-1 pb-0.5 text-gray-800">Experience</h2>
          {data.experience.slice(0, 3).map((exp, idx) => (
            <div key={idx} className="mb-2 leading-tight">
              <div className="flex justify-between items-baseline font-bold text-gray-900">
                <span>{exp.organization}</span>
                <span className="font-normal text-xs">
                  {exp.city}{exp.location && `, ${exp.location}`}
                </span>
              </div>
              <div className="flex justify-between items-baseline italic mb-1">
                <span>{exp.positionTitle}</span>
                <span className="text-xs">
                  {formatDate(
                    exp.startMonth,
                    exp.startYear,
                    exp.endMonth,
                    exp.endYear,
                    exp.isCurrent
                  )}
                </span>
              </div>
              {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                <ul className="ml-4 text-xs list-disc space-y-0.5">
                  {exp.bulletPoints.slice(0, 4).map(
                    (bullet, bIdx) =>
                      bullet.text && (
                        <li key={bIdx}>
                          {bullet.text}
                        </li>
                      )
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Leadership & Activities Section */}
      {data.leadership && data.leadership.length > 0 && (
        <div className="mb-2">
          <h2 className="font-bold text-xs uppercase border-b border-gray-300 mb-1 pb-0.5 text-gray-800">Leadership & Activities</h2>
          {data.leadership.slice(0, 2).map((lead, idx) => (
            <div key={idx} className="mb-2 leading-tight">
              <div className="flex justify-between items-baseline font-bold text-gray-900">
                <span>{lead.organization}</span>
                <span className="font-normal text-xs">
                  {lead.city}{lead.state && `, ${lead.state}`}
                </span>
              </div>
              <div className="flex justify-between items-baseline italic mb-1">
                <span>{lead.role}</span>
                <span className="text-xs">
                  {formatDate(
                    lead.startMonth,
                    lead.startYear,
                    lead.endMonth,
                    lead.endYear,
                    lead.isCurrent
                  )}
                </span>
              </div>
              {lead.bulletPoints && lead.bulletPoints.length > 0 && (
                <ul className="ml-4 text-xs list-disc space-y-0.5">
                  {lead.bulletPoints.slice(0, 3).map(
                    (bullet, bIdx) =>
                      bullet.text && (
                        <li key={bIdx}>
                          {bullet.text}
                        </li>
                      )
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills & Interests Section */}
      {((data.skills?.technical ||
        data.skills?.languages ||
        data.skills?.laboratory) ||
        data.interests) && (
        <div className="mb-1">
          <h2 className="font-bold text-xs uppercase border-b border-gray-300 mb-1 pb-0.5 text-gray-800">Skills & Interests</h2>
          <div className="leading-tight space-y-0.5">
            {data.skills?.technical && (
              <div className="text-xs">
                <span className="font-bold text-gray-900">Technical:</span> {data.skills.technical}
              </div>
            )}
            {data.skills?.languages && (
              <div className="text-xs">
                <span className="font-bold text-gray-900">Languages:</span> {data.skills.languages}
              </div>
            )}
            {data.skills?.laboratory && (
              <div className="text-xs">
                <span className="font-bold text-gray-900">Laboratory:</span>{' '}
                {data.skills.laboratory}
              </div>
            )}
            {data.interests && (
              <div className="text-xs">
                <span className="font-bold text-gray-900">Interests:</span> {data.interests}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
