import React from 'react';

import { motion } from 'framer-motion';

import styles from './PageLoader.module.scss';

interface PageLoaderProps {
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Loading...' }) => {
  return (
    <motion.div
      className={styles.pageLoader}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.spinner} />
      <p className={styles.message}>{message}</p>
    </motion.div>
  );
};

export default PageLoader;
