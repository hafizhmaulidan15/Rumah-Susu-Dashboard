import { useEffect, useState } from "react";

export const useChangelogModal = () => {
  const [changelogContent, setChangelogContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchChangelog = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/nellavio/nellavio/main/CHANGELOG.md",
          { signal: abortController.signal },
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch changelog: ${response.status}`);
        }

        const content = await response.text();
        setChangelogContent(content);
        setIsLoading(false);
      } catch (err: unknown) {
        if (abortController.signal.aborted) return;
        console.error("Error fetching changelog:", err);
        setError("Failed to load changelog. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchChangelog();

    return () => abortController.abort();
  }, []);

  return {
    changelogContent,
    isLoading,
    error,
  };
};
