import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";

import { OrbixWrite } from "./OrbixWrite";
import { OrbixRename } from "./OrbixRename";
import { OrbixDelete } from "./OrbixDelete";
import { OrbixAddDependency } from "./OrbixAddDependency";
import { OrbixExecuteSql } from "./OrbixExecuteSql";
import { OrbixAddIntegration } from "./OrbixAddIntegration";
import { OrbixEdit } from "./OrbixEdit";

import { OrbixCodebaseContext } from "./OrbixCodebaseContext";
import { OrbixThink } from "./OrbixThink";
import { CodeHighlight } from "./CodeHighlight";
import { useAtomValue } from "jotai";
import { isStreamingByIdAtom, selectedChatIdAtom } from "@/atoms/chatAtoms";
import { CustomTagState } from "./stateTypes";
import { OrbixOutput } from "./OrbixOutput";
import { OrbixProblemSummary } from "./OrbixProblemSummary";
import { IpcClient } from "@/ipc/ipc_client";
import { OrbixMcpToolCall } from "./OrbixMcpToolCall";
import { OrbixMcpToolResult } from "./OrbixMcpToolResult";
import { OrbixWebSearchResult } from "./OrbixWebSearchResult";
import { OrbixWebSearch } from "./OrbixWebSearch";
import { OrbixWebCrawl } from "./OrbixWebCrawl";
import { OrbixCodeSearchResult } from "./OrbixCodeSearchResult";
import { OrbixCodeSearch } from "./OrbixCodeSearch";
import { OrbixRead } from "./OrbixRead";
import { OrbixListFiles } from "./OrbixListFiles";
import { OrbixDatabaseSchema } from "./OrbixDatabaseSchema";
import { mapActionToButton } from "./ChatInput";
import { SuggestedAction } from "@/lib/schemas";
import { FixAllErrorsButton } from "./FixAllErrorsButton";

const Orbix_CUSTOM_TAGS = [
  "Orbix-write",
  "Orbix-rename",
  "Orbix-delete",
  "Orbix-add-dependency",
  "Orbix-execute-sql",
  "Orbix-add-integration",
  "Orbix-output",
  "Orbix-problem-report",
  "Orbix-chat-summary",
  "Orbix-edit",

  "Orbix-codebase-context",
  "Orbix-web-search-result",
  "Orbix-web-search",
  "Orbix-web-crawl",
  "Orbix-code-search-result",
  "Orbix-code-search",
  "Orbix-read",
  "think",
  "Orbix-command",
  "Orbix-mcp-tool-call",
  "Orbix-mcp-tool-result",
  "Orbix-list-files",
  "Orbix-database-schema",
];

interface OrbixMarkdownParserProps {
  content: string;
}

type CustomTagInfo = {
  tag: string;
  attributes: Record<string, string>;
  content: string;
  fullMatch: string;
  inProgress?: boolean;
};

type ContentPiece =
  | { type: "markdown"; content: string }
  | { type: "custom-tag"; tagInfo: CustomTagInfo };

const customLink = ({
  node: _node,
  ...props
}: {
  node?: any;
  [key: string]: any;
}) => (
  <a
    {...props}
    onClick={(e) => {
      const url = props.href;
      if (url) {
        e.preventDefault();
        IpcClient.getInstance().openExternalUrl(url);
      }
    }}
  />
);

export const VanillaMarkdownParser = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      components={{
        code: CodeHighlight,
        a: customLink,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

/**
 * Custom component to parse markdown content with Orbix-specific tags
 */
export const OrbixMarkdownParser: React.FC<OrbixMarkdownParserProps> = ({
  content,
}) => {
  const chatId = useAtomValue(selectedChatIdAtom);
  const isStreaming = useAtomValue(isStreamingByIdAtom).get(chatId!) ?? false;
  // Extract content pieces (markdown and custom tags)
  const contentPieces = useMemo(() => {
    return parseCustomTags(content);
  }, [content]);

  // Extract error messages and track positions
  const { errorMessages, lastErrorIndex, errorCount } = useMemo(() => {
    const errors: string[] = [];
    let lastIndex = -1;
    let count = 0;

    contentPieces.forEach((piece, index) => {
      if (
        piece.type === "custom-tag" &&
        piece.tagInfo.tag === "Orbix-output" &&
        piece.tagInfo.attributes.type === "error"
      ) {
        const errorMessage = piece.tagInfo.attributes.message;
        if (errorMessage?.trim()) {
          errors.push(errorMessage.trim());
          count++;
          lastIndex = index;
        }
      }
    });

    return {
      errorMessages: errors,
      lastErrorIndex: lastIndex,
      errorCount: count,
    };
  }, [contentPieces]);

  return (
    <>
      {contentPieces.map((piece, index) => (
        <React.Fragment key={index}>
          {piece.type === "markdown"
            ? piece.content && (
              <ReactMarkdown
                components={{
                  code: CodeHighlight,
                  a: customLink,
                }}
              >
                {piece.content}
              </ReactMarkdown>
            )
            : renderCustomTag(piece.tagInfo, { isStreaming })}
          {index === lastErrorIndex &&
            errorCount > 1 &&
            !isStreaming &&
            chatId && (
              <div className="mt-3 w-full flex">
                <FixAllErrorsButton
                  errorMessages={errorMessages}
                  chatId={chatId}
                />
              </div>
            )}
        </React.Fragment>
      ))}
    </>
  );
};

/**
 * Pre-process content to handle unclosed custom tags
 * Adds closing tags at the end of the content for any unclosed custom tags
 * Assumes the opening tags are complete and valid
 * Returns the processed content and a map of in-progress tags
 */
function preprocessUnclosedTags(content: string): {
  processedContent: string;
  inProgressTags: Map<string, Set<number>>;
} {
  let processedContent = content;
  // Map to track which tags are in progress and their positions
  const inProgressTags = new Map<string, Set<number>>();

  // For each tag type, check if there are unclosed tags
  for (const tagName of Orbix_CUSTOM_TAGS) {
    // Count opening and closing tags
    const openTagPattern = new RegExp(`<${tagName}(?:\\s[^>]*)?>`, "g");
    const closeTagPattern = new RegExp(`</${tagName}>`, "g");

    // Track the positions of opening tags
    const openingMatches: RegExpExecArray[] = [];
    let match;

    // Reset regex lastIndex to start from the beginning
    openTagPattern.lastIndex = 0;

    while ((match = openTagPattern.exec(processedContent)) !== null) {
      openingMatches.push({ ...match });
    }

    const openCount = openingMatches.length;
    const closeCount = (processedContent.match(closeTagPattern) || []).length;

    // If we have more opening than closing tags
    const missingCloseTags = openCount - closeCount;
    if (missingCloseTags > 0) {
      // Add the required number of closing tags at the end
      processedContent += Array(missingCloseTags)
        .fill(`</${tagName}>`)
        .join("");

      // Mark the last N tags as in progress where N is the number of missing closing tags
      const inProgressIndexes = new Set<number>();
      const startIndex = openCount - missingCloseTags;
      for (let i = startIndex; i < openCount; i++) {
        inProgressIndexes.add(openingMatches[i].index);
      }
      inProgressTags.set(tagName, inProgressIndexes);
    }
  }

  return { processedContent, inProgressTags };
}

/**
 * Parse the content to extract custom tags and markdown sections into a unified array
 */
function parseCustomTags(content: string): ContentPiece[] {
  const { processedContent, inProgressTags } = preprocessUnclosedTags(content);

  const tagPattern = new RegExp(
    `<(${Orbix_CUSTOM_TAGS.join("|")})\\s*([^>]*)>(.*?)<\\/\\1>`,
    "gs",
  );

  const contentPieces: ContentPiece[] = [];
  let lastIndex = 0;
  let match;

  // Find all custom tags
  while ((match = tagPattern.exec(processedContent)) !== null) {
    const [fullMatch, tag, attributesStr, tagContent] = match;
    const startIndex = match.index;

    // Add the markdown content before this tag
    if (startIndex > lastIndex) {
      contentPieces.push({
        type: "markdown",
        content: processedContent.substring(lastIndex, startIndex),
      });
    }

    // Parse attributes
    const attributes: Record<string, string> = {};
    const attrPattern = /(\w+)="([^"]*)"/g;
    let attrMatch;
    while ((attrMatch = attrPattern.exec(attributesStr)) !== null) {
      attributes[attrMatch[1]] = attrMatch[2];
    }

    // Check if this tag was marked as in progress
    const tagInProgressSet = inProgressTags.get(tag);
    const isInProgress = tagInProgressSet?.has(startIndex);

    // Add the tag info
    contentPieces.push({
      type: "custom-tag",
      tagInfo: {
        tag,
        attributes,
        content: tagContent,
        fullMatch,
        inProgress: isInProgress || false,
      },
    });

    lastIndex = startIndex + fullMatch.length;
  }

  // Add the remaining markdown content
  if (lastIndex < processedContent.length) {
    contentPieces.push({
      type: "markdown",
      content: processedContent.substring(lastIndex),
    });
  }

  return contentPieces;
}

function getState({
  isStreaming,
  inProgress,
}: {
  isStreaming?: boolean;
  inProgress?: boolean;
}): CustomTagState {
  if (!inProgress) {
    return "finished";
  }
  return isStreaming ? "pending" : "aborted";
}

/**
 * Render a custom tag based on its type
 */
function renderCustomTag(
  tagInfo: CustomTagInfo,
  { isStreaming }: { isStreaming: boolean },
): React.ReactNode {
  const { tag, attributes, content, inProgress } = tagInfo;

  switch (tag) {
    case "Orbix-read":
      return (
        <OrbixRead
          node={{
            properties: {
              path: attributes.path || "",
            },
          }}
        >
          {content}
        </OrbixRead>
      );
    case "Orbix-web-search":
      return (
        <OrbixWebSearch
          node={{
            properties: {},
          }}
        >
          {content}
        </OrbixWebSearch>
      );
    case "Orbix-web-crawl":
      return (
        <OrbixWebCrawl
          node={{
            properties: {},
          }}
        >
          {content}
        </OrbixWebCrawl>
      );
    case "Orbix-code-search":
      return (
        <OrbixCodeSearch
          node={{
            properties: {},
          }}
        >
          {content}
        </OrbixCodeSearch>
      );
    case "Orbix-code-search-result":
      return (
        <OrbixCodeSearchResult
          node={{
            properties: {},
          }}
        >
          {content}
        </OrbixCodeSearchResult>
      );
    case "Orbix-web-search-result":
      return (
        <OrbixWebSearchResult
          node={{
            properties: {
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OrbixWebSearchResult>
      );
    case "think":
      return (
        <OrbixThink
          node={{
            properties: {
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OrbixThink>
      );
    case "Orbix-write":
      return (
        <OrbixWrite
          node={{
            properties: {
              path: attributes.path || "",
              description: attributes.description || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OrbixWrite>
      );

    case "Orbix-rename":
      return (
        <OrbixRename
          node={{
            properties: {
              from: attributes.from || "",
              to: attributes.to || "",
            },
          }}
        >
          {content}
        </OrbixRename>
      );

    case "Orbix-delete":
      return (
        <OrbixDelete
          node={{
            properties: {
              path: attributes.path || "",
            },
          }}
        >
          {content}
        </OrbixDelete>
      );

    case "Orbix-add-dependency":
      return (
        <OrbixAddDependency
          node={{
            properties: {
              packages: attributes.packages || "",
            },
          }}
        >
          {content}
        </OrbixAddDependency>
      );

    case "Orbix-execute-sql":
      return (
        <OrbixExecuteSql
          node={{
            properties: {
              state: getState({ isStreaming, inProgress }),
              description: attributes.description || "",
            },
          }}
        >
          {content}
        </OrbixExecuteSql>
      );

    case "Orbix-add-integration":
      return (
        <OrbixAddIntegration
          node={{
            properties: {
              provider: attributes.provider || "",
            },
          }}
        >
          {content}
        </OrbixAddIntegration>
      );

    case "Orbix-edit":
      return (
        <OrbixEdit
          node={{
            properties: {
              path: attributes.path || "",
              description: attributes.description || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OrbixEdit>
      );



    case "Orbix-codebase-context":
      return (
        <OrbixCodebaseContext
          node={{
            properties: {
              files: attributes.files || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OrbixCodebaseContext>
      );

    case "Orbix-mcp-tool-call":
      return (
        <OrbixMcpToolCall
          node={{
            properties: {
              serverName: attributes.server || "",
              toolName: attributes.tool || "",
            },
          }}
        >
          {content}
        </OrbixMcpToolCall>
      );

    case "Orbix-mcp-tool-result":
      return (
        <OrbixMcpToolResult
          node={{
            properties: {
              serverName: attributes.server || "",
              toolName: attributes.tool || "",
            },
          }}
        >
          {content}
        </OrbixMcpToolResult>
      );

    case "Orbix-output":
      return (
        <OrbixOutput
          type={attributes.type as "warning" | "error"}
          message={attributes.message}
        >
          {content}
        </OrbixOutput>
      );

    case "Orbix-problem-report":
      return (
        <OrbixProblemSummary summary={attributes.summary}>
          {content}
        </OrbixProblemSummary>
      );

    case "Orbix-chat-summary":
      // Don't render anything for Orbix-chat-summary
      return null;

    case "Orbix-command":
      if (attributes.type) {
        const action = {
          id: attributes.type,
        } as SuggestedAction;
        return <>{mapActionToButton(action)}</>;
      }
      return null;

    case "Orbix-list-files":
      return (
        <OrbixListFiles
          node={{
            properties: {
              directory: attributes.directory || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OrbixListFiles>
      );

    case "Orbix-database-schema":
      return (
        <OrbixDatabaseSchema
          node={{
            properties: {
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OrbixDatabaseSchema>
      );

    default:
      return null;
  }
}
