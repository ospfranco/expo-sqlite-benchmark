import Chance from "chance";
import * as SQLite from "expo-sqlite";
import { SMALL_QUERY } from "./constants";

const dbOld = SQLite.openDatabase("db.testDb");

const chance = new Chance();

/** @type {import("./App").SQLiteImpl} */
export const SQLiteOld = {
  async query() {
    return (new Promise((resolve, reject) => {
      dbOld.exec(
        [{ sql: "SELECT * FROM Test", args: [] }],
        false,
        (error, resultSet) => {
          if (error) {
            reject(error);
          } else {
            // @ts-expect-error
            resolve(resultSet[0].rows);
          }
        }
      );
    }));
  },
  async querySmall() {
    return (new Promise((resolve, reject) => {
      dbOld.exec(
        [{ sql: SMALL_QUERY, args: [] }],
        false,
        (error, resultSet) => {
          if (error) {
            reject(error);
          } else {
            // @ts-expect-error
            resolve(resultSet[0].rows);
          }
        }
      );
    }));
  },
  async createDB() {
    return /** @type {Promise<void>} */(new Promise((resolve, reject) => {
      dbOld.transaction(
        (tx) => {
          tx.executeSql("DROP TABLE IF EXISTS Test;");

          tx.executeSql(
            "CREATE TABLE Test ( id INT PRIMARY KEY, v1 TEXT, v2 TEXT, v3 TEXT, v4 TEXT, v5 TEXT, v6 INT, v7 INT, v8 INT, v9 INT, v10 INT, v11 REAL, v12 REAL, v13 REAL, v14 REAL)"
          );
        },
        (error) => {
          reject(error);
        },
        () => {
          console.warn("db created");
          resolve();
        }
      );
    }));
  },
  async addData(j) {
    return /** @type {Promise<void>} */(new Promise((resolve, reject) => {
      dbOld.transaction(
        (tx) => {
          for (let i = j * 50000; i < j * 50000 + 50000; i++) {
            tx.executeSql(
              'INSERT INTO "Test" (id, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
              ]
            );
          }
        },
        (error) => {
          reject(error);
        },
        () => {
          console.warn("db created");
          resolve();
        }
      );
    }));
  }
}