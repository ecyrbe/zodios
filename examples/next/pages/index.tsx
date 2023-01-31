import type { NextPage } from "next";
import { useState } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { userClientHooks } from "../client/api";

const Users = () => {
  const [count, setCount] = useState(1);
  const {
    data: users,
    error,
    isLoading,
    invalidate,
  } = userClientHooks.useGetUsers();
  const { mutate } = userClientHooks.useMutation("post", "/users", undefined, {
    onSuccess: () => invalidate(),
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }

  return (
    <div>
      <button
        onClick={() => {
          mutate({
            name: `user${count}`,
            age: count,
            email: `user${count}@test.com`,
          });
          setCount((prev) => prev + 1);
        }}
      >
        Add User
      </button>
      {users?.map((user) => (
        <div key={user.id}>
          {user.name} - {user.email}
        </div>
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Zodios Example App</title>
        <meta name="description" content="Zodios app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>Users</h1>
      <Users />
    </div>
  );
};

export default Home;
