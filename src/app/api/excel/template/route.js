import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Create the main content sheet
    const mainSheetData = [
      ['速読ゴリラ コンテンツテンプレート', '', '', '', ''],
      ['', '', '', '', ''],
      ['基本情報', '', '', '', ''],
      ['タイトル', '例：ももたろう', '', '', ''],
      ['レベル', '初級修了レベル', '※選択肢: 初級修了レベル、中級レベル、上級レベル', '', ''],
      ['', '', '', '', ''],
      ['本文', '', '', '', ''],
      ['ここに本文を入力してください。', '', '', '', ''],
      ['ルビを振る場合は次の記法を使用してください：', '', '', '', ''],
      ['・基本記法: ｜漢字《かんじ》', '', '', '', ''],
      ['・省略記法: 漢字《かんじ》', '', '', '', ''],
      ['・括弧記法: 漢字(かんじ)', '', '', '', ''],
      ['', '', '', '', ''],
      ['文章の解説（任意）', '', '', '', ''],
      ['ここに文章の解説を入力してください。', '', '', '', ''],
    ];

    const mainSheet = XLSX.utils.aoa_to_sheet(mainSheetData);

    // Set column widths
    mainSheet['!cols'] = [
      { wch: 20 },
      { wch: 40 },
      { wch: 40 },
      { wch: 20 },
      { wch: 20 }
    ];

    // Merge cells for title
    mainSheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 7, c: 1 }, e: { r: 7, c: 4 } },
      { s: { r: 14, c: 1 }, e: { r: 14, c: 4 } }
    ];

    XLSX.utils.book_append_sheet(workbook, mainSheet, 'コンテンツ');

    // Create the questions sheet
    const questionsSheetData = [
      ['理解度確認問題', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['※注意事項', '', '', '', '', '', '', '', ''],
      ['・選択肢は最低2つ、最大6つまで設定できます', '', '', '', '', '', '', '', ''],
      ['・選択肢列は必要な数だけ使用してください（選択肢1、選択肢2...）。列を追加する場合は「選択肢7」「選択肢8」のように番号を続けてください', '', '', '', '', '', '', '', ''],
      ['・正解番号は1から始まる数字で指定してください', '', '', '', '', '', '', '', ''],
      ['・問題数に制限はありません。必要な分だけ行を追加してください', '', '', '', '', '', '', '', ''],
      ['・問題が不要な場合は、ヘッダー行以下を空のままにしてください', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['問題番号', '問題文', '選択肢1', '選択肢2', '選択肢3', '選択肢4', '選択肢5', '選択肢6', '正解番号（1から）', '問題の解説（任意）'],
      ['1', '例：おじいさんは何をしに山に行きましたか。', 'しば刈り', 'つり', '買い物', '散歩', '', '', '1', 'おじいさんは山にしば刈りに行きました。'],
      ['2', '', '', '', '', '', '', '', '', ''],
      ['3', '', '', '', '', '', '', '', '', ''],
      ['4', '', '', '', '', '', '', '', '', ''],
      ['5', '', '', '', '', '', '', '', '', ''],
      ['6', '', '', '', '', '', '', '', '', ''],
      ['7', '', '', '', '', '', '', '', '', ''],
      ['8', '', '', '', '', '', '', '', '', ''],
      ['9', '', '', '', '', '', '', '', '', ''],
      ['10', '', '', '', '', '', '', '', '', ''],
    ];

    const questionsSheet = XLSX.utils.aoa_to_sheet(questionsSheetData);

    // Set column widths for questions sheet
    questionsSheet['!cols'] = [
      { wch: 10 },  // 問題番号
      { wch: 50 },  // 問題文
      { wch: 20 },  // 選択肢1
      { wch: 20 },  // 選択肢2
      { wch: 20 },  // 選択肢3
      { wch: 20 },  // 選択肢4
      { wch: 20 },  // 選択肢5
      { wch: 20 },  // 選択肢6
      { wch: 15 },  // 正解番号
      { wch: 50 }   // 解説
    ];

    // Merge cells for title and notes
    questionsSheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },  // タイトル
      { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },  // 注意事項
      { s: { r: 3, c: 1 }, e: { r: 3, c: 9 } },  // 注意1
      { s: { r: 4, c: 1 }, e: { r: 4, c: 9 } },  // 注意2
      { s: { r: 5, c: 1 }, e: { r: 5, c: 9 } },  // 注意3
      { s: { r: 6, c: 1 }, e: { r: 6, c: 9 } },  // 注意4
      { s: { r: 7, c: 1 }, e: { r: 7, c: 9 } }   // 注意5
    ];

    XLSX.utils.book_append_sheet(workbook, questionsSheet, '問題');

    // Create instructions sheet
    const instructionsSheetData = [
      ['使用方法', ''],
      ['', ''],
      ['1. 基本情報の入力', ''],
      ['・「コンテンツ」シートでタイトルとレベルを入力してください', ''],
      ['・レベルは「初級修了レベル」「中級レベル」「上級レベル」から選択してください', ''],
      ['', ''],
      ['2. 本文の入力', ''],
      ['・「コンテンツ」シートの本文欄に読解練習用の文章を入力してください', ''],
      ['・ルビ（振り仮名）を使用する場合は、指定の記法を使用してください', ''],
      ['・文章の解説は任意です', ''],
      ['', ''],
      ['3. 問題の入力', ''],
      ['・「問題」シートに理解度確認問題を入力してください', ''],
      ['・問題数に制限はありません（必要な分だけ行を追加できます）', ''],
      ['・選択肢は最低2つ、最大6つまで設定できます', ''],
      ['・選択肢は左から順に配置し、空欄があれば無視されます', ''],
      ['・正解番号と解説は必ず選択肢の右側に配置されています', ''],
      ['・問題が不要な場合は、ヘッダー行より下を空のままにしてください', ''],
      ['', ''],
      ['4. 重要な注意事項', ''],
      ['・「問題」シートのヘッダー行（問題番号、問題文、選択肢1...）は変更しないでください', ''],
      ['・選択肢の列は「選択肢1」「選択肢2」...という名前である必要があります', ''],
      ['・「正解番号（1から）」と「問題の解説（任意）」の列名も変更しないでください', ''],
      ['', ''],
      ['5. アップロード後の作業', ''],
      ['・Excelファイルをアップロード後、編集画面で以下の作業が可能です：', ''],
      ['  - サムネイル画像の追加', ''],
      ['  - 本文中に画像の挿入', ''],
      ['  - 内容の最終確認と修正', ''],
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsSheetData);
    instructionsSheet['!cols'] = [{ wch: 60 }, { wch: 60 }];

    XLSX.utils.book_append_sheet(workbook, instructionsSheet, '使用方法');

    // Generate buffer
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Return the file as a download
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="speed_reading_template.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating Excel template:', error);
    return NextResponse.json(
      { error: 'テンプレートの生成に失敗しました' },
      { status: 500 }
    );
  }
}