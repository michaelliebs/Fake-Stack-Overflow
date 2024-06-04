import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../stylesheets/index.css';

function AdminContent({ onUserClick }) {
    const [users, setUsers] = useState([]);
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

    useEffect(() => {
        axios.get('http://localhost:8000/users')
            .then(response => {
                const filteredUsers = response.data.filter(user => !user.isAdmin);
                setUsers(filteredUsers);
            })
            .catch(error => console.error('Failed to fetch users:', error));
    }, []);

    const handleDeleteUser = (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            axios.delete(`http://localhost:8000/users/${userId}`)
                .then(() => setUsers(users.filter(user => user._id !== userId)))
                .catch(error => console.error('Failed to delete user:', error));
        }
    };

    const handleClickUser = (user) => {
        if (onUserClick) {
            onUserClick(user);
        }
    };

    // Function to calculate the time ago from the date posted
    const getTimeAgo = (datePosted) => {
        const now = new Date();
        const postedDate = new Date(datePosted);
        const secondsAgo = Math.floor((now - postedDate) / 1000);
        const minutesAgo = Math.floor(secondsAgo / 60);
        const hoursAgo = Math.floor(minutesAgo / 60);
        const daysAgo = Math.floor(hoursAgo / 24);
        const yearsAgo = now.getFullYear() - postedDate.getFullYear();

        if (yearsAgo > 0) {
            return `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`;
        } else if (daysAgo >= 1) {
            return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
        } else if (hoursAgo >= 1) {
            return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
        } else if (minutesAgo >= 1) {
            return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
        } else {
            return `${secondsAgo} seconds ago`;
        }
    };

    return (
        <div className='admin-container'>
            <div className='admin-header'>
                <h2>{userData.username} - Admin Details:</h2>
                <p>Member Since: {getTimeAgo(userData.memberSince)} [{userData.memberSince}]</p>
                <p>Reputation: {userData.reputation}</p>
            </div>
            <h1 style={{textAlign: 'center'}}>User Management</h1>
            <div className='users-list'>
            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                users.map(user => (
                    <div key={user._id} className='user'>
                        <span className='user-link' onClick={() => handleClickUser(user)} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
                            {user.username}
                        </span>
                        <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                    </div>
                ))
            )}
            </div>
        </div>
    );
}

export default AdminContent;
