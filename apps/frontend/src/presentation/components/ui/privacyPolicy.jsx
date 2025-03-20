import React, { useState } from "react";
// import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const PrivacyPolicy = () => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const renderSection = (id, title, content) => {
    const isExpanded = expandedSections[id];
    return (
      <div key={id} className="mb-4">
        <button
          onClick={() => toggleSection(id)}
          className="flex justify-between items-center w-full text-left font-semibold text-lg bg-slate-100 p-2 rounded"
        >
          {title}
          {/* {isExpanded ? <FaChevronUp size={20} /> : <FaChevronDown size={20} />} */}
        </button>
        {isExpanded && <div className="mt-2 pl-4">{content}</div>}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">
        <strong>Effective Date:</strong> 10/09/2024
      </p>
      <p className="mb-4">
        Jet Forms respects your privacy and is committed to protecting your
        personal data. This Privacy Policy outlines how we collect, use, and
        safeguard your information. Please note that Jet Forms is not compliant
        with any specific privacy or data protection regulations, including but
        not limited to GDPR (General Data Protection Regulation) or CCPA
        (California Consumer Privacy Act).
      </p>

      {renderSection(
        "information",
        "1. Information We Collect",
        <ul className="list-disc pl-5">
          <li>
            <strong>Account Information:</strong> When users register, we
            collect personal information such as name, email address, and
            payment details.
          </li>
          <li>
            <strong>Usage Data:</strong> We collect information about how users
            interact with the platform, including API requests, forms created,
            and form submissions.
          </li>
          <li>
            <strong>Log Data:</strong> Our servers automatically collect
            information such as IP addresses, browser type, and access times
            when users visit the platform.
          </li>
        </ul>
      )}

      {renderSection(
        "use",
        "2. Use of Information",
        <>
          <p>
            We use personal information to provide and improve our services,
            including:
          </p>
          <ul className="list-disc pl-5">
            <li>Account management</li>
            <li>Generating forms and submission endpoints</li>
            <li>Processing payments for paid plans</li>
            <li>Communicating important updates and notifications</li>
          </ul>
          <p>
            Usage and log data are used for troubleshooting, security, and
            analytics to enhance the platform.
          </p>
        </>
      )}

      {renderSection(
        "sharing",
        "3. Data Sharing",
        <ul className="list-disc pl-5">
          <li>
            <strong>Third-Party Services:</strong> We may share your data with
            third-party service providers who assist with payment processing,
            data storage, and analytics.
          </li>
          <li>
            <strong>Legal Requirements:</strong> We may disclose personal data
            to comply with legal obligations, enforce our terms, or protect the
            rights, property, or safety of Jet Forms, our users, or others.
          </li>
        </ul>
      )}

      {renderSection(
        "security",
        "4. Data Security",
        <>
          <p>
            Jet Forms implements industry-standard security measures to protect
            your data from unauthorized access, alteration, disclosure, or
            destruction.
          </p>
          <p>
            However, no method of data transmission over the internet is 100%
            secure, and we cannot guarantee absolute security.
          </p>
        </>
      )}

      {renderSection(
        "retention",
        "5. Data Retention",
        <>
          <p>
            We retain user data for as long as necessary to provide services or
            comply with legal obligations.
          </p>
          <p>
            Users can request the deletion of their data at any time by
            contacting <strong>support@jetforms.live</strong>.
          </p>
        </>
      )}

      {renderSection(
        "rights",
        "6. Your Rights",
        <>
          <p>
            Users have the right to access, correct, or delete their personal
            data.
          </p>
          <p>
            Users may also object to the processing of their personal data or
            request data portability where applicable.
          </p>
        </>
      )}

      {renderSection(
        "compliance",
        "7. Non-Compliance with Regulations",
        <>
          <p>
            Jet Forms is not compliant with any regional privacy or data
            protection regulations, including but not limited to GDPR, CCPA, or
            other applicable laws.
          </p>
          <p>
            Users should be aware of this before using the platform and are
            responsible for understanding their obligations when using Jet Forms
            in regions with specific privacy laws.
          </p>
        </>
      )}

      {renderSection(
        "changes",
        "8. Changes to the Privacy Policy",
        <p>
          Jet Forms may update this policy from time to time. Users will be
          notified of any significant changes, and continued use of the platform
          constitutes acceptance of those changes.
        </p>
      )}

      {renderSection(
        "contact",
        "9. Contact Information",
        <p>
          For questions or concerns regarding this Privacy Policy, please
          contact us at <strong>support@jetforms.live</strong>.
        </p>
      )}
    </div>
  );
};

export default PrivacyPolicy;
