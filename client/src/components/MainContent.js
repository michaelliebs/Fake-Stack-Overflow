import React from 'react';
import MainContentHeader from './MainContentHeader';
import '../stylesheets/index.css';
import QuestionList from './QuestionList';

function MainContent({ onAskQuestionClick, onNewestClick, onActiveClick, onUnansweredClick, currentFilter, onQuestionClick }) {

    return (
      <div className="main-content">
        <MainContentHeader onAskQuestionClick={onAskQuestionClick}
        onNewestClick={onNewestClick}
        onActiveClick={onActiveClick}
        onUnansweredClick={onUnansweredClick}
        />
        <QuestionList 
          currentFilter={currentFilter}
          onQuestionClick={onQuestionClick}
          onSearchQuestionClick={onQuestionClick}
        />
      </div>
    );
  }

export default MainContent;
