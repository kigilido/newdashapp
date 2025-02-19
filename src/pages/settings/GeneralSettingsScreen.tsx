
import { PreferencesSection } from "@/components/settings/PreferencesSection";
import { FontPreferencesSection } from "@/components/settings/FontPreferencesSection";
import { BackupManager } from "@/components/settings/BackupManager";

const GeneralSettingsScreen = () => {
  return (
    <div className="space-y-6">
      <PreferencesSection />
      <FontPreferencesSection />
      <BackupManager />
    </div>
  );
};

export default GeneralSettingsScreen;
