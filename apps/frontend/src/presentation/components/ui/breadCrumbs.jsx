import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Breadcrumbs = () => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const url = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;
    const label = segment.length > 8 ? segment.slice(0, 20) + "\u2026" : segment;

    return (
      <React.Fragment key={index}>
        <ChevronRight size={12} className="text-primary/40 flex-shrink-0" />
        {isLast ? (
          <span
            title={segment}
            className="text-xs font-medium text-muted-foreground/70 inline-block truncate max-w-[120px]"
          >
            {label}
          </span>
        ) : (
            <Link
              to={url}
              title={segment}
              className="text-xs inline-block truncate max-w-[120px] text-primary/80 hover:text-primary transition-colors duration-150"
            >
              {label}
            </Link>
        )}
      </React.Fragment>
    );
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-0.5 bg-muted rounded mx-3 px-2.5 py-1 h-7 w-fit max-w-full overflow-hidden"
    >
      <Link
        to="/"
        aria-label="Home"
        className="flex items-center text-primary/80 hover:text-primary transition-colors duration-150 flex-shrink-0"
      >
        <Home size={12} />
      </Link>
      {breadcrumbs}
    </nav>
  );
};