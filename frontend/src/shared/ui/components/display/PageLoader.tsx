import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './PageLoader.module.scss';

interface PageLoaderProps {
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ message }) => {
  const { t } = useTranslation('common');
  return (
    <motion.div
      className={styles.pageLoader}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.spinner} />
      <p className={styles.message}>{message || t('loading')}</p>
    </motion.div>
  );
};

export default PageLoader;
