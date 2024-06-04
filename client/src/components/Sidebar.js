import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Sidebar({ onQuestionsSidebarClick, onTagsSidebarClick, activeSection, onAdminSidebarClick }) {
    const [userData, setUserData] = useState({});

    useEffect(() => {
        const getUserData = async () => {
          try {
            const response = await axios.get('http://localhost:8000/protected', { withCredentials: true });
            setUserData(response.data.user);
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };
        getUserData();
      }, []);

    return (
        <div className="sidebar">
        <ul>
            {userData.isAdmin && (
                <li><button className={`menu-item ${activeSection === 'admin' ? 'active' : ''}`}
                    onClick={onAdminSidebarClick}
                >Admin</button></li>
            )}
            <li><button className={`menu-item ${activeSection === 'questions' ? 'active' : ''}`}
                onClick={onQuestionsSidebarClick}
            >Questions</button></li>
            <li><button className={`menu-item ${activeSection === 'tags' ? 'active' : ''}`}
                onClick={onTagsSidebarClick}
            >Tags</button></li>
        </ul>
    </div>
    );
}

export default Sidebar;