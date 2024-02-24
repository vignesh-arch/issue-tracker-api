const owners = [
    "vignesh",
    "venkat",
    "vel",
    "bhuvana",
    "sadhasivam",
    "vijaya",
    "sivagami",
    "muruganantham",
];
const statuses = ["New", "Assigned", "Closed", "Fixed"];

const initialCount = db.issues.countDocuments();
for (let i = 0; i < 100; i++) {
    const randomCreatedDate =
        new Date() - Math.floor(Math.random() * 60) * 1000 * 60 * 60 * 24;
    const created = new Date(randomCreatedDate);
    const randomDue =
        new Date() - Math.floor(Math.random() * 60) * 1000 * 60 * 60 * 24;
    const due = new Date(randomDue);

    const owner = owners[Math.floor(Math.random() * 8)];
    const status = statuses[Math.floor(Math.random() * 4)];
    const title = `Lorem Ispum sole meta asmet ${i}`;
    const effort = Math.floor(Math.random() * 20);
    const id = initialCount + i + 1;
    const issue = { id, title, created, due, effort, owner, status };

    db.issues.insertOne(issue);
}

const count = db.issues.countDocuments();
db.counters.updateOne({ _id: "issues" }, { $set: { current: count } });
print("New Issue Count:", count);
