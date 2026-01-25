import React, { useEffect } from 'react'; 
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowRightOutlined, UserOutlined, SafetyOutlined, CheckCircleFilled } from '@ant-design/icons';
import EduLogo from '../../assets/icon/EduLogo';
import IntroduceLayout from '../../layouts/IntroduceLayout';
import styles from './IntroducePage.module.scss';

// 2. Import AOS
import AOS from 'aos';
import 'aos/dist/aos.css'; 

const IntroducePage = () => {
  /* ==========================================================================
     HOOKS & CONFIGURATION
     ========================================================================== */
  const navigate = useNavigate();

  // Load URLs from environment variables (User vs Admin separation)
  // Fallback to local paths if env variables are missing
  const USER_PORTAL_URL = import.meta.env.VITE_USER_PORTAL_URL || '#';
  const ADMIN_PORTAL_URL = import.meta.env.VITE_ADMIN_PORTAL_URL || '/login';

  /* ==========================================================================
     LOGIC: SMART NAVIGATION
     - Determines whether to use client-side routing (internal) 
       or full page reload (external domain).
     ========================================================================== */
  const handleNavigation = (url) => {
    if (!url || url === '#') return;
    if (url.startsWith('http')) {
      window.location.href = url;
    } else {
      navigate(url);
    }
  };

  /* ==========================================================================
     EFFECTS: ANIMATION & SCROLL
     ========================================================================== */
  useEffect(() => {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 50,
    });

    // Enforce smooth scrolling
    document.documentElement.style.scrollSnapType = 'y mandatory';
    document.documentElement.style.scrollBehavior = 'smooth';

    // Cleanup styles on unmount
    return () => {
      document.documentElement.style.scrollSnapType = '';
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <IntroduceLayout>
      
      {/* -------------------------------------------------------------------------
          HERO SECTION: Main Landing Banner
      -------------------------------------------------------------------------- */}
      <section className={styles.hero}>
        <div className={styles.hero__badge} data-aos="fade-down">
          <EduLogo /> Education Account System
        </div>

        <h1 className={styles.hero__title} data-aos="fade-up" data-aos-delay="200">
          Empowering Education for <br />
          <span className={styles.hero__title_highlight}>Every Singaporean</span>
        </h1>

        <p className={styles.hero__desc} data-aos="fade-up" data-aos-delay="400">
          A comprehensive education account system for Singapore Citizens aged 16-30.
          Access your education funds, pay course fees, and track your learning journey.
        </p>

        <div className={styles.hero__actions} data-aos="zoom-in" data-aos-delay="600">
          {/* Action: Go to Student Portal */}
          <Button
            type="primary"
            size="large"
            icon={<ArrowRightOutlined />}
            className={styles.hero__btn_teal}
            onClick={() => handleNavigation(USER_PORTAL_URL)}
          >
            Access e-Service Portal
          </Button>

          {/* Action: Go to Admin Portal */}
          <Button
            size="large"
            icon={<UserOutlined />}
            className={styles.hero__btn_white}
            onClick={() => handleNavigation(ADMIN_PORTAL_URL)}
          >
            Admin Portal
          </Button>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          PROCESS SECTION: "How It Works"
      -------------------------------------------------------------------------- */}
      <section className={styles.steps}>
        <div className={styles.steps__header} data-aos="fade-up">
          <h2>How It Works</h2>
          <p>Simple, secure, and designed for your educational success</p>
        </div>

        <div className={styles.steps__grid}>
          {[
            { id: 1, title: 'Automatic Activation', desc: 'Your education account is automatically created when you turn 16.', aos: 'fade-right' },
            { id: 2, title: 'Receive Credits', desc: 'Periodic top-ups are credited to your account based on government schemes.', aos: 'fade-up' },
            { id: 3, title: 'Pay Course Fees', desc: 'Use your balance or other payment methods to pay for approved courses.', aos: 'fade-left' }
          ].map((item, index) => (
            <div
              key={item.id}
              className={styles.steps__card}
              data-aos={item.aos}
              data-aos-delay={index * 200}
            >
              <div className={styles.steps__number}>{item.id}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          PORTALS SECTION: Navigation Cards
      -------------------------------------------------------------------------- */}
      <section className={styles.portals}>
        <div className={styles.portals__container}>

          {/* Card 1: Student / e-Service Portal */}
          <div
            className={`${styles.portals__item} ${styles['portals__item--user']}`}
            data-aos="fade-right"
            data-aos-offset="200"
          >
            <div className={styles.portals__icon}><UserOutlined /></div>
            <h3 className={styles.portals__title}>e-Service Portal</h3>
            <p className={styles.portals__desc}>For account holders to view balance, transactions, and pay course fees.</p>
            <ul className={styles.portals__list}>
              <li><CheckCircleFilled className={styles.portals__check} /> View account balance</li>
              <li><CheckCircleFilled className={styles.portals__check} /> Pay course fees</li>
              <li><CheckCircleFilled className={styles.portals__check} /> Transaction history</li>
              <li><CheckCircleFilled className={styles.portals__check} /> Update profile</li>
            </ul>
            
            <span 
              className={styles.portals__link} 
              onClick={() => handleNavigation(USER_PORTAL_URL)} 
              style={{ cursor: 'pointer' }}
            >
              Access Portal <ArrowRightOutlined />
            </span>
          </div>

          {/* Card 2: Admin Portal */}
          <div
            className={`${styles.portals__item} ${styles['portals__item--admin']}`}
            data-aos="fade-left"
            data-aos-offset="200"
          >
            <div className={styles.portals__icon}><SafetyOutlined /></div>
            <h3 className={styles.portals__title}>Admin Portal</h3>
            <p className={styles.portals__desc}>For administrators to manage accounts, courses, and process fees.</p>
            <ul className={styles.portals__list}>
              <li><CheckCircleFilled className={styles.portals__check} /> Account management</li>
              <li><CheckCircleFilled className={styles.portals__check} /> Batch top-ups</li>
              <li><CheckCircleFilled className={styles.portals__check} /> Course management</li>
              <li><CheckCircleFilled className={styles.portals__check} /> Fee processing</li>
            </ul>

            <span 
              className={styles.portals__link} 
              onClick={() => handleNavigation(ADMIN_PORTAL_URL)} 
              style={{ cursor: 'pointer' }}
            >
              Access Portal <ArrowRightOutlined />
            </span>
          </div>

        </div>
      </section>
    </IntroduceLayout>
  );
};

export default IntroducePage;