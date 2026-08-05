import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    dashboard: 'Dashboard',
    bookPickup: 'Book a Pickup',
    myPickups: 'My Pickups & History',
    walletPoints: 'Wallet & Points',
    ecoStore: 'Eco-Store',
    esgPortal: 'ESG Portal',
    leaderboard: 'Leaderboard',
    support: 'Live Support',
    menu: 'All Menu',
    users: 'Users',
    pickups: 'Pickups',
    drivers: 'Drivers',
    settings: 'Settings',
    logout: 'Logout',
    scanAI: 'Scan with AI',
    voiceBooking: 'Voice Booking',
    trackDriver: 'Track Live GPS',
    greenCert: 'Green Eco Certificate',
    withdrawCash: 'Withdraw Cash (UPI)',
    smartKiosks: 'Smart Kiosks',
    aiAssistant: 'EcoAI Assistant',
    batteryAlert: 'E-Vehicle Battery Alert',
    welcomeBack: 'Welcome Back',
    totalRecycled: 'Total Waste Recycled',
    co2Saved: 'CO2 Offset',
    ecoPoints: 'EcoPoints Balance'
  },
  ta: {
    dashboard: 'டாஷ்போர்டு',
    bookPickup: 'பிக்கப் பதிவு செய்ய',
    myPickups: 'என் பிக்கப் வரலாறு',
    walletPoints: 'வாலட் & புள்ளிகள்',
    ecoStore: 'ஈகோ ஸ்டோர்',
    esgPortal: 'ESG போர்ட்டல்',
    leaderboard: 'தரவரிசை பட்டியல்',
    support: 'லைவ் சப்போர்ட்',
    menu: 'அனைத்து பட்டி',
    users: 'பயனர்கள்',
    pickups: 'பிக்கப்புகள்',
    drivers: 'ஓட்டுநர்கள்',
    settings: 'அமைப்புகள்',
    logout: 'வெளியேறு',
    scanAI: 'AI மூலம் ஸ்கேன்',
    voiceBooking: 'குரல் பதிவு (Voice)',
    trackDriver: 'லைவ் GPS டிராக்கிங்',
    greenCert: 'பச்சை சான்றிதழ்',
    withdrawCash: 'பணம் பெற (UPI)',
    smartKiosks: 'ஸ்மார்ட் தொட்டிகள்',
    aiAssistant: 'EcoAI உதவி',
    batteryAlert: 'பேட்டரி எச்சரிக்கை',
    welcomeBack: 'மீண்டும் வருக',
    totalRecycled: 'மொத்த மறுசுழற்சி',
    co2Saved: 'CO2 உமிழ்வு குறைப்பு',
    ecoPoints: 'EcoPoints இருப்பு'
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    bookPickup: 'पिकअप बुक करें',
    myPickups: 'मेरी पिकअप हिस्ट्री',
    walletPoints: 'वॉलेट और पॉइंट्स',
    ecoStore: 'इको स्टोर',
    esgPortal: 'ईएसजी पोर्टल',
    leaderboard: 'लीडरबोर्ड',
    support: 'लाइव सहायता',
    menu: 'सभी मेनू',
    users: 'उपयोगकर्ता',
    pickups: 'पिकअप',
    drivers: 'ड्राइवर',
    settings: 'सेटिंग्स',
    logout: 'लॉगआउट',
    scanAI: 'एआई स्कैन करें',
    voiceBooking: 'वॉयस बुकिंग',
    trackDriver: 'लाइव जीपीएस ट्रैकिंग',
    greenCert: 'ग्रीन सर्टिफिकेट',
    withdrawCash: 'नकद निकालें (UPI)',
    smartKiosks: 'स्मार्ट कियोस्क',
    aiAssistant: 'इको एआई सहायक',
    batteryAlert: 'बैटरी अलर्ट',
    welcomeBack: 'वापसी पर स्वागत है',
    totalRecycled: 'कुल रीसायकल कचरा',
    co2Saved: 'CO2 बचत',
    ecoPoints: 'इकोपॉइंट्स बैलेंस'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('ecoreward_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('ecoreward_lang', lang);
  }, [lang]);

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
