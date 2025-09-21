"use client";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import english from "./locales/en.json";
import french from "./locales/fr.json";
import arabic from "./locales/ar.json";
import chinese from "./locales/ch.json";

const resources = {
  en: { translation: english },
  fr: { translation: french },
  ar: { translation: arabic },
  ch: { translation: chinese },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
