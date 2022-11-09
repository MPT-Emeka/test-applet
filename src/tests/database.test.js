const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

describe("Database Connection", () => {
  beforeAll(async () => {
    mongoose.connect(process.env.DB_URL);
  });

  test("should return true", async () => {
    mongoose.connection.once("open", () => {
      expect(mongoose.connection.readyState).toEqual(1);
    });
  }, 2000);
});
// console.log(mongoose.connection.readyState);
