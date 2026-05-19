import { useEffect, useState } from "react";

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  isNew: boolean;
}

function isValidNotification(n: unknown): n is Notification {
  if (!n || typeof n !== "object") return false;
  const obj = n as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.description === "string" &&
    typeof obj.time === "string" &&
    typeof obj.icon === "string" &&
    typeof obj.isNew === "boolean"
  );
}

export const useNotificationsData = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications", {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const valid = (Array.isArray(data) ? data : []).filter(
          isValidNotification,
        );
        setNotifications(valid);
      } catch (err: unknown) {
        if (abortController.signal.aborted) return;
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("Error fetching notifications:", err);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchNotifications();

    return () => abortController.abort();
  }, []);

  return { notifications, isLoading, error };
};
