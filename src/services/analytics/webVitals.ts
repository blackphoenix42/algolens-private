import * as Sentry from "@sentry/react";
import { onCLS, onINP, onLCP, onFCP, onTTFB } from "web-vitals";

import { track } from "./analytics";

function send(name: string, value: number, rating: string) {
  // Send to Sentry as breadcrumb and custom measurement
  Sentry.addBreadcrumb({
    category: "web-vital",
    message: `${name}=${value}`,
    data: {
      rating,
      value,
      metric: name,
    },
    level:
      rating === "good"
        ? "info"
        : rating === "needs-improvement"
          ? "warning"
          : "error",
  });

  // Set measurement for performance monitoring
  Sentry.setMeasurement(`webvital.${name.toLowerCase()}`, value, "millisecond");
  // Product analytics
  track("step_advanced", { [`vital_${name}`]: Math.round(value), rating }); // or a dedicated event
}

export function initWebVitals() {
  onCLS((v) => send("CLS", v.value, v.rating));
  onINP((v) => send("INP", v.value, v.rating));
  onLCP((v) => send("LCP", v.value, v.rating));
  onFCP((v) => send("FCP", v.value, v.rating));
  onTTFB((v) => send("TTFB", v.value, v.rating));
}
