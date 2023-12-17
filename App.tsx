import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
} from "react-native";
import * as SQLite from "expo-sqlite/next";
import Chance from "chance";
import performance from "react-native-performance";

const chance = new Chance();

const db = SQLite.openDatabaseSync("db.testDb");

async function addData(j) {
  // return new Promise<void>((resolve, reject) => {
  //   db.runSync(
  //     (tx) => {
  //       for (let i = j * 50000; i < j * 50000 + 50000; i++) {
  //         tx.executeSql(
  //           'INSERT INTO "Test" (id, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  //           [
  //             i,
  //             chance.name(),
  //             chance.name(),
  //             chance.name(),
  //             chance.name(),
  //             chance.name(),
  //             chance.integer(),
  //             chance.integer(),
  //             chance.integer(),
  //             chance.integer(),
  //             chance.integer(),
  //             chance.floating(),
  //             chance.floating(),
  //             chance.floating(),
  //             chance.floating(),
  //           ]
  //         );
  //       }
  //     },
  //     (error) => {
  //       reject(error);
  //     },
  //     () => {
  //       console.warn(`data added ${j * 50000} to ${j * 50000 + 50000}`);
  //       resolve();
  //     }
  //   );
  // });
}

async function createDB() {
  // return new Promise<void>((resolve, reject) => {
  //   db.transaction(
  //     (tx) => {
  //       tx.executeSql("DROP TABLE IF EXISTS Test;");

  //       tx.executeSql(
  //         "CREATE TABLE Test ( id INT PRIMARY KEY, v1 TEXT, v2 TEXT, v3 TEXT, v4 TEXT, v5 TEXT, v6 INT, v7 INT, v8 INT, v9 INT, v10 INT, v11 REAL, v12 REAL, v13 REAL, v14 REAL)"
  //       );
  //     },
  //     (error) => {
  //       reject(error);
  //     },
  //     () => {
  //       console.warn("db created");
  //       resolve();
  //     }
  //   );
  // });
}

async function query() {
  await db.getAllAsync("SELECT * FROM Test")
  // return new Promise((resolve, reject) => {
  //   db.exec(
  //     [{ sql: "SELECT * FROM Test", args: [] }],
  //     false,
  //     (error, resultSet) => {
  //       if (error) {
  //         reject(error);
  //       } else {
  //         resolve(resultSet);
  //       }
  //     }
  //   );
  // });
}

async function queryDB() {
  let times = { load: [], access: [] };
  for (let i = 0; i < 10; i++) {
    let start = performance.now();
    const result = await db.getAllAsync("SELECT * FROM Test");
    let end = performance.now();
    console.warn(`query ${i + 1} time ${(end - start).toFixed(2)}`);

    times.load.push(end - start);

    // console.warn(result[0].rows.length);

    // start = performance.now();
    // for (let j = 0; j < result[0].rows.length; j++) {
    //   const v14 = result[0].rows[j].v14;
    // }
    // end = performance.now();
    // times.access.push(end - start);
  }

  return times;
}

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [times, setTimes] = useState({ load: [], access: [] });

  const createDbCallback = async () => {
    try {
      setIsLoading(true);
      await createDB();

      for (let i = 0; i < 6; i++) {
        await addData(i);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsLoading(false);
    }
  };

  const queryDb = async () => {
    try {
      setIsLoading(true);
      const times = await queryDB();
      setTimes(times);
    } catch (e) {
      console.warn("error querying", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Expo SQLite</Text>
      <Button title="Create DB" onPress={createDbCallback} />
      <Button title="Query DB" onPress={queryDb} />
      {isLoading && <ActivityIndicator color="white" />}

      {!!times.load.length && (
        <Text style={styles.big}>
          Load{" "}
          {(
            times.load.reduce((acc, t) => (acc += t), 0) / times.load.length
          ).toFixed(0)}{" "}
          ms average
        </Text>
      )}
      {!!times.access.length && (
        <Text style={styles.big}>
          Access{" "}
          {(
            times.access.reduce((acc, t) => (acc += t), 0) / times.access.length
          ).toFixed(0)}{" "}
          ms average
        </Text>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    color: "white",
    fontSize: 28,
  },
  normal: {
    color: "white",
  },
  big: {
    color: "white",
    fontSize: 28,
  },
});
