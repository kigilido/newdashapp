
import { PreferencesSection } from "@/components/settings/PreferencesSection";
import { FontPreferencesSection } from "@/components/settings/FontPreferencesSection";

const GeneralSettingsScreen = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">General Settings</h1>
      <FontPreferencesSection />
      <PreferencesSection />
    </div>
  );
};

export default GeneralSettingsScreen;
