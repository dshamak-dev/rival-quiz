import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;
const REGION = process.env.REGION || "draft";

export function connect() {
  // connect to the database
  //   console.log(`Connecting to ${process.env.MONGODB_URI}`);
  const uri = `${MONGO_URI}/${REGION}/${REGION}`;

  mongoose.connection.on("connected", () =>
    console.log("Connected to Mongo DB")
  );
  //   mongoose.connection.on("open", () => console.log("DB open"));
  mongoose.connection.on("disconnected", () => console.log("DB disconnected"));
  mongoose.connection.on("reconnected", () => console.log("DB reconnected"));
  //   mongoose.connection.on("error", (error) => console.log("DB error: " + error));
  mongoose.connection.on("disconnecting", () =>
    console.log(" DBdisconnecting")
  );
  //   mongoose.connection.on("close", () => console.log(" DBclose"));

  if (!uri) {
    return null;
  }

  return mongoose.connect(uri).catch((err) => {
    console.log("db connection error", err);

    return null;
  });
}
