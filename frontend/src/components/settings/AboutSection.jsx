import { Info, Cpu } from "lucide-react";

import SettingsCard from "./SettingsCard.jsx";
import SettingItem from "./SettingItem.jsx";

/* About Section */

export default function AboutSection() {
  return (
    <SettingsCard
      icon={<Info size={22} />}
      title="About"
      description="Information about the STINGRAY dashboard."
    >
      <SettingItem
        icon={<Info size={20} />}
        title="Dashboard Version"
        description="Current software version."
      >
        <span className="setting-value">v1.1.0</span>
      </SettingItem>

      <SettingItem
        icon={<Cpu size={20} />}
        title="Connected Device"
        description="Current rehabilitation device."
      >
        <span className="setting-value">STINGRAY_BAR_001</span>
      </SettingItem>
    </SettingsCard>
  );
}