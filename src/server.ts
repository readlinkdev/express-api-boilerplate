import { createApp } from "./app/app";

const PORT = 3000;

async function startServer(): Promise<void> {
  try {
    const app = await createApp();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    process.exit(1);
  }
}

await startServer();
