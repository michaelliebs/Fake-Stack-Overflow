import React from 'react';
import SearchResultsHeader from './SearchResultsHeader';
import '../stylesheets/index.css';
import QuestionList from './QuestionList';

function SearchResults({ onAskQuestionClick, onNewestClick, onActiveClick, onUnansweredClick, currentFilter, searchResults, onQuestionClick }) {

    return (
        <div className="main-content">
            <SearchResultsHeader
                onAskQuestionClick={onAskQuestionClick}
                onNewestClick={onNewestClick}
                onActiveClick={onActiveClick}
                onUnansweredClick={onUnansweredClick}
                questionCount={searchResults.length}
            />
            <QuestionList
                questions={searchResults}
                currentFilter={currentFilter}
                onQuestionClick={onQuestionClick}
            />
        </div>
    );
}

export default SearchResults;