import { Moon, Sun, Check } from "lucide-react";

import { useTheme } from "../../hooks/useTheme.js";

/* Theme Selector */

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
        id: "dark",
        name: "Dark",
        description: "Comfortable viewing in low-light environments.",
        icon: <Moon size={20} />,
    },
    {
        id: "light",
        name: "Light",
        description: "Bright appearance for daytime use.",
        icon: <Sun size={20} />,
    },
   ];

  return (
    <div className="appearance-selector">
      {themes.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`appearance-option ${
            theme === item.id ? "active" : ""
          }`}
          onClick={() => setTheme(item.id)}
        >
          <div className="appearance-option-header">
            <div className="appearance-option-icon">
              {item.icon}
            </div>

            {theme === item.id && (
              <Check size={18} className="appearance-option-check" />
            )}
          </div>

          <h3>{item.name}</h3>

          <p>{item.description}</p>
        </button>
      ))}
    </div>
  );
}