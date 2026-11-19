"use client";

import { useEffect } from "react";
import { markKeysSeen } from "@/lib/infoNotifications";

type SeenTrackerProps = {
  notificationKey: string;
};

export default function SeenTracker({ notificationKey }: SeenTrackerProps) {
  useEffect(() => {
    markKeysSeen([notificationKey]);
  }, [notificationKey]);

  return null;
}
