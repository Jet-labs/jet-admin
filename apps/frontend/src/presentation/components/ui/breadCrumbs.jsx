import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathname = location.pathname;

  // Split the pathname into segments
  const segments = pathname.split("/").filter(Boolean);

  // Create breadcrumb elements
  const breadcrumbs = segments.map((segment, index) => {
    // Generate URL for each segment
    const url = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;

    return (
      <div key={index} className="flex items-center">
        {isLast ? (
          <span className="text-xs font-medium text-gray-700">{segment}</span>
        ) : (
          <>
            <Link
              to={url}
              className="text-xs text-[#646cff]/80 hover:text-[#646cff] transition duration-150"
            >
              {segment}
            </Link>
            <FiChevronRight className="text-[#646cff]/80 mx-1" />
          </>
        )}
      </div>
    );
  });

  return (
    <div className="flex items-center bg-slate-100 p-1 rounded  mx-3">
      <a
        href="/"
        className="text-xs text-[#646cff]/80 hover:text-[#646cff] transition duration-150"
      >
        Home
      </a>
      {segments.length > 0 && (
        <FiChevronRight className="text-[#646cff]/80 mx-1" />
      )}
      {breadcrumbs}
    </div>
  );
};

