import { useState } from 'react';
import { Title } from '@mantine/core';
import classes from './Nav.module.css';

const linksMockdata = [
  'Security',
  'Settings',
  'Dashboard',
  'Releases',
  'Account',
  'Orders',
  'Clients',
  'Databases',
  'Pull Requests',
  'Open Issues',
  'Wiki pages',
];

export function DoubleNavbar() {
  const [activeLink, setActiveLink] = useState('Settings');

  const links = linksMockdata.map(link => (
    <a
      className={classes.link}
      data-active={activeLink === link || undefined}
      href='#'
      onClick={event => {
        event.preventDefault();
        setActiveLink(link);
      }}
      key={link}>
      {link}
    </a>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.wrapper}>
        <div className={classes.main}>
          <Title order={4} className={classes.title}>
            Test
          </Title>
          {links}
        </div>
      </div>
    </nav>
  );
}
