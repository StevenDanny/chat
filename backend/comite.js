const { MongoClient } = require("mongodb");
const uri =
  "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false";
const client = new MongoClient(uri);

async function getComites() {
  const comites = [];
  try {
    await client.connect();
    await client
      .db("chat")
      .collection("comite")
      .find({})
      .forEach((doc) => {
        comites.push(doc);
      });
    console.log(comites);
    return comites;
  } catch (error) {
    console.log(error);
  }
}

module.exports = getComites;
