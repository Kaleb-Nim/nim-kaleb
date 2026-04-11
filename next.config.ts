import type { NextConfig } from "next";
import { execSync } from "child_process";

function getLastMainCommitDate(): string {
  try {
    const date = execSync("git log main -1 --format=%cI", { encoding: "utf-8" }).trim();
    return date;
  } catch {
    return new Date().toISOString();
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_LAST_SYNC: getLastMainCommitDate(),
  },
};

export default nextConfig;
