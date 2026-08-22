#!/usr/bin/env python3

import json
import re
import sys


REQUIRED_SECTIONS = [
    "実施結果",
    "判断記録",
    "実行した内容",
    "変更したファイル",
    "検証結果",
    "今回学べること",
    "レビュー観点",
]


def get_section(markdown: str, section_name: str) -> str | None:
    """
    指定したH1セクションの本文を取得する。

    例:
    # 実施結果
    ...
    # 判断記録

    の場合、「実施結果」の本文部分を返す。
    """

    pattern = re.compile(
        rf"^#\s+{re.escape(section_name)}\s*$"
        rf"(.*?)"
        rf"(?=^#\s+|\Z)",
        re.MULTILINE | re.DOTALL,
    )

    match = pattern.search(markdown)

    if not match:
        return None

    return match.group(1).strip()


def contains_all(text: str, keywords: list[str]) -> list[str]:
    """含まれていないキーワードを返す。"""

    return [keyword for keyword in keywords if keyword not in text]


def validate_report(message: str) -> list[str]:
    errors: list[str] = []

    # --------------------------------------------------
    # H1セクション
    # --------------------------------------------------

    sections: dict[str, str] = {}

    for section_name in REQUIRED_SECTIONS:
        section = get_section(message, section_name)

        if section is None:
            errors.append(f"`# {section_name}` がありません。")
            continue

        if not section.strip():
            errors.append(f"`# {section_name}` の内容が空です。")
            continue

        sections[section_name] = section

    # 必須セクションが欠落している場合、
    # 以下の詳細チェックは存在するセクションだけ行う。

    # --------------------------------------------------
    # 実施結果
    # --------------------------------------------------

    result = sections.get("実施結果")

    if result:
        missing = contains_all(
            result,
            [
                "背景",
                "実施内容",
            ],
        )

        for keyword in missing:
            errors.append(
                f"`# 実施結果` に `{keyword}` の説明がありません。"
            )

        no_problem_phrases = [
            "問題は発生しませんでした",
            "問題なし",
            "問題はありませんでした",
        ]

        has_no_problem = any(
            phrase in result for phrase in no_problem_phrases
        )

        problem_table = re.search(
            r"\|\s*問題\s*\|\s*対応\s*\|\s*最終状態\s*\|",
            result,
        )

        if not has_no_problem and not problem_table:
            errors.append(
                "`# 実施結果` には、問題がなかった旨、"
                "または `問題 / 対応 / 最終状態` の表が必要です。"
            )

    # --------------------------------------------------
    # 判断記録
    # --------------------------------------------------

    decisions = sections.get("判断記録")

    if decisions:
        required = [
            "主要な判断",
            "判断の根拠",
            "検討した代替案",
            "採用理由",
            "残っている不確実性",
        ]

        for keyword in contains_all(decisions, required):
            errors.append(
                f"`# 判断記録` に `{keyword}` がありません。"
            )

    # --------------------------------------------------
    # 実行した内容
    # --------------------------------------------------

    commands = sections.get("実行した内容")

    if commands:
        command_table = re.search(
            r"\|\s*コマンド\s*\|\s*目的\s*\|\s*結果\s*\|",
            commands,
        )

        no_command_phrases = [
            "コマンド実行なし",
            "コマンドは実行していません",
            "実行したコマンドはありません",
        ]

        no_command = any(
            phrase in commands for phrase in no_command_phrases
        )

        if not command_table and not no_command:
            errors.append(
                "`# 実行した内容` に "
                "`コマンド / 目的 / 結果` の表がありません。"
            )

    # --------------------------------------------------
    # 変更したファイル
    # --------------------------------------------------

    files = sections.get("変更したファイル")

    if files:
        no_changes = "変更なし" in files

        if not no_changes:
            required = [
                "ファイルパス",
                "変更内容",
                "理由",
            ]

            for keyword in contains_all(files, required):
                errors.append(
                    f"`# 変更したファイル` に `{keyword}` がありません。"
                )

    # --------------------------------------------------
    # 検証結果
    # --------------------------------------------------

    verification = sections.get("検証結果")

    if verification:
        required = [
            "テスト",
            "Lint",
            "型チェック",
            "ビルド",
        ]

        for keyword in contains_all(verification, required):
            errors.append(
                f"`# 検証結果` に `{keyword}` の結果がありません。"
            )

    # --------------------------------------------------
    # 今回学べること
    # --------------------------------------------------

    learning = sections.get("今回学べること")

    if learning:
        required = [
            "使用した技術または設計上の概念",
            "この実装で重要なポイント",
            "よくある間違い",
            "別の場面でも応用できる知識",
        ]

        for keyword in contains_all(learning, required):
            errors.append(
                f"`# 今回学べること` に `{keyword}` がありません。"
            )

    return errors


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        print(
            json.dumps(
                {
                    "decision": "block",
                    "reason": (
                        "Stop Hookの入力JSONを読み取れませんでした。"
                        "最終回答をもう一度生成してください。"
                    ),
                },
                ensure_ascii=False,
            )
        )
        return 0

    message = payload.get("last_assistant_message")

    if not isinstance(message, str) or not message.strip():
        print(
            json.dumps(
                {
                    "decision": "block",
                    "reason": (
                        "最終回答が確認できません。"
                        "タスク完了レポートを含む最終回答を生成してください。"
                    ),
                },
                ensure_ascii=False,
            )
        )
        return 0

    errors = validate_report(message)

    if not errors:
        # Stop Hook成功。
        print("{}")
        return 0

    error_list = "\n".join(
        f"- {error}"
        for error in errors
    )

    reason = f"""最終回答のタスク完了レポートに不足があります。

不足している内容:

{error_list}

タスク本体への追加変更は行わず、
これまで実施した内容に基づいて最終回答だけを修正してください。

最終回答には必ず次のH1見出しをすべて含めてください。

# 実施結果
# 判断記録
# 実行した内容
# 変更したファイル
# 検証結果
# 今回学べること
# レビュー観点

該当する内容がない項目についても省略せず、
「なし」「未実施」などの形で理由を記載してください。
"""

    print(
        json.dumps(
            {
                "decision": "block",
                "reason": reason,
            },
            ensure_ascii=False,
        )
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())