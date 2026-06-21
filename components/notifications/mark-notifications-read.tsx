"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function MarkNotificationsRead() {
  const queryClient = useQueryClient();

  useEffect(() => {
    fetch("/api/notifications/unread", { method: "POST" }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
    });
  }, [queryClient]);

  return null;
}
