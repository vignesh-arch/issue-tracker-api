const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");

const GraphQLDate = new GraphQLScalarType({
    name: "GraphQLDate",
    description: "A custom Scalar type for date in GraphQL",
    serialize(value) {
        return value.toISOString();
    },
    parseValue(value) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? undefined : date;
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            const date = new Date(ast.value);
            return Number.isNaN(date.getTime()) ? undefined : date;
        }
        return undefined;
    },
});

module.exports = GraphQLDate;
