const tintColorLight = "hsl(221, 83%, 53%)"; // Royal Blue
const tintColorDark = "hsl(0, 0%, 100%)"; // White

export const Colors = {
  light: {
    text: "hsl(222, 47%, 11%)", // Charcoal Slate
    background: "hsl(0, 0%, 100%)",
    tint: tintColorLight,
    icon: "hsl(222, 47%, 11%)",
    tabIconDefault: "hsl(222, 47%, 11%)",
    tabIconSelected: tintColorLight,

    // Additions from your Tailwind theme
    secondary: "hsl(210, 20%, 96%)", // Soft Gray
    mutedText: "hsl(222, 10%, 45%)",
    accent: "hsl(39, 94%, 56%)", // Golden Yellow
    destructive: "hsl(0, 85%, 61%)",
    border: "hsl(210, 20%, 90%)",
    input: "hsl(210, 20%, 90%)",
    cardBg: "hsl(0, 0%, 100%)",
    bannerBg: "hsl(210, 20%, 96%)",
  },

  dark: {
    text: "hsl(0, 0%, 100%)", // White
    background: "hsl(0, 0%, 10%)", // Almost Black
    tint: tintColorDark,
    icon: "hsl(0, 0%, 100%)",
    tabIconDefault: "hsl(0, 0%, 100%)",
    tabIconSelected: tintColorDark,

    secondary: "hsl(0, 0%, 18%)",
    mutedText: "hsl(0, 0%, 70%)",
    accent: "hsl(39, 94%, 56%)",
    destructive: "hsl(0, 70%, 50%)",
    border: "hsl(0, 0%, 20%)",
    input: "hsl(0, 0%, 20%)",
    cardBg: "hsl(0, 0%, 12%)",
    bannerBg: "hsl(0, 0%, 14%)",
  },
};
