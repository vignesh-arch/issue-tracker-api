const fs = require("fs");
require("dotenv").config();
const { ApolloServer } = require("apollo-server-express");

const about = require("./about.js");
const issue = require("./issue.js");
const GraphQLDate = require("./graphql_date.js");
const { getUser,resolveUser } = require("./auth.js");

const resolvers = {
    Query: {
        about: about.getMessage,
        issueList: issue.list,
        issue: issue.get,
        issueCounts: issue.counts,
        user: resolveUser,
    },
    Mutation: {
        setMessage: about.setMessage,
        addIssue: issue.add,
        issueUpdate: issue.update,
        issueDelete: issue.delete,
        issueRestore: issue.restore,
    },
    GraphQLDate,
};

const apolloServer = new ApolloServer({
    typeDefs: fs.readFileSync("schema.graphql", "utf-8"),
    resolvers,
    context: getContext,
    format_error: (err) => {
        console.log(err);
        return err;
    },
    playground: true,
    introspection: true,
});

function installHandler(app) {
    const enableCors = (process.env.ENABLE_CORS || "true") === "true";
    console.log(`CORS POLICY : ${enableCors}`);
    let cors;
    if (enableCors) {
        const origin = process.env.UI_SERVER_ORIGIN || 'http://localhost:4000';
        const methods = 'POST';
        cors = { origin, methods, credentials: true };
    }
    else {
        cors = 'false';
    }
    apolloServer.applyMiddleware({ app, path: "/graphql", cors });
}

function getContext({ req }) {
    const user = getUser(req);
    return { user };
}

module.exports = installHandler;
