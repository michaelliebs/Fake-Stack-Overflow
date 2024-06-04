import React, { useState, useEffect } from 'react';
import '../stylesheets/index.css';
import axios from 'axios';

const AnswerForm = ({ questionId, onAnswerClose }) => {
  const [username, setUsername] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [textError, setTextError] = useState('');
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

  // Function to handle posting a new answer
  const postNewAnswer = async () => {
    let isValid = true;
    setTextError('');

    if (!answerText.trim()) {
      setTextError('Answer text cannot be empty.');
      isValid = false;
    }

    //hyperlinks validation check 
    const hyperlinkRegex = /\[([^\]]*)\]\(([^\s)]*)\)/g;
    const matches = [...answerText.matchAll(hyperlinkRegex)];
    const invalidLinks = matches.filter(match => {
      const text = match[1];
      const url = match[2];
      return text === '' || (!url.startsWith('http://') && !url.startsWith('https://'));
    });

    if (invalidLinks.length > 0) {
      setTextError('All hyperlinks must start with "http://" or "https://" and must not be empty.');
      isValid = false;
    }

    if (isValid) {
      try {
        await axios.post(`http://localhost:8000/questions/${questionId}/answers`, {
          text: answerText.trim(),
          ans_by: username.trim(),
          ans_date_time: new Date()
      });
      
      // Clear form and close answer form upon succesful submission
      setUsername('');
      setAnswerText('');
      onAnswerClose(questionId);
      } catch (error) {
      console.error('Error posting answer:', error);
      setTextError('Failed to post the answer.');
      }
    }
  };

  // Handler for form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    postNewAnswer();
  };

  return (
    <div id="new-answer-container" className="answer-form-container">
      <form id="new-answer-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="answer-text">Answer Text*</label>
          <textarea
            id="answer-text"
            value={answerText}
            onChange={(e) => {setAnswerText(e.target.value); setUsername(userData.username);}}
          />
          {textError && <div id="text-error" className="error-message">{textError}</div>}
        </div>
        <button type="submit">Post Answer</button>
      </form>
      <p style={{color: 'red'}}>* Indicates Required Field</p>
    </div>
  );
};

export default AnswerForm;