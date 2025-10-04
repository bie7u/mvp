import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 shadow-lg mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-gray-600 dark:text-gray-400">
            <p className="text-sm">
              © {currentYear} {t('footballPredictions')}. {t('allRightsReserved')}
            </p>
          </div>
          
          <div className="flex space-x-6">
            <span className="text-gray-600 dark:text-gray-400 text-sm cursor-default">
              {t('about')}
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-sm cursor-default">
              {t('contact')}
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-sm cursor-default">
              {t('privacy')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
