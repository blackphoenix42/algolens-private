import { addons } from "@storybook/manager-api";

addons.setConfig({
  panelPosition: "bottom",
  selectedPanel: "controls",
  initialActive: "sidebar",
  sidebar: {
    showRoots: false,
    collapsedRoots: ["other"],
  },
});
