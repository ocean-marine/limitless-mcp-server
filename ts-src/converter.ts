interface Content {
  type: string;
  content: string;
  speakerName?: string;
  startTime?: string;
}

interface Lifelog {
  title: string;
  startTime: string;
  endTime: string;
  isStarred: boolean;
  contents: Content[];
}

interface ApiResponse {
  data: {
    lifelogs: Lifelog[];
  };
  meta?: any;
}

export function parseTimestamp(timestampStr: string): string {
  try {
    const dt = new Date(timestampStr.replace("Z", "+00:00"));
    return dt.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).replace(/\//g, "/");
  } catch (error) {
    return timestampStr;
  }
}

export function extractContentText(contents: Content[]): string {
  const textParts: string[] = [];

  for (const item of contents) {
    const contentType = item.type || "";
    const contentText = item.content || "";

    if (contentType === "heading1") {
      if (contentText) {
        textParts.push(`# ${contentText}`);
      }
    } else if (contentType === "heading2") {
      if (contentText) {
        textParts.push(`## ${contentText}`);
      }
    } else if (contentType === "heading3") {
      if (contentText) {
        textParts.push(`#### ${contentText}`);
      }
    } else if (contentType === "blockquote" && contentText) {
      const speaker = item.speakerName || "Unknown";
      textParts.push(`**${speaker}**: ${contentText}`);
    }
  }

  return textParts.join("  \n");
}

export function convertLifelogToMarkdown(lifelog: Lifelog): string {
  const title = lifelog.title || "Untitled";
  const startTime = lifelog.startTime || "";
  const endTime = lifelog.endTime || "";
  const isStarred = lifelog.isStarred || false;
  const contents = lifelog.contents || [];

  const markdownParts: string[] = [];

  markdownParts.push("# " + title);
  markdownParts.push("<metadata>");
  markdownParts.push(
    `Started: ${parseTimestamp(startTime)} To: ${parseTimestamp(endTime)}`
  );
  if (isStarred) {
    markdownParts.push("Starred: ⭐");
  }
  markdownParts.push("</metadata>");

  markdownParts.push("");
  markdownParts.push("---");

  const contentText = extractContentText(contents);
  if (contentText.trim()) {
    markdownParts.push(contentText);
  } else {
    markdownParts.push("（内容なし）");
  }

  return markdownParts.join("  \n");
}

export function convertJsonToMarkdown(jsonData: ApiResponse): string {
  const markdownParts: string[] = [];

  if (!jsonData.data) {
    return "エラー: JSONデータに'data'キーが見つかりません";
  }

  const data = jsonData.data;
  if (!data.lifelogs) {
    return "エラー: データに'lifelogs'キーが見つかりません";
  }

  const lifelogs = data.lifelogs;

  for (let i = 0; i < lifelogs.length; i++) {
    if (i > 0) {
      markdownParts.push("\n---\n");
    }

    const lifelogMarkdown = convertLifelogToMarkdown(lifelogs[i]);
    markdownParts.push(lifelogMarkdown);
  }

  markdownParts.push("\n---\n");
  markdownParts.push("<metadata>");
  markdownParts.push(JSON.stringify(jsonData.meta || "", null, 2));
  markdownParts.push("</metadata>");

  return markdownParts.join("  \n");
}

export function convertBooleanToString(value: any): string {
  if (value === true) {
    return "true";
  } else if (value === false) {
    return "false";
  } else {
    return value;
  }
}