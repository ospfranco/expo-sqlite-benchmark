// @ts-check
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
} from "react-native";
import performance from "react-native-performance";
import { SQLiteOld } from './expo-sqlite-old'
import { SQLiteNext } from "./expo-sqlite-next";


/**
 * 
 * @typedef Time
 * @property {number[]} load
 * @property {number[]} access
 */

/**
 * @typedef SQLiteRecord
 * @property {number} id
 * @property {string} v1
 * @property {string} v2
 * @property {string} v3
 * @property {string} v4
 * @property {string} v5
 * @property {number} v6
 * @property {number} v7
 * @property {number} v8
 * @property {number} v9
 * @property {number} v10
 * @property {number} v11
 * @property {number} v12
 * @property {number} v13
 * @property {number} v14
 */

/**
 * 
 * @typedef SQLiteImpl
 * @property {(a: number) => Promise<void>} addData
 * @property {() => Promise<void>} createDB
 * @property {() => Promise<SQLiteRecord[]>} query
 * @property {() => Promise<SQLiteRecord[]>} querySmall
 */

/**
 * 
 * @param {SQLiteImpl} impl 
 * @param {'small' | 'big'} size
 */
async function queryDB(impl, size) {
  let times = /** @type {Time} */ ({ load: [], access: [] })
  for (let i = 0; i < 10; i++) {
    performance.mark("queryStart");
    const result = await impl[size === 'big' ? 'query' : 'querySmall']();
    let measurement = performance.measure("queryEnd", "queryStart");
    console.warn(`query ${i} done`);

    times.load.push(measurement.duration);

    console.warn(result.length);

    performance.mark("accessStart");
    for (let j = 0; j < result.length; j++) {
      const v14 = result[j].v14;
    }
    let accessMeasurement = performance.measure("accessEnd", "accessStart");
    times.access.push(accessMeasurement.duration);
  }

  return times;
}

/**
 * @param impl {SQLiteImpl}
 * @param setIsLoading {(arg0: boolean) => void}
 */
const createDB = async (impl, setIsLoading) => {
  try {
    setIsLoading(true);
    await impl.createDB();

    console.warn("created db");

    for (let i = 0; i < 6; i++) {
      await impl.addData(i);
      console.warn(`created ${i}`);
    }
  } catch (e) {
    console.warn(e);
  } finally {
    setIsLoading(false);
  }
}

/**
 * @param {SQLiteImpl} impl
 * @param {'small' | 'big'} size
 * @param {(arg0: boolean) => void} setIsLoading
 * @param {(arg0: Time) => void} setTimes
 */
const query = async (impl, size, setIsLoading, setTimes) => {
  try {
    setIsLoading(true);
    const times = await queryDB(impl, size);
    setTimes(times);
  } catch (e) {
    console.warn("error querying", e);
  } finally {
    setIsLoading(false);
  }
}



const IMPLS = /** @type {const} */ ([
  {
    type: "old",
    impl: SQLiteOld,
  },
  {
    type: "next",
    impl: SQLiteNext,
  },
]);

/**
 * 
 * @typedef TimeType
 * @type {typeof IMPLS[number]['type']}
 */

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentImpl, setCurrentImpl] = useState(/** @type {TimeType} */(IMPLS[0].type));
  const [allTimes, setAllTimes] = useState(() => /** @type {Record<TimeType, Time>} */
    (Object.fromEntries(IMPLS.map((it) => [it.type, /** @type {Time} */ ({ load: [], access: [] })])))
  );

  const impl = IMPLS.find((it) => it.type === currentImpl);
  const times = allTimes[currentImpl];
  /**
   * 
   * @param {Time} times 
   */
  const setTimes = (times) => {
    setAllTimes({
      ...allTimes,
      [currentImpl]: times,
    });
  };
  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          gap: 8,
        }}
      >
        {IMPLS.map((it) => (
          <Button key={it.type} disabled={isLoading || it.type === currentImpl} onPress={() => {
            setCurrentImpl(it.type);
          }} title={it.type} />
        ))}
      </View>

      <View style={{ gap: 8, }}>
        <Text style={styles.header}>Expo SQLite {currentImpl}</Text>

        <Button
          title="Create DB"
          disabled={isLoading}
          onPress={() => createDB(impl.impl, setIsLoading,)}
        />
        <Button
          title="Query DB Big"
          disabled={isLoading}
          onPress={() => query(impl.impl, 'big', setIsLoading, setTimes)}
        />
        <Button
          title="Query DB Small"
          disabled={isLoading}
          onPress={() => query(impl.impl, 'small', setIsLoading, setTimes)}
        />
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
      </View>
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
