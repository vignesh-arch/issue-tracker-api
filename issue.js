const { UserInputError } = require("apollo-server-express");

const { getNextSequence, getDB } = require("./db.js");
const { mustBeSignedIn } = require("./auth.js");

const PAGE_SIZE = 10;
async function list(_, { status, effortMin, effortMax, page, search }) {
    const db = getDB();
    const filter = {};
    if (status) filter.status = status;
    if (effortMin !== undefined || effortMax !== undefined) {
        filter.effort = {};
        if (effortMin !== undefined) filter.effort.$gte = effortMin;
        if (effortMax !== undefined) filter.effort.$lte = effortMax;
    }
    if (search) filter.$text = { $search: search };
    const cursor = db.collection('issues').find(filter).sort({ id: 1 }).skip(PAGE_SIZE * (page - 1)).limit(PAGE_SIZE);

    const totalCount = await cursor.count(false);
    const issues = cursor.toArray();
    const pages = Math.ceil(totalCount / PAGE_SIZE);
    return { issues, pages };
}

function validate(issue) {
    const errors = [];
    if (issue.title.length < 3) {
        errors.push('The "title" of the issue must be atleast 3 characters');
    }
    if (issue.status === "Assigned" && !issue.owner) {
        errors.push("The Assigned Issue must have the owner");
    }
    if (errors.length > 0) {
        throw new UserInputError("Invalid input(s)", { errors });
    }
}

async function add(_, { issue }) {
    const db = getDB();
    validate(issue);
    const newIssue = Object.assign({}, issue);
    newIssue.id = await getNextSequence("issues");
    newIssue.created = new Date();
    const result = await db.collection("issues").insertOne(newIssue);
    const savedIssue = await db
        .collection("issues")
        .findOne({ _id: result.insertedId });
    return savedIssue;
}

async function get(_, { id }) {
    const db = getDB();
    const issue = await db.collection("issues").findOne({ id });
    return issue;
}

async function update(_, { id, changes }) {
    const db = getDB();
    if (changes.title || changes.status || changes.owner) {
        const issue = await db.collection("issues").findOne({ id });
        Object.assign(issue, changes);
        validate(issue);
    }
    await db.collection("issues").updateOne({ id }, { $set: changes });
    const savedIssue = await db.collection("issues").findOne({ id });
    return savedIssue;
}

async function remove(_, { id }) {
    const db = getDB();
    const issue = await db.collection("issues").findOne({ id });
    if (!issue) return false;
    issue.deleted = new Date();

    let result = await db.collection("deleted_issues").insertOne(issue);
    if (result.insertedId) {
        result = await db.collection("issues").deleteOne({ id });
        return result.deletedCount === 1;
    }
    return false;
}

async function restore(_, { id }) {
    const db = getDB();
    const issue = await db.collection("deleted_issues").findOne({ id });
    if (!issue) return false;

    let result = await db.collection("issues").insertOne(issue);
    if (result.insertedId) {
        result = await db.collection("deleted_issues").deleteOne({ id });
        return result.deletedCount === 1;
    }
    return false;
}

async function counts(_, { status, effortMin, effortMax }) {
    const db = getDB();
    const filter = {};

    if (status) filter.status = status;

    if (effortMin !== undefined || effortMax !== undefined) {
        filter.effort = {};
        if (effortMin !== undefined) filter.effort.$gte = effortMin;
        if (effortMax !== undefined) filter.effort.$lte = effortMax;
    }

    const results = await db
        .collection("issues")
        .aggregate([
            { $match: filter },
            {
                $group: {
                    _id: { owner: "$owner", status: "$status" },
                    count: { $sum: 1 },
                },
            },
        ])
        .toArray();

    const stats = {};
    results.forEach((result) => {
        const { owner, status: statusKey } = result._id;
        if (!stats[owner]) stats[owner] = { owner };
        stats[owner][statusKey] = result.count;
    });
    return Object.values(stats);
}

module.exports = {
    list,
    add: mustBeSignedIn(add),
    get,
    update: mustBeSignedIn(update),
    delete: mustBeSignedIn(remove),
    counts,
    restore: mustBeSignedIn(restore),
};
