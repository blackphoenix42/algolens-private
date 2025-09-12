/**
 * Shared types for Storybook stories
 * Centralized type definitions used across multiple story files
 */

import React from "react";

export type User = {
  name: string;
};

export type Story = {
  title: string;
  component: React.ComponentType<unknown>;
  parameters?: {
    layout?: "centered" | "fullscreen" | "padded";
    docs?: {
      description?: {
        story?: string;
        component?: string;
      };
    };
  };
  tags?: string[];
  args?: Record<string, unknown>;
  argTypes?: Record<string, unknown>;
};
