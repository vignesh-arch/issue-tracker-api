const { mustBeSignedIn } = require('./auth.js');

let aboutMessage = "Issue Tracker Version 1.0";

const setMessage = (_, { message }) => {
    aboutMessage = message;
    return aboutMessage;
};

const getMessage = () => aboutMessage;

module.exports = { setMessage: mustBeSignedIn(setMessage), getMessage };
