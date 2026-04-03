import React, { useEffect } from "react";
import { LogBox } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  useEffect(() => {
    LogBox.ignoreLogs([
      "setLayoutAnimationEnabledExperimental is currently a no-op in the New Architecture",
    ]);
  }, []);

  return <AppNavigator />;
}
