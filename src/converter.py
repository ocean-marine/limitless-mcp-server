#!/usr/bin/env python3
"""
Limitless API レスポンスJSONをMarkdownに変換するモジュール
"""

import json
from datetime import datetime
from typing import Any, Dict, List


def parse_timestamp(timestamp_str: str) -> str:
    """
    ISO 8601タイムスタンプを読みやすい形式に変換
    """
    try:
        dt = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
        return dt.strftime("%Y/%m/%d %H:%M:%S")
    except (ValueError, TypeError):
        return timestamp_str


def extract_content_text(contents: List[Dict[str, Any]]) -> str:
    """
    contentsリストから実際のテキスト内容のみを抽出
    """
    text_parts = []

    for item in contents:
        content_type = item.get("type", "")
        content_text = item.get("content", "")

        if content_type == "heading1":
            if content_text:
                text_parts.append(f"# {content_text}")
        elif content_type == "heading2":
            if content_text:
                text_parts.append(f"## {content_text}")
        elif content_type == "heading3":
            if content_text:
                text_parts.append(f"#### {content_text}")
        elif content_type == "blockquote" and content_text:
            # 話者名と時刻情報を含む実際の発言内容
            speaker = item.get("speakerName", "Unknown")
            # start_time = item.get('startTime', '')
            # if start_time:
            #     time_str = parse_timestamp(start_time)
            #     text_parts.append(f"**{speaker}** ({time_str}): {content_text}")
            # else:
            text_parts.append(f"**{speaker}**: {content_text}")

    return "  \n".join(text_parts)


def convert_lifelog_to_markdown(lifelog: Dict[str, Any]) -> str:
    """
    単一のlifelogエントリをMarkdownに変換
    """
    title = lifelog.get("title", "Untitled")
    start_time = lifelog.get("startTime", "")
    end_time = lifelog.get("endTime", "")
    is_starred = lifelog.get("isStarred", False)
    contents = lifelog.get("contents", [])

    markdown_parts = []

    # タイトルとメタデータ
    markdown_parts.append("# " + title)
    markdown_parts.append("<metadata>")
    markdown_parts.append(
        f"Started: {parse_timestamp(start_time)} To: {parse_timestamp(end_time)}"
    )
    if is_starred:
        markdown_parts.append("Starred: ⭐")
    markdown_parts.append("</metadata>")

    markdown_parts.append("")
    markdown_parts.append("---")

    # 実際のコンテンツ
    content_text = extract_content_text(contents)
    if content_text.strip():
        markdown_parts.append(content_text)
    else:
        markdown_parts.append("（内容なし）")

    return "  \n".join(markdown_parts)


def convert_json_to_markdown(json_data: Dict[str, Any]) -> str:
    """
    Limitless API レスポンスJSONをMarkdownに変換

    Args:
        json_data: Limitless APIからのレスポンスJSON
        title: Markdownのメインタイトル

    Returns:
        Markdown形式の文字列
    """
    markdown_parts = []

    # データ構造の確認
    if "data" not in json_data:
        return "エラー: JSONデータに'data'キーが見つかりません"

    data = json_data["data"]
    if "lifelogs" not in data:
        return "エラー: データに'lifelogs'キーが見つかりません"

    lifelogs = data["lifelogs"]

    # 各lifelogエントリを変換
    for i, lifelog in enumerate(lifelogs, 1):
        if i > 1:
            markdown_parts.append("\n---\n")

        # lifelogをMarkdownに変換
        lifelog_markdown = convert_lifelog_to_markdown(lifelog)
        markdown_parts.append(lifelog_markdown)

    markdown_parts.append("\n---\n")
    markdown_parts.append("<metadata>")
    markdown_parts.append(json.dumps(json_data.get("meta", ""), ensure_ascii=False))
    markdown_parts.append("</metadata>")

    return "  \n".join(markdown_parts)


def convert_response_to_markdown(json_data: Dict[str, Any]) -> str:
    """
    convert_json_to_markdownのエイリアス関数（後方互換性のため）
    """
    return convert_json_to_markdown(json_data)


if __name__ == "__main__":
    with open("output/respose.json", "r", encoding="utf-8") as f:
        json_data = json.load(f)

    md_data = convert_json_to_markdown(json_data)

    with open("output/response.md", "w", encoding="utf-8") as f:
        f.write(md_data)


def convert_boolean_to_string(value) -> str:
    """Boolean値を文字列に変換"""
    match value:
        case True:
            return "true"
        case False:
            return "false"
        case _:
            return value
