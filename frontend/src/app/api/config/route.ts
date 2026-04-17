import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";

interface ConfigRequest {
  api_key: string;
  settings_folder: string;
}

export async function GET() {
  try {
    const home = process.env.USERPROFILE || process.env.HOME || "";
    const settingsFolder = path.join(home, ".freecode");
    const configPath = path.join(settingsFolder, "freecode.json");

    try {
      const content = await fs.readFile(configPath, "utf-8");
      const config = JSON.parse(content);
      return NextResponse.json(config);
    } catch {
      // If ~/.freecode/freecode.json doesn't exist, try local project root
      try {
        const rootConfigPath = path.join(process.cwd(), "freecode.json");
        const content = await fs.readFile(rootConfigPath, "utf-8");
        const config = JSON.parse(content);
        return NextResponse.json(config);
      } catch {
        return NextResponse.json({ error: "No config found" }, { status: 404 });
      }
    }
  } catch (error) {
    console.error("Config GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ConfigRequest;
    let { api_key, settings_folder } = body;

    if (!api_key) {
      return NextResponse.json(
        { error: "api_key is required" },
        { status: 400 }
      );
    }

    if (!settings_folder) {
      // Default to ~/.freecode
      const home = process.env.USERPROFILE || process.env.HOME || "";
      settings_folder = path.join(home, ".freecode");
    }

    // Validate settings folder exists
    try {
      await fs.access(settings_folder);
    } catch {
      // Create the folder if it doesn't exist
      try {
        await fs.mkdir(settings_folder, { recursive: true });
      } catch (e) {
        return NextResponse.json(
          { error: `Cannot access or create settings folder: ${settings_folder}` },
          { status: 400 }
        );
      }
    }

    // Save to freecode.json in the settings folder
    const configPath = path.join(settings_folder, "freecode.json");
    let config: Record<string, unknown> = {};

    try {
      const existing = await fs.readFile(configPath, "utf-8");
      config = JSON.parse(existing);
    } catch {
      // File doesn't exist or is invalid, start fresh
    }

    config.api_key = api_key;
    config.settings_folder = settings_folder;

    await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Config API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
