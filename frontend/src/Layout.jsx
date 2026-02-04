import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

const Layout = () => {
    return (
        <>
            <Navbar />

            {/* Fluid Background */}
            <div className="fluid-bg">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <main>
                <Outlet />
            </main>
        </>
    );
};

export default Layout;
