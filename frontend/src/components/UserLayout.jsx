import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const UserLayout = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f4f5f7', fontFamily: "'Inter', sans-serif" }}>
            
            <Header />

            {/* MAIN CONTENT AREA */}
            <main className="user-main-content">
                <Outlet />
            </main>

            <style>{`
                .user-main-content {
                    flex: 1;
                    padding: 30px 40px;
                    max-width: 1400px;
                    margin: 0 auto;
                    width: 100%;
                    box-sizing: border-box;
                }
                @media (max-width: 768px) {
                    .user-main-content {
                        padding: 16px 14px;
                    }
                }
            `}</style>

            {/* FOOTER */}
            <Footer />
        </div>
    );
};

export default UserLayout;
