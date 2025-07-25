import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import prisma from '../../../../lib/prisma';

export async function GET() {
  try {
    // データベースからレベル情報を取得
    let levels = [];
    let levelOptions = '中級前半 / 中級レベル / 上級レベル';
    let defaultLevelName = '中級前半';
    
    try {
      levels = await prisma.level.findMany({
        orderBy: { orderIndex: 'asc' }
      });
      
      if (levels && levels.length > 0) {
        levelOptions = levels.map(l => l.displayName).join(' / ');
        const defaultLevel = levels.find(l => l.isDefault) || levels[0];
        defaultLevelName = defaultLevel?.displayName || '中級前半';
      }
    } catch (error) {
      console.error('Failed to fetch levels:', error);
      // フォールバック値を使用（すでに初期化済み）
    }
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Create the main content sheet with table format
    const mainSheetData = [
      ['SuiReN コンテンツテンプレート', '', '', '', ''],
      ['', '', '', '', ''],
      ['項目', '入力内容', '説明・注意事項', '', ''],
      ['タイトル', '例：ももたろう', '必須：コンテンツのタイトル', '', ''],
      ['レベル', defaultLevelName, `${levelOptions} から選択`, '', ''],
      ['本文', 'ここに本文を入力してください。', '必須：速読練習用の読み物。改行はそのまま反映されます。ルビの記法：｜漢字《かんじ》または漢字《かんじ》', '', ''],
      ['語数', '250', '任意：標準語数を手動で入力', '', ''],
      ['文字数', '450', '任意：本文の文字数を手動で入力', '', ''],
      ['読み物の解説', 'ここに読み物の解説を入力してください。', '任意：読み物の背景や解説を記入', '', ''],
      ['ラベル', '', '任意：カンマ区切りで複数のラベル名を入力（例：文法, 初級向け, JLPT N3）', '', ''],
      ['', '', '', '', ''],
      ['※画像とサムネイルはアップロード後の編集画面で追加できます', '', '', '', ''],
      ['※問題は「問題」シートに入力してください', '', '', '', ''],
    ];

    const mainSheet = XLSX.utils.aoa_to_sheet(mainSheetData);

    // Set column widths
    mainSheet['!cols'] = [
      { wch: 20 },
      { wch: 50 },
      { wch: 50 },
      { wch: 20 },
      { wch: 20 }
    ];

    // Merge cells for title and notes
    mainSheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },  // タイトル行
      { s: { r: 11, c: 0 }, e: { r: 11, c: 4 } }, // 画像に関する注意事項
      { s: { r: 12, c: 0 }, e: { r: 12, c: 4 } }  // 問題に関する注意事項
    ];

    XLSX.utils.book_append_sheet(workbook, mainSheet, 'コンテンツ');

    // Create the questions sheet with simplified table format
    const questionsSheetData = [
      ['理解度確認問題', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['※注意事項', '', '', '', '', '', '', '', '', ''],
      ['・選択肢は最低2つ、最大6つまで設定できます', '', '', '', '', '', '', '', '', ''],
      ['・正解番号は1から始まる数字で指定してください', '', '', '', '', '', '', '', '', ''],
      ['・問題数に制限はありません。必要な分だけ行を追加してください', '', '', '', '', '', '', '', '', ''],
      ['・問題が不要な場合は、ヘッダー行以下を空のままにしてください', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['問題番号', '問題文', '選択肢1', '選択肢2', '選択肢3', '選択肢4', '選択肢5', '選択肢6', '正解番号', '解説'],
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
      { s: { r: 6, c: 1 }, e: { r: 6, c: 9 } }   // 注意4
    ];

    XLSX.utils.book_append_sheet(workbook, questionsSheet, '問題');

    // Create instructions sheet with simplified format
    const instructionsSheetData = [
      ['使用方法', ''],
      ['', ''],
      ['1. 基本情報の入力', ''],
      ['・「コンテンツ」シートの「項目」列に対して「入力内容」列に記入してください', ''],
      ['・タイトルは必須です', ''],
      [`・レベルは「${levelOptions}」から選択してください`, ''],
      ['・語数と文字数は任意です（管理画面で後から編集可能）', ''],
      ['', ''],
      ['2. 本文の入力', ''],
      ['・「コンテンツ」シートの本文欄に速読練習用の読み物を入力してください', ''],
      ['・改行はそのまま反映されます', ''],
      ['・ルビ（振り仮名）を使用する場合は、指定の記法を使用してください', ''],
      ['・読み物の解説は任意です', ''],
      ['', ''],
      ['3. 問題の入力', ''],
      ['・「問題」シートに理解度確認問題を入力してください', ''],
      ['・問題数に制限はありません（必要な分だけ行を追加できます）', ''],
      ['・選択肢は最低2つ、最大6つまで設定できます', ''],
      ['・選択肢は左から順に配置し、空欄があれば無視されます', ''],
      ['・正解番号は1から始まる数字で指定してください', ''],
      ['・問題が不要な場合は、ヘッダー行より下を空のままにしてください', ''],
      ['', ''],
      ['4. 重要な注意事項', ''],
      ['・「問題」シートのヘッダー行は変更しないでください', ''],
      ['・選択肢の列は「選択肢1」「選択肢2」...という名前である必要があります', ''],
      ['・「正解番号」と「解説」の列名も変更しないでください', ''],
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