import { openDatabaseSync } from "expo-sqlite/next";
import Chance from "chance";
import { SMALL_QUERY } from "./constants";

const dbNext = openDatabaseSync("db.testDbNext");
const chance = new Chance();


/** @type {import("./App").SQLiteImpl} */
export const SQLiteNext = {
  async addData(j) {
    await dbNext.withTransactionAsync(
      async () => {
        const insertStatement = dbNext.prepareSync(
          'INSERT INTO "Test" (id, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        )
        try {

          /**
           * @type {Promise<unknown>[]}
           */
          const promises = [];
          for (let i = j * 50000; i < j * 50000 + 50000; i++) {
            promises.push(insertStatement.executeAsync(
              [
                i,
                chance.name(),
                chance.name(),
                chance.name(),
                chance.name(),
                chance.name(),
                chance.integer(),
                chance.integer(),
                chance.integer(),
                chance.integer(),
                chance.integer(),
                chance.floating(),
                chance.floating(),
                chance.floating(),
                chance.floating(),
              ]));
          }
          await Promise.all(promises);
        } finally {
          insertStatement.finalizeSync()
        }
      },
    );

    console.warn("db created");
  },
  async createDB() {
    await dbNext.withTransactionAsync(
      async () => {
        await dbNext.execAsync("DROP TABLE IF EXISTS Test;");

        await dbNext.execAsync(
          "CREATE TABLE Test ( id INT PRIMARY KEY, v1 TEXT, v2 TEXT, v3 TEXT, v4 TEXT, v5 TEXT, v6 INT, v7 INT, v8 INT, v9 INT, v10 INT, v11 REAL, v12 REAL, v13 REAL, v14 REAL)"
        );
      },
    )
  },
  async query() {
    return await dbNext.getAllAsync("SELECT * FROM Test;");
  },
  async querySmall() {
    return await dbNext.getAllAsync(SMALL_QUERY);
  }
}