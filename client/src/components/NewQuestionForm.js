import React, { useState, useEffect } from 'react';
import '../stylesheets/index.css';
import axios from 'axios';

function NewQuestionForm({ onQuestionPosted }) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [text, setText] = useState('');
  const [tags, setTags] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState({});
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

  const validateForm = () => {
    let isValid = true;
    let errors = {};

    if (!title || title.length > 50) {
      errors.title = 'The question title cannot be empty and should not exceed 50 characters.';
      isValid = false;
    }

    if (!summary || summary.length > 140) {
      errors.summary = 'The question summary cannot be empty and should not exceed 140 characters.';
      isValid = false;
    }

    if (!text) {
      errors.text = 'The question text cannot be empty.';
      isValid = false;
    }

    const tagList = tags.split(/\s+/);
    if (!tags || (tagList.length > 5 || tagList.some(tag => tag.length > 20 || tag.split('-').length > 2))) {
      errors.tags = 'Cannot be empty. No more than 5 tags, each not exceeding 20 characters. Hyphenated words count as one word.';
      isValid = false;
    }

    //hyperlinks validation check
    const hyperlinkRegex = /\[([^\]]*)\]\(([^\s)]*)\)/g;
    const matches = [...text.matchAll(hyperlinkRegex)];
    const invalidLinks = matches.filter(match => {
      const text = match[1];
      const url = match[2];
      return text === '' || (!url.startsWith('http://') && !url.startsWith('https://'));
    });
    if (invalidLinks.length > 0) {
      errors.text = (errors.text || '') + ' All hyperlinks must start with "http://" or "https://" and must not be empty.';
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
        const inputTags = tags.split(/\s+/).filter(tag => tag.trim() !== '');
        try {
          const tagsResponse = await axios.get('http://localhost:8000/tags');
          const existingTags = tagsResponse.data.map(tag => tag.name.toLowerCase());

          const newTags = inputTags.filter(tag => !existingTags.includes(tag.toLowerCase()));
          if (newTags.length > 0 && userData.reputation < 50) {
            setErrors(prevErrors => ({
              ...prevErrors,
              tags: 'You must have at least 50 reputation points to create new tags.'
            }));
            return;
          }

          const questionData = {
              title,
              summary,
              text,
              tags: inputTags,
              asked_by: username
          };

          await axios.post('http://localhost:8000/questions', questionData);
          onQuestionPosted();
        } catch (error) {
            console.error('Error posting question:', error);
            setErrors(prevErrors => ({ ...prevErrors, form: 'Failed to post the question.' }));
        }
    }
  };

  return (
    <div id="new-question-container" className="new-question-form">
      <form onSubmit={handleSubmit}>
        <label htmlFor="question-title">Question Title*</label>
        <input type="text" id="question-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Limit title to 50 characters or less"/>
        {errors.title && <div className="error-message">{errors.title}</div>}

        <label htmlFor="question-summary">Question Summary*</label>
        <textarea type="text" id="question-summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Limit summary to 140 characters or less"/>
        {errors.summary && <div className="error-message">{errors.summary}</div>}

        <label htmlFor="question-text">Question Text*</label>
        <textarea id="question-text" value={text} onChange={(e) => {setText(e.target.value); setUsername(userData.username);}} placeholder="Add details"></textarea>
        {errors.text && <div className="error-message">{errors.text}</div>}

        <label htmlFor="question-tags">Tags*</label>
        <input type="text" id="question-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Add keywords separated by whitespace"/>
        {errors.tags && <div className="error-message">{errors.tags}</div>}

        <button type="submit" id="post-question">Post Question</button>
        <p style={{color: 'red'}}>* Indicates Required Field</p>
      </form>
    </div>
  );
}

export default NewQuestionForm;