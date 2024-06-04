import React from 'react';
import '../stylesheets/index.css';

function WelcomePage({ onSignInClick, onSignUpClick, onGuestModeClick }) {
    return (
        <div className="welcome-container">
            <h1 className="welcome-title">Fake StackOverflow</h1>
            <div className="buttons-container">
                <button className="sign-up-btn" onClick={onSignUpClick}>Register as a New User</button>
                <button className="sign-in-btn" onClick={onSignInClick}>Login as an Existing User</button>
                <button className="guest-mode-btn" onClick={onGuestModeClick}>Continue as a Guest User</button>
            </div>
        </div>
    );
}

export default WelcomePage;