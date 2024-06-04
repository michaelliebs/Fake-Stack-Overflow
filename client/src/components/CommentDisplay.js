import React, { useState, useEffect } from 'react';
import '../stylesheets/index.css';
import axios from 'axios';

const Comments = ({ questionId, answerId, parentType }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [startIndex, setStartIndex] = useState(0);
    const [error, setError] = useState('');
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

    // Fetch all comments
    useEffect(() => {
        const fetchComments = async () => {
            let url = parentType === 'question' 
              ? `http://localhost:8000/questions/${questionId}/comments`
              : `http://localhost:8000/answers/${answerId}/comments`;
        
            try {
              const response = await axios.get(url);
              const sortedComments = response.data.sort((a, b) => new Date(b.ans_date_time) - new Date(a.ans_date_time));
              setComments(sortedComments);
            } catch (error) {
              console.error('Error fetching comments:', error);
            }
          };
          fetchComments();
    }, [questionId, comments.length, parentType, answerId]);


      // Transform Markdown-style links to HTML links
    const transformTextToHyperlinks = (text) => {
        const hyperlinkRegex = /\[([^\]]+)\]\(([^\s)]+)\)/g;
        return text.replace(hyperlinkRegex, (match, linkText, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
    };
    
    // Handle new comment submission
    const handleCommentSubmit = async (e) => {
        try {
            if (newComment.length > 140) {
                setError('Comment cannot exceed 140 characters.');
                return;
            }
            if (userData.reputation < 50) {
                setError('You must have at least 50 reputation points to comment.');
                return;
            }
            if (e.key === 'Enter' && newComment.trim()) {
                const url = parentType === 'question'
                ? `http://localhost:8000/questions/${questionId}/comments`
                : `http://localhost:8000/answers/${answerId}/comments`;

                axios.post(url, { text: newComment, ans_by: userData.username })
                .then(() => {
                    setNewComment('');
                    // Refresh comments to include the new one
                    axios.get(url)
                        .then(response => setComments(response.data))
                        .catch(error => console.error('Error fetching comments:', error));
                    setStartIndex(0);
                })}
        } catch (error) {alert('Error posting comment: ' + error.response.data)}
    };

    // Upvote a comment
    const handleUpvote = async (commentId) => {
        try {
            await axios.put(`http://localhost:8000/comments/${commentId}/upvote`, { username: userData.username })
            .then(() => {
                const url = parentType === 'question'
                ? `http://localhost:8000/questions/${questionId}/comments`
                : `http://localhost:8000/answers/${answerId}/comments`;
                // Refresh comments to include the new one
                axios.get(url)
                .then(response => {
                    const sortedComments = response.data.sort((a, b) => new Date(b.ans_date_time) - new Date(a.ans_date_time));
                    setComments(sortedComments);
                })
                .catch(error => console.error('Error fetching comments:', error));
                setStartIndex(startIndex);
            })
        } catch (error) { 
            if (error.response.status === 400) {
                setError('You cannot upvote your own comment.');
              }
         }
    };

    const handleNextClick = () => {
        if (startIndex + 3 >= comments.length) {
          setStartIndex(0);
        }
        else
          setStartIndex(startIndex + 3);
      };
    
      const handlePrevClick = () => {
        setStartIndex(startIndex - 3);
      };

    // Render comments with upvote buttons
    const renderComments = () => {
        if (comments.length === 0) {
            return <p style={{ fontSize: '.9em', margin: '10px calc(2.5%) 5px calc(2.5%)', color: 'gray' }}>No comments here yet...</p>;
        }
        const paginatedComments = comments.slice(startIndex, startIndex + 3);
        if (parentType === 'question') {
        return paginatedComments.map(comment => (
            <div key={comment._id} className='question-comment'>
                <p>{<p dangerouslySetInnerHTML={{ __html: transformTextToHyperlinks(comment.text) }}></p>} - <strong>{comment.ans_by}</strong> ({comment.votes} votes)</p>
                {userData.username && userData.username === comment.ans_by ? null : (
                    <button onClick={() => handleUpvote(comment._id)} disabled={comment.voters.includes(userData.username)} style={{ opacity: comment.voters.includes(userData.username) ? 0.5 : 1 }}>
                        Upvote
                    </button>
                )}
            </div>
        ));}
        else {
            return paginatedComments.map(comment => (
                <div key={comment._id} className='answer-comment'>
                    <p dangerouslySetInnerHTML={{ __html: transformTextToHyperlinks(comment.text) }}></p>
                    <p>- <strong>{comment.ans_by}</strong> ({comment.votes} votes)</p>
                    {userData.username && userData.username === comment.ans_by ? null : (
                        <button onClick={() => handleUpvote(comment._id)} disabled={comment.voters.includes(userData.username)} style={{ opacity: comment.voters.includes(userData.username) ? 0.5 : 1 }}>Upvote</button>
                    )}
                </div>
            ));}
    };

    const renderPaginatedComments = () => {
        if (comments.length <= 3) {
          return null;
        }
        return (
          <div className="sub-answer-list">
            <div className="pagination-buttons">
              <button onClick={handlePrevClick} disabled={startIndex === 0}>Prev</button>
              <button onClick={handleNextClick} disabled={comments.length <= 3}>Next</button>
            </div>
          </div>
        )};
    
        return (
            <div className={parentType === 'question' ? 'question-comments-container' : 'answer-comments-container'}>
                <h3>{parentType === 'question' ? 'Question Comments' : ''}</h3>
                {renderComments()}
                {userData.username && (
                    <div className={parentType === 'question' ? 'question-comments-form' : 'answer-comments-form'}>
                        <input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment"
                            onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(e)}
                        />
                        {error && <p style={{color: 'red'}} className="error">{error}</p>}
                    </div>
                )}
                {renderPaginatedComments()}
            </div>
        );
};

export default Comments;
