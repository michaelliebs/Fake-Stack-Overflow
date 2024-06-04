import React, { useState, useEffect } from 'react';
import '../stylesheets/index.css';
import axios from 'axios';

function Header({ onSearch, onProfileClick, onLogoutClick }) {
    const [searchTerm, setSearchTerm] = useState('');
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

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get(`http://localhost:8000/search?query=${encodeURIComponent(searchTerm)}`);
            onSearch(response.data);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    return (
        <div className="header">
            <div className="header-content">
                <h1 id="page-title">Fake Stack Overflow</h1>
                <form id="search-form" onSubmit={handleSearchSubmit}>
                    <input type="search" name="q" placeholder="Search..." value={searchTerm}
                        onChange={handleInputChange} />
                </form>
                <div>
                    {userData.username && <button onClick={onProfileClick} className="header-button">Profile</button>}
                    <button onClick={onLogoutClick} className="header-button">Logout</button>
                </div>
            </div>
        </div>
    );
}

export default Header;