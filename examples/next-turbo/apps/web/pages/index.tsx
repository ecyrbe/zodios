import { Button } from "ui";
import { api } from "../common/api";
import { Zodios } from "@zodios/core";
import { ZodiosHooks } from "@zodios/react";

const zodios = new Zodios("/api", api);
const zodiosHooks = new ZodiosHooks("health", zodios);

export default function Web() {
  const { data: health, isLoading } = zodiosHooks.useHealth();
  return (
    <div>
      <h1>Health Status</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <p>
          <strong>Status:</strong> {health?.status}
        </p>
      )}
    </div>
  );
}
