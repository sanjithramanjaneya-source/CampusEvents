// MongoDB setup for CampusEvents: collection, validation rules and indexes.
use("campus_events");

const feedbackValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["event_id", "user_id", "user_name", "rating", "created_at"],
    properties: {
      event_id:   { bsonType: ["int", "long", "double"], minimum: 1 },
      user_id:    { bsonType: ["int", "long", "double"], minimum: 1 },
      user_name:  { bsonType: "string" },
      rating:     { bsonType: ["int", "long", "double"], minimum: 1, maximum: 5 },
      comment:    { bsonType: "string", maxLength: 500 },
      created_at: { bsonType: "date" },
      updated_at: { bsonType: "date" },
    },
  },
};

if (!db.getCollectionNames().includes("feedback")) {
  db.createCollection("feedback");
}
db.runCommand({
  collMod: "feedback",
  validator: feedbackValidator,
  validationLevel: "strict",
  validationAction: "error",
});

// One review per student per event
db.feedback.createIndex({ event_id: 1, user_id: 1 }, { unique: true });
// Fast "latest reviews of an event"
db.feedback.createIndex({ event_id: 1, created_at: -1 });

db.feedback.getIndexes();