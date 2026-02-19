// settings/landing/page.tsx
import "./_components/landing.scss";
import LandingManager from "./_components/LandingManager";

export default function LandingSettingsPage() {
  return (
    <div className="settings-page">
      <LandingManager />
    </div>
  );
}
