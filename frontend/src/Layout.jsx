import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import SilkBackground from './components/SilkBackground';

const Layout = () => {
    return (
        <>
            <Navbar />
            <SilkBackground />
            <main>
                <Outlet />
            </main>
        </>
    );
};

export default Layout;
