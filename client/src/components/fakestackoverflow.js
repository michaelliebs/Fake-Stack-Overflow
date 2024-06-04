import React, { useState } from 'react';
import '../stylesheets/index.css';
import Header from './Header.js';
import Sidebar from './Sidebar.js';
import MainContent from './MainContent.js';
import NewQuestionForm from './NewQuestionForm.js';
import TagList from './TagList.js';
import SearchResults from './SearchResults';
import QuestionDetails from './QuestionDetails.js';
import AnswerForm from './AnswerForm.js';
import WelcomePage from './WelcomePage.js';
import SignIn from './SignIn.js';
import SignUp from './SignUp.js';
import UserProfile from './UserProfile.js';
import AdminContent from './AdminContent.js';
import axios from 'axios';

export default function FakeStackOverflow() {
  // State to control visibility of components
  const [showWelcome, setShowWelcome] = useState(true);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuestionDetails, setShowQuestionDetails] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('newest');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [error, setError] = useState(null);
  const [showAdminContent, setShowAdminContent] = useState(false);
  const [user, setUser] = useState(null);


  const resetViews = () => {
    if (showMainContent) {
      setCurrentFilter('newest');
    }
    setShowMainContent(false);
    setShowNewQuestionForm(false);
    setShowTags(false);
    setShowSearchResults(false);
    setShowQuestionDetails(false);
    setShowAnswerForm(false);
    setShowWelcome(false);
    setShowSignUp(false);
    setShowSignIn(false);
    setShowProfile(false);
    setShowAdminContent(false);
  }

  const handleSignIn = () => {
    resetViews();
    setShowSignIn(true);
  };

  const handleSignUp = () => {
    resetViews();
    setShowSignUp(true);
  };

  const handleGuestMode = () => {
    resetViews();
    setShowMainContent(true);
  };

  const handleSignInSuccess = (userData) => {
    setShowSignIn(false);
    if (userData.isAdmin) {
      setShowAdminContent(true);
    } else {
      setShowMainContent(true);
    }
    console.log(userData);
  };

  const handleSignUpSuccess = () => {
    // console.log(data);
    setShowSignUp(false);
    setShowSignIn(true);
  };

  // Function to handle the click event on the "Ask Question" button
  const handleAskQuestionClick = () => {
    resetViews();
    setShowNewQuestionForm(true);
  };

  const handleSearchResults = (results) => {
    resetViews();
    setCurrentFilter('newest');
    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleOnQuestionSidebarClick = () => {
    if (!showMainContent) {
      resetViews();
      setShowMainContent(true);
    }
    else {
      setCurrentFilter('newest');
    }
  };

  const handleOnTagsSidebarClick = () => {
    resetViews();
    setShowTags(true);
  }

  const handleOnProfileClick = () => {
    resetViews();
    setUser(null);
    setShowProfile(true);
  }

  const handleLogout = async () => {
    try {
      await axios.post('/users/logout');
      document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; secure; httponly"; // cookie expiration set to old date
    } catch (error) {
      console.error('Logout failed', error);
    }
    resetViews();
    setShowWelcome(true);
  }

  const handleOnQuestionForm = () => {
    resetViews();
    setShowMainContent(true);
  };

  const handleTagClick = async (tagName) => {
    const formattedTagQuery = `[${tagName}]`;
    try {
      const response = await axios.get(`http://localhost:8000/search?query=${encodeURIComponent(formattedTagQuery)}`);
      handleSearchResults(response.data);
      error && setError(null);
      setCurrentFilter('newest');
    } catch (error) {
      console.error('Error fetching questions by tag:', error);
      setError('Error fetching questions by tag. Please try again later.');
    }
  };

  const handleBackToWelcome = () => {
    setError(null);
    resetViews();
    setShowWelcome(true);
  };


  //handler functions for sorting
  const handleNewestClick = () => setCurrentFilter('newest');
  const handleActiveClick = () => setCurrentFilter('active');
  const handleUnansweredClick = () => setCurrentFilter('unanswered');

  const handleSearchNewestClick = () => {
    setCurrentFilter('newest');
  }

  const handleSearchActiveClick = () => {
    setCurrentFilter('active');
  }

  const handleSearchUnansweredClick = () => {
    setCurrentFilter('unanswered');
  }

  const handleOnQuestionClick = (questionId) => {
    setSelectedQuestionId(questionId);
    resetViews();
    setShowQuestionDetails(true);
  }

  const handleAnswerQuestionClick = () => {
    resetViews();
    setShowAnswerForm(true);
  }

  const handleOnAnswerClose = (questionId) => {
    setSelectedQuestionId(questionId);
    resetViews();
    setShowQuestionDetails(true);
  }

  const handleAdminSidebarClick = () => {
    resetViews();
    setShowAdminContent(true); 
};

const handleEditQuestionClick = (question) => {
  setSelectedQuestionId(question._id);
  resetViews();
  setShowNewQuestionForm(true);
}
  const handleOnUserClick = (user) => {
    resetViews();
    setUser(user);
    setShowProfile(true);
  }


  try {
    return (
      <div>
        {showWelcome && <WelcomePage onSignInClick={handleSignIn} onSignUpClick={handleSignUp} onGuestModeClick={handleGuestMode} />}
        {showSignIn && <SignIn onSignInSuccess={handleSignInSuccess} />}
        {showSignUp && <SignUp onSignUpSuccess={handleSignUpSuccess} />}
        {!showWelcome && !showSignIn && !showSignUp && (
          <>
            <Header
              onSearch={handleSearchResults}
              onProfileClick={handleOnProfileClick}
              onLogoutClick={handleLogout}
            />
            {error && (
              <div className="error-message">
                <h2>Error: {error}</h2>
                <button onClick={handleBackToWelcome}>Return to Welcome Page</button>
              </div>
            )}
            <div className="container">
              <Sidebar
                onQuestionsSidebarClick={handleOnQuestionSidebarClick}
                onTagsSidebarClick={handleOnTagsSidebarClick}
                onAdminSidebarClick={handleAdminSidebarClick}
                activeSection={showAdminContent ? 'admin' : (showMainContent ? 'questions' : (showTags ? 'tags' : 'search'))}
              />
              {showAdminContent && <AdminContent onUserClick={handleOnUserClick}/>}
              {showMainContent && <MainContent
                onAskQuestionClick={handleAskQuestionClick}
                onNewestClick={handleNewestClick}
                onActiveClick={handleActiveClick}
                onUnansweredClick={handleUnansweredClick}
                currentFilter={currentFilter}
                onQuestionClick={handleOnQuestionClick}
              />}
              {showProfile && <UserProfile onEditQuestion={handleEditQuestionClick} user={user}/>}
              {showNewQuestionForm && <NewQuestionForm onQuestionPosted={handleOnQuestionForm} />}
              {showQuestionDetails && selectedQuestionId != null && <QuestionDetails
                questionId={selectedQuestionId}
                onAskQuestionClick={handleAskQuestionClick}
                onAnswerQuestionClick={handleAnswerQuestionClick} />}
              {showTags && <TagList
                handleAskQuestionClick={handleAskQuestionClick}
                onTagClick={handleTagClick}
              />}
              {showSearchResults && (<SearchResults
                searchResults={searchResults}
                onAskQuestionClick={handleAskQuestionClick}
                onNewestClick={handleSearchNewestClick}
                onActiveClick={handleSearchActiveClick}
                onUnansweredClick={handleSearchUnansweredClick}
                currentFilter={currentFilter}
                onQuestionClick={handleOnQuestionClick}
              />
              )}
              {showAnswerForm && <AnswerForm
                questionId={selectedQuestionId}
                onAnswerClose={handleOnAnswerClose} />}
            </div>
          </>
        )}
      </div>
    );
  } catch (error) {
    setError(true);
    return (
      <div className="error-message">
        <h2>Error: {error.message}</h2>
        <button onClick={handleBackToWelcome}>Return to Welcome Page</button>
      </div>
    );
  }
}