import { normalizePath } from "../../../shared/normalizePath";
import log from "electron-log";
import { SqlQuery } from "../../lib/schemas";

const logger = log.scope("Orbix_tag_parser");

export function getOrbixWriteTags(fullResponse: string): {
  path: string;
  content: string;
  description?: string;
}[] {
  const OrbixWriteRegex = /<Orbix-write([^>]*)>([\s\S]*?)<\/Orbix-write>/gi;
  const pathRegex = /path="([^"]+)"/;
  const descriptionRegex = /description="([^"]+)"/;

  let match;
  const tags: { path: string; content: string; description?: string }[] = [];

  while ((match = OrbixWriteRegex.exec(fullResponse)) !== null) {
    const attributesString = match[1];
    let content = match[2].trim();

    const pathMatch = pathRegex.exec(attributesString);
    const descriptionMatch = descriptionRegex.exec(attributesString);

    if (pathMatch && pathMatch[1]) {
      const path = pathMatch[1];
      const description = descriptionMatch?.[1];

      const contentLines = content.split("\n");
      if (contentLines[0]?.startsWith("```")) {
        contentLines.shift();
      }
      if (contentLines[contentLines.length - 1]?.startsWith("```")) {
        contentLines.pop();
      }
      content = contentLines.join("\n");

      tags.push({ path: normalizePath(path), content, description });
    } else {
      logger.warn(
        "Found <Orbix-write> tag without a valid 'path' attribute:",
        match[0],
      );
    }
  }
  return tags;
}

export function getOrbixRenameTags(fullResponse: string): {
  from: string;
  to: string;
}[] {
  const OrbixRenameRegex =
    /<Orbix-rename from="([^"]+)" to="([^"]+)"[^>]*>([\s\S]*?)<\/Orbix-rename>/g;
  let match;
  const tags: { from: string; to: string }[] = [];
  while ((match = OrbixRenameRegex.exec(fullResponse)) !== null) {
    tags.push({
      from: normalizePath(match[1]),
      to: normalizePath(match[2]),
    });
  }
  return tags;
}

export function getOrbixDeleteTags(fullResponse: string): string[] {
  const OrbixDeleteRegex =
    /<Orbix-delete path="([^"]+)"[^>]*>([\s\S]*?)<\/Orbix-delete>/g;
  let match;
  const paths: string[] = [];
  while ((match = OrbixDeleteRegex.exec(fullResponse)) !== null) {
    paths.push(normalizePath(match[1]));
  }
  return paths;
}

export function getOrbixAddDependencyTags(fullResponse: string): string[] {
  const OrbixAddDependencyRegex =
    /<Orbix-add-dependency packages="([^"]+)">[^<]*<\/Orbix-add-dependency>/g;
  let match;
  const packages: string[] = [];
  while ((match = OrbixAddDependencyRegex.exec(fullResponse)) !== null) {
    packages.push(...match[1].split(" "));
  }
  return packages;
}

export function getOrbixChatSummaryTag(fullResponse: string): string | null {
  const OrbixChatSummaryRegex =
    /<Orbix-chat-summary>([\s\S]*?)<\/Orbix-chat-summary>/g;
  const match = OrbixChatSummaryRegex.exec(fullResponse);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

export function getOrbixExecuteSqlTags(fullResponse: string): SqlQuery[] {
  const OrbixExecuteSqlRegex =
    /<Orbix-execute-sql([^>]*)>([\s\S]*?)<\/Orbix-execute-sql>/g;
  const descriptionRegex = /description="([^"]+)"/;
  let match;
  const queries: { content: string; description?: string }[] = [];

  while ((match = OrbixExecuteSqlRegex.exec(fullResponse)) !== null) {
    const attributesString = match[1] || "";
    let content = match[2].trim();
    const descriptionMatch = descriptionRegex.exec(attributesString);
    const description = descriptionMatch?.[1];

    // Handle markdown code blocks if present
    const contentLines = content.split("\n");
    if (contentLines[0]?.startsWith("```")) {
      contentLines.shift();
    }
    if (contentLines[contentLines.length - 1]?.startsWith("```")) {
      contentLines.pop();
    }
    content = contentLines.join("\n");

    queries.push({ content, description });
  }

  return queries;
}

export function getOrbixCommandTags(fullResponse: string): string[] {
  const OrbixCommandRegex =
    /<Orbix-command type="([^"]+)"[^>]*><\/Orbix-command>/g;
  let match;
  const commands: string[] = [];

  while ((match = OrbixCommandRegex.exec(fullResponse)) !== null) {
    commands.push(match[1]);
  }

  return commands;
}

export function getOrbixSearchReplaceTags(fullResponse: string): {
  path: string;
  content: string;
  description?: string;
}[] {
  const OrbixSearchReplaceRegex =
    /<Orbix-search-replace([^>]*)>([\s\S]*?)<\/Orbix-search-replace>/gi;
  const pathRegex = /path="([^"]+)"/;
  const descriptionRegex = /description="([^"]+)"/;

  let match;
  const tags: { path: string; content: string; description?: string }[] = [];

  while ((match = OrbixSearchReplaceRegex.exec(fullResponse)) !== null) {
    const attributesString = match[1] || "";
    let content = match[2].trim();

    const pathMatch = pathRegex.exec(attributesString);
    const descriptionMatch = descriptionRegex.exec(attributesString);

    if (pathMatch && pathMatch[1]) {
      const path = pathMatch[1];
      const description = descriptionMatch?.[1];

      // Handle markdown code fences if present
      const contentLines = content.split("\n");
      if (contentLines[0]?.startsWith("```")) {
        contentLines.shift();
      }
      if (contentLines[contentLines.length - 1]?.startsWith("```")) {
        contentLines.pop();
      }
      content = contentLines.join("\n");

      tags.push({ path: normalizePath(path), content, description });
    } else {
      logger.warn(
        "Found <Orbix-search-replace> tag without a valid 'path' attribute:",
        match[0],
      );
    }
  }
  return tags;
}
