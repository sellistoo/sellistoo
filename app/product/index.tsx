// app/index.tsx
import { router } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  useEffect(() => {
    router.replace("/HomeScreen"); // Redirect to your home tab
  }, []);

  return null; // Or a loading spinner
}
