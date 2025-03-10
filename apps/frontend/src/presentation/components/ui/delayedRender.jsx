import { useState, useEffect } from "react";

export const DelayedRender = ({ children, delay }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log("DelayedRender: Timer started");
    const timer = setTimeout(() => {
      console.log("DelayedRender: Timer completed");
      setIsReady(true);
    }, delay);
    return () => clearTimeout(timer); // Cleanup the timer
  }, [delay]);

  console.log("DelayedRender: isReady =", isReady);

  if (!isReady) {
    console.log("DelayedRender: Throwing promise");
    throw new Promise((resolve) => setTimeout(resolve, delay)); // Trigger Suspense fallback
  }

  console.log("DelayedRender: Rendering children");
  return children;
};

