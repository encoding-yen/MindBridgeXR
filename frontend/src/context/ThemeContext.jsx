import { createContext, useEffect, useState } from "react";

/* Theme Context */

export const ThemeContext = createContext();

/* Theme Provider */

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("fontSize") || "medium";
  });

  const [elderlyMode, setElderlyMode] = useState(() => {
    return JSON.parse(localStorage.getItem("elderlyMode")) || false;
  });

  const [highContrast, setHighContrast] = useState(() => {
    return JSON.parse(localStorage.getItem("highContrast")) || false;
  });

  const [reduceMotion, setReduceMotion] = useState(() => {
    return JSON.parse(localStorage.getItem("reduceMotion")) || false;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-font-size", fontSize);
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-elderly-mode", elderlyMode);
    localStorage.setItem("elderlyMode", JSON.stringify(elderlyMode));
  }, [elderlyMode]);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-high-contrast", highContrast);
    localStorage.setItem("highContrast", JSON.stringify(highContrast));
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-reduce-motion", reduceMotion);
    localStorage.setItem("reduceMotion", JSON.stringify(reduceMotion));
  }, [reduceMotion]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        fontSize,
        setFontSize,
        elderlyMode,
        setElderlyMode,
        highContrast,
        setHighContrast,
        reduceMotion,
        setReduceMotion,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}