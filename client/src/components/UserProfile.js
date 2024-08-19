import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../stylesheets/index.css';
import EditQuestion from './EditQuestion';

function UserProfile({ user = null, onEditQuestion }) {
  const [profile, setProfile] = useState(null);
  const [errors, setErrors] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    console.log(profile)
  };

  const handleCloseEdit = () => {
    setSelectedQuestion(null);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    if (user === null) {
      axios.get('http://localhost:8000/users/profile', { withCredentials: true })
        .then(response => {
          const questions = Array.isArray(response.data.questions) ? response.data.questions : [];
          const answers = Array.isArray(response.data.answers) ? response.data.answers : [];
  
          const sortedQuestions = questions.sort((a, b) => new Date(b.ask_date_time) - new Date(a.ask_date_time));
          const sortedAnswers = answers.sort((a, b) => new Date(b.ans_date_time) - new Date(a.ans_date_time));
          setProfile({ ...response.data, questions: sortedQuestions, answers: sortedAnswers });
          })
        .catch(error => {
          console.error('Error fetching user profile:', error);
          setErrors('Failed to load profile');
        });
    }
    else {
      setProfile(user);
    }
  }, [user, onEditQuestion, selectedQuestion ]);

  // Handling loading state
  if (!profile && !errors) {
    return <div className="loading">Loading...</div>;
  }

  // Handling error state
  if (errors) {
    return <div className="error-message">Error: {errors}</div>;
  }

  // Main content when data is loaded and there are no errors
  return (
    <div className="user-profile">
      <h1 className="profile-title">User Profile</h1>
      <p className="profile-detail"><strong>Username:</strong> {profile?.username}</p>
      <p className="profile-detail"><strong>Member since:</strong> {formatDate(profile?.memberSince)}</p>
      <p className="profile-detail"><strong>Reputation:</strong> {profile?.reputation}</p>
      <div className="questions-section">
        <h2>My Questions</h2>
          {selectedQuestion && (
          <EditQuestion question={selectedQuestion} onClose={handleCloseEdit} />
        )}
        {profile.questions && profile.questions.length > 0 ? (
          profile.questions.map(question => (
            <div key={question.id} className="question-item" onClick={() => handleEditQuestion(question)}>
              <p className="question-link">{question.title}</p>
            </div>
          ))
        ) : <p>No questions posted yet.</p>}
      </div>
      <div className="answers-section">
        <h2>My Answers</h2>
        {profile.postedAnswers && profile.postedAnswers.length > 0 ? (
          profile.answers.map(answer => (
            <div key={answer._id} className="answer-item">
              <a href={`/answers/${answer._id}`} className="answer-link">{answer.text}</a>
              <p className="answer-date">Posted on: {formatDate(answer.ans_date_time)}</p>
            </div>
          ))
        ) : <p>No answers posted yet.</p>}
      </div>
    </div>
  );
}

export default UserProfile;
