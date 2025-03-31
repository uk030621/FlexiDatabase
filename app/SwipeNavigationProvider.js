"use client";

import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSwipeable } from "react-swipeable";

const pages = ["/", "/fields", "/customers"]; // Define your routes here

const SwipeNavigationProvider = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Function to check if swipe started inside a scrollable container
  const isInsideScrollable = (element) => {
    while (element) {
      if (element.classList?.contains("overflow-x-auto")) {
        return true; // Prevent page swipe
      }
      element = element.parentElement;
    }
    return false;
  };

  // Function to navigate between pages
  const navigateTo = useCallback(
    (direction) => {
      const currentIndex = pages.indexOf(pathname);
      if (currentIndex === -1) return;

      if (direction === "left" && currentIndex < pages.length - 1) {
        router.push(pages[currentIndex + 1]);
      } else if (direction === "right" && currentIndex > 0) {
        router.push(pages[currentIndex - 1]);
      }
    },
    [pathname, router]
  );

  // Handle swipe gestures
  const handlers = useSwipeable({
    onSwiping: (event) => {
      if (isInsideScrollable(event.event.target)) {
        event.event.stopPropagation(); // Stop page swipe if inside scrollable
      }
    },
    onSwipedLeft: (event) => {
      if (!isInsideScrollable(event.event.target)) navigateTo("left");
    },
    onSwipedRight: (event) => {
      if (!isInsideScrollable(event.event.target)) navigateTo("right");
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  // Handle keyboard navigation (left & right arrows)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        navigateTo("left");
      } else if (e.key === "ArrowLeft") {
        navigateTo("right");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigateTo]);

  return (
    <div {...handlers} className="h-full w-full">
      {children}
    </div>
  );
};

export default SwipeNavigationProvider;
