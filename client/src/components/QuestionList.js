import React, { useState, useEffect, useCallback } from 'react';
import '../stylesheets/index.css';
import axios from 'axios';

function QuestionList({ onQuestionClick, currentFilter, questions: externalQuestions }) {
  const [questions, setQuestions] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  const sortQuestionsByActivity = useCallback((questionsArray) => {
    return questionsArray.sort((a, b) => {
      const getLastActivityDate = (answers) => answers.reduce((latest, answer) => {
        const answerDate = new Date(answer.ans_date_time);
        return answerDate > latest ? answerDate : latest;
      }, new Date(0));

      let lastActivityA = getLastActivityDate(a.answers);
      let lastActivityB = getLastActivityDate(b.answers);

      return lastActivityB - lastActivityA;
    });
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:8000/questions');
        let filteredQuestions = [...response.data];
        // Sort questions based on the current filter
        if (currentFilter === 'newest') {
          filteredQuestions.sort((a, b) => new Date(b.ask_date_time) - new Date(a.ask_date_time));
        } else if (currentFilter === 'active') {
          filteredQuestions = sortQuestionsByActivity(filteredQuestions);
        } else if (currentFilter === 'unanswered') {
          // Filter questions to show only those without answers
          filteredQuestions.sort((a, b) => new Date(b.ask_date_time) - new Date(a.ask_date_time));
          filteredQuestions = filteredQuestions.filter(question => question.answers.length === 0);
        }
        setQuestions(filteredQuestions);
        setStartIndex(0);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };
    if (externalQuestions) {
      let filteredQuestions = [...externalQuestions];
      if (currentFilter === 'newest') {
        filteredQuestions.sort((a, b) => new Date(b.ask_date_time) - new Date(a.ask_date_time));
      } else if (currentFilter === 'active') {
        filteredQuestions = sortQuestionsByActivity(filteredQuestions);
      } else if (currentFilter === 'unanswered') {
        // Filter questions to show only those without answers
        filteredQuestions.sort((a, b) => new Date(b.ask_date_time) - new Date(a.ask_date_time));
        filteredQuestions = filteredQuestions.filter(question => question.answers.length === 0);
      }
      setQuestions(filteredQuestions);
    } else {
      fetchQuestions();
    }  
  }, [currentFilter, externalQuestions, sortQuestionsByActivity]);

  const incrementViewCount = async (questionId) => {
  try {
    const response = await axios.put(`http://localhost:8000/questions/${questionId}/increment-view`);
    return response.data;
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};

  const handleQuestionClick = async (questionId) => {
    await incrementViewCount(questionId);
    onQuestionClick(questionId); 
  };

  // Function to calculate the time ago from the date posted
  const getTimeAgo = (datePosted) => {
    const now = new Date();
    const postedDate = new Date(datePosted);
    const secondsAgo = Math.floor((now - postedDate) / 1000); // Total seconds ago
    const minutesAgo = Math.floor(secondsAgo / 60); // Total minutes ago
    const hoursAgo = Math.floor(minutesAgo / 60); // Total hours ago
    const daysAgo = Math.floor(hoursAgo / 24); // Total days ago
    const yearsAgo = now.getFullYear() - postedDate.getFullYear();

    if (yearsAgo > 0) {
      return `${postedDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })} at ${postedDate.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}`;
    } else if (daysAgo >= 1) {
      return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
    } else if (hoursAgo >= 1) {
      const remainingMinutes = minutesAgo % 60;
      return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''} ago`;
    } else if (minutesAgo >= 1) {
      const remainingSeconds = secondsAgo % 60;
      return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} and ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''} ago`;
    } else {
      return `${secondsAgo} seconds ago`;
    }
  };

  const handleNextClick = () => {
    if (startIndex + 5 >= questions.length) {
      setStartIndex(0);
    }
    else
      setStartIndex(startIndex + 5);
  };

  const handlePrevClick = () => {
    setStartIndex(startIndex - 5);
  };

  const renderQuestions = () => {
    const paginatedQuestions = questions.slice(startIndex, startIndex + 5);
    if (paginatedQuestions.length === 0) {
      return <div style={{ fontWeight: 'bold', padding: '15px' }}>No Questions Found</div>;
    }

    return paginatedQuestions.map((question) => (
      <li
        className="question-item"
        key={question._id}
        onClick={() => {
          handleQuestionClick(question._id);
        }}
      >
        <div className="question-details">
          <div className="question-answers">{`${question.answers.length}`} answers</div>
          <div className="question-votes">{`${question.votes} votes`}</div>
          <div className="question-views">{`${question.views} views`}</div>
        </div>
        <h3 className="question-title">{question.title}</h3>
        <p className="question-summary">{question.summary}</p>
        <div className="question-tags">
          {question.tags.map((tag) => (
            <span key={tag._id} className="question-tag">{tag.name}</span>
          ))}
        </div>
        <div className="question-askedBy">
          <span style={{ color: 'red' }}>{question.asked_by}</span> asked {getTimeAgo(question.ask_date_time)}
        </div>
      </li>
    ));
  };

  const renderPaginatedQuestions = () => {
    const paginatedQuestions = questions.slice(startIndex, startIndex + 5);
    if (paginatedQuestions.length === 0) {
      return null;
    }
    return (
    <div className="sub-question-list">
        <div className="pagination-buttons">
          <button onClick={handlePrevClick} disabled={startIndex === 0}>Prev</button>
          <button onClick={handleNextClick} disabled={questions.length < 5}>Next</button>
        </div>
      </div>
    );
  };


  return (
    <div className="questions-list-container">
      <div className="questions-list">
        <ul>{renderQuestions()}</ul>
      </div>
      {renderPaginatedQuestions()}
    </div>
  );
}

export default QuestionList;