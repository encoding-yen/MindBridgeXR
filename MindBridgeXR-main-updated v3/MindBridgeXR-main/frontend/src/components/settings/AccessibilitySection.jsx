import { Accessibility, Eye, Activity, Type } from "lucide-react";

import { useTheme } from "../../hooks/useTheme.js";

import SettingsCard from "./SettingsCard.jsx";
import SettingItem from "./SettingItem.jsx";
import ToggleSwitch from "./ToggleSwitch.jsx";
import FontSizeSelector from "./FontSizeSelector.jsx";

/* Accessibility Section */

export default function AccessibilitySection() {
  const {
    elderlyMode,
    setElderlyMode,
    highContrast,
    setHighContrast,
    reduceMotion,
    setReduceMotion,
  } = useTheme();

  return (
    <SettingsCard
      icon={<Accessibility size={22} />}
      title="Accessibility"
      description="Adjust readability, contrast, and motion preferences."
    >
      <SettingItem
        icon={<Accessibility size={20} />}
        title="Elderly Mode"
        description="Uses larger controls and clearer spacing."
      >
        <ToggleSwitch
          active={elderlyMode}
          onClick={() => setElderlyMode(!elderlyMode)}
          label="Toggle elderly mode"
        />
      </SettingItem>

      <SettingItem
        icon={<Type size={20} />}
        title="Font Size"
        description="Choose the preferred text size."
      >
        <FontSizeSelector />
      </SettingItem>

      <SettingItem
        icon={<Eye size={20} />}
        title="High Contrast"
        description="Makes text, borders, and values easier to see."
      >
        <ToggleSwitch
          active={highContrast}
          onClick={() => setHighContrast(!highContrast)}
          label="Toggle high contrast"
        />
      </SettingItem>

      <SettingItem
        icon={<Activity size={20} />}
        title="Reduce Motion"
        description="Limits animations for a calmer experience."
      >
        <ToggleSwitch
          active={reduceMotion}
          onClick={() => setReduceMotion(!reduceMotion)}
          label="Toggle reduce motion"
        />
      </SettingItem>
    </SettingsCard>
  );
}