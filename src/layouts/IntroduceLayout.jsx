import React from 'react';
import SharedHeader from './Header/MainHeader';
import Footer from './Footer/Footer';
import styles from './IntroduceLayout.module.scss'; 

const IntroduceLayout = ({ children }) => {
  return (
    <div className={styles.layoutWrapper}>
      <SharedHeader />
      
      <main className={styles.mainContent}>
        {children}
      </main>
      
      <Footer />
    </div>
  );
}

export default IntroduceLayout;