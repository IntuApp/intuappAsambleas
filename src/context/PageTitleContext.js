"use client";
import { React, createContext, useContext, useState, useCallback } from "react";

const PageTitleContext = createContext();

export const PageTitleProvider = ({ children }) => {
  const [titleOverrides, setTitleOverrides] = useState({});
  const [extraSegments, setExtraSegments] = useState([]);

  // Function to set a title for a specific segment (e.g., an ID)
  const setSegmentTitle = useCallback((segment, title) => {
    setTitleOverrides((prev) => ({
      ...prev,
      [segment]: title,
    }));
  }, []);

  // Function to clear overrides
  const clearSegmentTitle = useCallback((segment) => {
    setTitleOverrides((prev) => {
      const newOverrides = { ...prev };
      delete newOverrides[segment];
      return newOverrides;
    });
  }, []);

  // Function to set extra segments (virtual breadcrumbs)
  // segments: array of { label: string, href: string (optional) }
  const setVirtualSegments = useCallback((segments) => {
    setExtraSegments(segments);
  }, []);

  return (
    <PageTitleContext.Provider
      value={{
        titleOverrides,
        setSegmentTitle,
        clearSegmentTitle,
        extraSegments,
        setVirtualSegments,
      }}
    >
      {children}
    </PageTitleContext.Provider>
  );
};

export const usePageTitle = () => useContext(PageTitleContext);
