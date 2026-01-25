import React from 'react';
import EduLogo from '../../assets/icon/EduLogo';
import styles from './Footer.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer__container}>
        {/* Bên trái: Logo & Tên thương hiệu */}
        <div className={styles.footer__brand}>
          <div className={styles.footer__logoBox}>
            <EduLogo />
          </div>
          <span className={styles.footer__name}>EduCredit</span>
        </div>

        {/* Bên phải: Copyright */}
        <p className={styles.footer__copyright}>
          © 2024 Education Account System. Government of Singapore.
        </p>
      </div>
    </footer>
  );
};

export default Footer;