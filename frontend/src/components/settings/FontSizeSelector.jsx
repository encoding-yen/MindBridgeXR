import { useTheme } from "../../hooks/useTheme.js";

/* Font Size Selector */

export default function FontSizeSelector() {
  const { fontSize, setFontSize } = useTheme();

  const fontSizes = [
    {
      id: "small",
      label: "Small",
    },
    {
      id: "medium",
      label: "Medium",
    },
    {
      id: "large",
      label: "Large",
    },
  ];

  return (
    <div className="font-size-selector">
      {fontSizes.map((size) => (
        <button
          key={size.id}
          type="button"
          className={`font-size-option ${
            fontSize === size.id ? "active" : ""
          }`}
          onClick={() => setFontSize(size.id)}
        >
          {size.label}
        </button>
      ))}
    </div>
  );
}