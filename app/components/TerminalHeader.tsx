'use client';

import styles from './TerminalHeader.module.css';

export default function TerminalHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.dots}>
        <span className={styles.dotRed}></span>
        <span className={styles.dotYellow}></span>
        <span className={styles.dotGreen}></span>
      </div>
      <div className={styles.title}>root@kaleb-nim-400b-0706 ~ %</div>
    </div>
  );
}
