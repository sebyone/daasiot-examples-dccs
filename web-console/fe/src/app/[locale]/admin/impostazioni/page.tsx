import Settings from '@/components/base/Settings';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Impostazioni = () => {
  return (
    <div className="space-y-4">
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <LanguageSwitcher />
      </div>

      <Settings />
    </div>
  );
};

export default Impostazioni;
