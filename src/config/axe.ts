// axe-core setup for accessibility testing in development
import React from "react";
import ReactDOM from "react-dom/client";

// Initialize axe-core for accessibility testing in development mode
if (import.meta.env.DEV) {
  import("@axe-core/react")
    .then((axe) => {
      axe.default(React, ReactDOM, 1000, {
        // Configuration options
        rules: [
          {
            id: "color-contrast",
            enabled: true,
          },
          {
            id: "keyboard-navigation",
            enabled: true,
          },
        ],
      });
    })
    .catch((error) => {
      console.warn("Failed to initialize axe-core:", error);
    });
}
