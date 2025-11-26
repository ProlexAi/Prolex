import { toolCall } from "./utils";

export async function safeWriteFile(path: string, content: string): Promise<void> {
  try {
    await toolCall("read_file", { path });
  } catch (error: any) {
    if (!error.message?.includes("File not found") && !error.message?.includes("ENOENT")) {
      throw error;
    }
  }
  return await toolCall("write_file", { path, content });
}

export const tools = {
  list_workflows: async () => toolCall("list_workflows", {}),
  trigger_workflow: async (name: string, data?: any) => toolCall("trigger_workflow", { name, data }),
  read_file: async (path: string) => toolCall("read_file", { path }),
  write_file: safeWriteFile,
};
