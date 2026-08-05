import { Palette } from "lucide-react";

import SettingsCard from "./SettingsCard.jsx";
import ThemeSelector from "./ThemeSelector.jsx";

/* Appearance Section */

export default function AppearanceSection() {
  return (
    <SettingsCard
      icon={<Palette size={22} />}
      title="Appearance"
      description="Customize how the dashboard looks."
    >
      <ThemeSelector />
    </SettingsCard>
  );
}