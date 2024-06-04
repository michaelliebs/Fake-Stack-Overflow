import React, { useEffect, useState } from 'react';
import '../stylesheets/index.css';
import axios from 'axios';

function SearchResultsHeader({ onAskQuestionClick, questionCount, onNewestClick, onActiveClick, onUnansweredClick }) {
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
        <div className="main-content-header">
            <div className="question-stats-header">
                <h2>Search Results</h2>
                {userData.username && <button className="ask-question" 
                onClick={onAskQuestionClick}>
                Ask Question
                </button>}
            </div>

            <div className="question-stats">
                <span id="question-count">{questionCount} {questionCount === 1 ? 'question' : 'questions'}</span>
                <div className="filter-buttons">
                    <button className="filter-button newest" onClick={onNewestClick}>Newest</button>
                    <button className="filter-button active" onClick={onActiveClick}>Active</button>
                    <button className="filter-button unanswered" onClick={onUnansweredClick}>Unanswered</button>
                </div>
            </div>
        </div>
    );
}

export default SearchResultsHeader;