import React, { useState, useEffect } from 'react';
import '../stylesheets/index.css';
import axios from 'axios';

function TagsList({ handleAskQuestionClick, onTagClick }) {
    const [tags, setTags] = useState([]);
    const [userData, setUserData] = useState({});

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await axios.get('http://localhost:8000/tags');
                setTags(response.data);
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };
        fetchTags();
    }, []);

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

    const renderTags = () => {
        if (tags.length === 0) {
            return <div style={{ fontWeight: 'bold', padding: '15px' }}>No Tags Found</div>;
        }

        return tags.map((tag) => (
            <div className="tag-item" key={tag._id} onClick={() => {onTagClick(tag.name)}}>
                <span className="tag-name">{tag.name}</span>
                <span className="tag-question-count">{`${tag.questionCount} ${tag.questionCount === 1 ? 'question' : 'questions'}`}</span>
            </div>
        ));
    };

    return (
        <div id="tags-container">
            <div className="tags-header">
                <h3>{tags.length} Tags</h3>
                <h2>All Tags</h2>
                {userData.username && <button className="ask-question"
                    onClick={handleAskQuestionClick}>
                    Ask Question
                </button>}
            </div>
            <div className="tags-list">
                {renderTags()}
            </div>
        </div>
    );
}

export default TagsList;