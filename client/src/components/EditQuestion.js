import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EditQuestion({ question, onClose }) {
  const [title, setTitle] = useState(question.title);
  const [summary, setSummary] = useState(question.summary);
  const [text, setText] = useState(question.text);
  const [tags, setTags] = useState('');

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get('http://localhost:8000/tags');
        const tagsFromServer = response.data;
        const tagNames = question.tags
          .map(tagId => tagsFromServer.find(tag => tag._id === tagId)?.name)
          .filter(tagName => tagName) // Filter out any undefined entries
          .join(' ');
        setTags(tagNames);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };
    fetchTags();
  }, [question.tags]);

  const handleUpdate = async () => {
    console.log(question.tags)
    const tagArray = tags.split(' ').map(tag => tag.trim()).filter(tag => tag !== '');
    const updatedQuestion = {
      title,
      summary,
      text,
      tags: tagArray 
    };
    try {
      await axios.put(`http://localhost:8000/questions/${question._id}`, updatedQuestion);
      alert('Question updated successfully.');
      onClose(); // Close the edit modal or component
    } catch (error) {
      console.error('Failed to update question:', error);
      alert('Error updating question.');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/questions/${question._id}`);
      alert('Question deleted successfully.');
      onClose(); // Close the edit modal or component
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Error deleting question.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ marginBottom: '20px' }}>Edit Question</h2>
        <input
            style={{ marginBottom: '10px', padding: '5px', width: '300px' }}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
        />
        <textarea
            style={{ marginBottom: '10px', padding: '5px', width: '300px', height: '100px' }}
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder="Summary"
        />
        <textarea
            style={{ marginBottom: '10px', padding: '5px', width: '300px', height: '200px' }}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Text"
        />
        <input
            style={{ marginBottom: '10px', padding: '5px', width: '300px' }}
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="Tags (space-separated)"
        />
        <div>
            <button
                style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: 'green', color: 'white' }}
                onClick={handleUpdate}
            >
                Save Changes
            </button>
            <button
                style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: 'red', color: 'white' }}
                onClick={handleDelete}
            >
                Delete Question
            </button>
            <button
                style={{ padding: '5px 10px', backgroundColor: 'gray', color: 'white' }}
                onClick={onClose}
            >
                Close
            </button>
        </div>
    </div>
  );
}
export default EditQuestion;
