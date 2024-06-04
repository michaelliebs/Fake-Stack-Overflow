import React, { useEffect, useState } from 'react';
import '../stylesheets/index.css';
import axios from 'axios'; 

function MainContentHeader({ onAskQuestionClick, onNewestClick, onActiveClick, onUnansweredClick, questions }) {
  const [questionCount, setQuestionCount] = useState(0);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const fetchQuestionCount = async () => {
      try {
        const response = await axios.get('http://localhost:8000/questions/count');
        setQuestionCount(response.data.count);
      } catch (error) {
        console.error('Error fetching question count:', error);
      }
    };
    fetchQuestionCount();
  }, [questions]);


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
        <h2>All Questions</h2>
        {userData.username && (
          <button className="ask-question" onClick={onAskQuestionClick}>
            Ask Question
          </button>
        )}
      </div>

      <div className="question-stats">
        <span id="question-count">{questionCount} {questionCount > 1 ? 'questions' : 'question'}</span>
        <div className="filter-buttons">
          <button className="filter-button newest" onClick={onNewestClick}>Newest</button>
          <button className="filter-button active" onClick={onActiveClick}>Active</button>
          <button className="filter-button unanswered" onClick={onUnansweredClick}>Unanswered</button>
        </div>
      </div>
    </div>
  );
}

export default MainContentHeader;