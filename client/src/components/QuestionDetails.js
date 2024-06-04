import React, { useEffect, useState } from 'react';
import '../stylesheets/index.css';
import axios from 'axios';
import Comments from './CommentDisplay';

const QuestionDetails = ({ questionId, onAskQuestionClick, onAnswerQuestionClick }) => {
  const [question, setQuestion] = useState(null);
  const [startIndex, setStartIndex] = useState(0);
  const [userData, setUserData] = useState({});
  const [errors, setErrors] = useState({});
  
  const transformTextToHyperlinks = (text) => {
    const hyperlinkRegex = /\[([^\]]*)\]\(([^\s)]*)\)/g;
    return text.replace(hyperlinkRegex, (match, linkText, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
  };

  const createMarkup = (htmlString) => {
    return { __html: htmlString };
  };
  
  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/questions/${questionId}`);
        const data = response.data;

        // Sort answers by date, newest first
        data.answers.sort((a, b) => new Date(b.ans_date_time) - new Date(a.ans_date_time));
        setQuestion(response.data);
      } catch (error) {
        console.error('Error fetching question details:', error);
      }
    };
    fetchQuestionDetails();
  }, [questionId]);

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

  if (!question) return <div div>Loading question details...</div>;

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
    if (startIndex + 5 >= question.answers.length) {
      setStartIndex(0);
    }
    else
      setStartIndex(startIndex + 5);
  };

  const handlePrevClick = () => {
    setStartIndex(startIndex - 5);
  };

  const handleVote = async (questionId, isUpvote) => {
    if (!userData || userData.reputation < 50) {
      setErrors({ ...errors, vote: 'You need at least 50 reputation to vote.' });
      return;
    }
    
    const url = `http://localhost:8000/questions/${questionId}/${isUpvote ? 'upvote' : 'downvote'}`;
    try {
      await axios.put(url, { userData }, { withCredentials: true });
      // After voting, fetch the updated question details to reflect the new vote count
      const updatedQuestion = await axios.get(`http://localhost:8000/questions/${questionId}`);
      setQuestion(updatedQuestion.data);
      setErrors({ ...errors, vote: '' });
    } catch (error) {
      if (error.response.status === 400) {
        setErrors({ ...errors, vote: 'You cannot vote on your own question.' });
      }
      else {
      console.error('Error voting on question:', error);
      setErrors({ ...errors, vote: 'Failed to record your vote. Please try again.' });}
    }
  };

  const handleAnswerVote = async (answerId, isUpvote) => {
    if (!userData || userData.reputation < 50) {
      setErrors({ ...errors, [answerId]: 'You need at least 50 reputation to vote.' });
      return;
    }
  
    const url = `http://localhost:8000/answers/${answerId}/${isUpvote ? 'upvote' : 'downvote'}`;
    try {
      await axios.put(url, { userData }, { withCredentials: true });
      // Fetch updated question details to reflect new vote counts
      const updatedQuestion = await axios.get(`http://localhost:8000/questions/${questionId}`);
      setQuestion(updatedQuestion.data);
      setErrors({ ...errors, [answerId]: '' });
    } catch (error) {
      if (error.response.status === 400) {
        setErrors({ ...errors, [answerId]: 'You cannot vote on your own answer.' });
      }
      else {
      console.error('Error voting on answer:', error);
      setErrors({ ...errors, [answerId]: 'Failed to record your vote. Please try again.' });}
    }
  };

  const renderAnswers = () => {
    const paginatedAnswers = question.answers.slice(startIndex, startIndex + 5);
    if (paginatedAnswers.length === 0) {
      return <p style={{ padding: '0 calc(2.5%) 0 calc(2.5%)', color: 'gray' }}>No answers here yet...</p>;
    }
    // Sort answers by date, newest first
    paginatedAnswers.sort((a, b) => new Date(b.ans_date_time) - new Date(a.ans_date_time));
    return paginatedAnswers.map(answer => (
      <div className="answer" key={answer._id}>
        <p dangerouslySetInnerHTML={createMarkup(transformTextToHyperlinks(answer.text))}></p>
        <p>
          <strong style={{ color: 'green' }}>- {answer.ans_by}</strong>{' '}
          answered {getTimeAgo(answer.ans_date_time)} (<strong>{answer.votes} votes</strong>)
        </p>
        {userData.username && userData.username !== answer.ans_by && (
          <div className='question-vote'>
            {!answer.upvoters.includes(userData.username) && !answer.downvoters.includes(userData.username) && (
              <>
                <button onClick={() => handleAnswerVote(answer._id, true)}>Upvote</button>
                <button onClick={() => handleAnswerVote(answer._id, false)}>Downvote</button>
              </>
            )}
            {answer.upvoters.includes(userData.username) && (
              <>
                <button disabled style={{ opacity: '0.5' }}>Upvoted</button>
                <button onClick={() => handleAnswerVote(answer._id, false)}>Downvote</button>
              </>
            )}
            {answer.downvoters.includes(userData.username) && (
              <>
                <button onClick={() => handleAnswerVote(answer._id, true)}>Upvote</button>
                <button disabled style={{ opacity: '0.5' }}>Downvoted</button>
              </>
            )}
          </div>
        )}
        {errors[answer._id] && <div className="error">{errors[answer._id]}</div>}
        {answer.comments && <Comments questionId={questionId} answerId={answer._id} parentType={'answer'}/>}
      </div>
    ))
  };

  const renderPaginatedAnswers = () => {
    if (question.answers.length <= 5) {
      return null;
    }
    return (
      <div className="sub-answer-list">
        <div className="pagination-buttons">
          <button onClick={handlePrevClick} disabled={startIndex === 0}>Prev</button>
          <button onClick={handleNextClick} disabled={question.answers.length <= 5}>Next</button>
        </div>
      </div>
    )};

  return (
    <div className="question-details-container" id="question-details-container">
      <div className="question-details-inner" id="question-details-inner">
        <div className='question-details-inner-header'>
          <p className="question-views-and-answers">
            {question.answers.length} answers {question.votes} votes {question.views} views 
          </p>
          {userData.username && (
            <button className="ask-question-answer-pg" onClick={onAskQuestionClick}>
              Ask Question
            </button>
          )}
        </div>
        <h2 className="question-title-answer-pg">{question.title}</h2>
        <p className="question-text" dangerouslySetInnerHTML={createMarkup(transformTextToHyperlinks(question.text))}></p>
        <div className='question-details-tags'>
          {question.tags.map((tag) => (
            <span key={tag._id} className="question-details-tag">{tag.name}</span>
          ))}
        </div>
        <p className="question-meta">
          <strong style={{ color: 'red' }}>{question.asked_by}</strong>{' '}
          asked {getTimeAgo(question.ask_date_time)}
        </p>
        {!userData.username || userData.username !== question.asked_by ? (
          <div className='question-vote'>
            {userData.username && !question.upvoters.includes(userData.username) && !question.downvoters.includes(userData.username) && (
              <>
                <button onClick={() => handleVote(questionId, true)}>Upvote</button>
                <button onClick={() => handleVote(questionId, false)}>Downvote</button>
              </>
            )}
            {userData.username && question.upvoters.includes(userData.username) && (
              <>
                <button disabled style={{ opacity: '0.5' }}>Upvoted</button>
                <button onClick={() => handleVote(questionId, false)}>Downvote</button>
              </>
            )}
            {userData.username && question.downvoters.includes(userData.username) && (
              <>
                <button onClick={() => handleVote(questionId, true)}>Upvote</button>
                <button disabled style={{ opacity: '0.5' }}>Downvoted</button>
              </>
            )}
          </div>
        ) : null}
        {errors.vote && <div className="error">{errors.vote}</div>}
        {question.comments && <Comments questionId={questionId} parentType={'question'}/>}
      </div>
      <div className='question-answers-container'>
        <h3>{'Question Answers'}</h3>
        <div className="question-answers" id="question-answers">
          {renderAnswers()}
        </div>
        
      </div>
      <div className='details-footer'>
        {renderPaginatedAnswers()}
        {userData.username && (
          <button id="answer-question" onClick={onAnswerQuestionClick}>
            Answer Question
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionDetails;