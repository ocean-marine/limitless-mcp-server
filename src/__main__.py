import httpx
from mcp.server.fastmcp import FastMCP
import requests
import yaml

from .converter import convert_boolean_to_string, convert_json_to_markdown
from .validator import LIMITLESS_API_KEY

# Initialize FastMCP server
mcp = FastMCP(
    name="limitless",
    instructions="Limitless APIを使用してlifelogsを取得し、Markdown形式で出力します。",
)

@mcp.tool()
def get_lifelogs(
    date: str | None = None,
    start: str | None = None,
    end: str | None = None,
    cursor: str | None = None,
    isStarred: bool | None = None,
    limit: int = 5,
    search: str | None = None,
) -> str:
    """
    Limitless APIからlifelogsを取得する

    Args:
        date: Return all entries beginning on this date in the given timezone (YYYY-MM-DD). Ignored if start or end are provided.
        start: Start datetime in ISO-8601 format (YYYY-MM-DD or YYYY-MM-DD HH:mm:SS). Timezones/offsets are ignored; use timezone instead.
        end: End datetime in ISO-8601 format. Same rules as start.
        cursor: Cursor for pagination to retrieve the next set of lifelogs. **Optional.** Note: cannot use when search is provided.
        isStarred: Filter entries by starred status. **Optional.**
        limit: Maximum number of lifelogs to return (max 10). **Default:** 5.
        search: Hybrid search query (keyword + semantic). **Optional.** Note: cannot use cursor pagination when provided.

    Returns:
        Markdown形式の文字列
    """
    # クエリパラメータを構築
    with open("config/config.yml", "r") as file:
        config = yaml.safe_load(file)
    params = config.get("query_parameters", {})

    if date:
        params["date"] = date
    if start:
        params["start"] = start
    if end:
        params["end"] = end
    if cursor:
        params["cursor"] = cursor
    if isStarred is not None:
        params["isStarred"] = "true" if isStarred else "false"
    if limit != 5:  # デフォルト値と異なる場合のみ設定
        params["limit"] = limit
    if search:
        params["search"] = search

    # APIリクエストを実行
    response = requests.get(
        "https://api.limitless.ai/v1/lifelogs",
        headers={"X-API-Key": LIMITLESS_API_KEY},
        params={k: convert_boolean_to_string(v) for k, v in params.items()},
    )

    response.raise_for_status()
    json_data = response.json()

    return convert_json_to_markdown(json_data)


def main():
    """メイン実行関数"""
    try:
        markdown_data = get_lifelogs(
            start="2025-08-02 21:00:00", end="2025-08-02 22:00:00", limit=10
        )
        print(markdown_data)

    except requests.exceptions.RequestException as e:
        print(f"APIリクエストエラー: {e}")
    except Exception as e:
        print(f"エラー: {e}")


if __name__ == "__main__":
    mcp.run()
