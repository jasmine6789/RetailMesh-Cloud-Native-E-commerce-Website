import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout as AntLayout } from 'antd';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { isRegistered } from '../../config/microFrontendRegistry';

const { Content } = AntLayout;

const NAVBAR_HEIGHT = 152;

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';
  const isHomePage = location.pathname === '/';

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];
  const isMicroFrontendRoute = firstSegment && isRegistered(firstSegment);

  return (
    <AntLayout
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {!isAuthPage && <Navbar />}
      <Content
        style={{
          flex: 1,
          minHeight: isAuthPage ? '100vh' : `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          background: '#ffffff',
          padding: isAuthPage
            ? 0
            : isHomePage
            ? 0
            : isMicroFrontendRoute
            ? `${NAVBAR_HEIGHT}px 0 0 0`
            : `${NAVBAR_HEIGHT + 16}px 0 0 0`,
          width: '100%',
          overflow: 'auto',
        }}
      >
        <Outlet />
      </Content>
      {!isAuthPage && <Footer />}
    </AntLayout>
  );
};

export default AppLayout;
