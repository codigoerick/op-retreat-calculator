"use client";

import { useEffect } from "react";
import { markKeysSeen } from "@/lib/infoNotifications";

type InfoArticleSeenTrackerProps = {
  notificationKey: string;
};

export default function InfoArticleSeenTracker({
  notificationKey,
}: InfoArticleSeenTrackerProps) {
  useEffect(() => {
    markKeysSeen([notificationKey]);
  }, [notificationKey]);

  return null;
}
