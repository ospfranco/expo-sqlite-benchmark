import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
} from "react-native";
import * as SQLite from "expo-sqlite";
import Chance from "chance";
import performance from "react-native-performance";

const chance = new Chance();

const db = SQLite.openDatabase("db.testDb");

async function addData(j) {
  return new Promise((resolve, reject) => {
    db.transaction(
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
  });
}

async function createDB() {
  return new Promise((resolve, reject) => {
    db.transaction(
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
  });
}

async function query() {
  return new Promise((resolve, reject) => {
    db.exec(
      [{ sql: "SELECT * FROM Test", args: [] }],
      false,
      (error, resultSet) => {
        if (error) {
          reject(error);
        } else {
          resolve(resultSet);
        }
      }
    );
  });
}

async function queryDB() {
  let times = [];
  for (let i = 0; i < 10; i++) {
    performance.mark("queryStart");
    await query();
    let measurement = performance.measure("queryEnd", "queryStart");
    console.warn(`query ${i} done`);

    times.push(measurement.duration);
  }

  return times;
}

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [times, setTimes] = useState([]);

  const createDb = async () => {
    try {
      setIsLoading(true);
      await createDB();

      console.warn("created db");

      for (let i = 0; i < 6; i++) {
        await addData(i);
        console.warn(`created ${i}`);
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
      <Button title="Create DB" onPress={createDb} />
      <Button title="Query DB" onPress={queryDb} />
      {isLoading && <ActivityIndicator color="white" />}
      {times.map((t) => {
        return <Text style={styles.normal}>{t.toFixed(0)}ms</Text>;
      })}

      {!!times.length && (
        <Text style={styles.big}>
          {(times.reduce((acc, t) => (acc += t), 0) / times.length).toFixed(0)}{" "}
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
