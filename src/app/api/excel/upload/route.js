import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    
    // Read the Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Check if required sheets exist
    if (!workbook.SheetNames.includes('コンテンツ')) {
      return NextResponse.json(
        { error: 'テンプレートファイルが正しくありません。「コンテンツ」シートが見つかりません。' },
        { status: 400 }
      );
    }

    // Parse content sheet
    const contentSheet = workbook.Sheets['コンテンツ'];
    const contentData = XLSX.utils.sheet_to_json(contentSheet, { header: 1 });

    // Extract basic information
    let title = '';
    let level = '初級修了レベル';
    let text = '';
    let explanation = '';

    // Find and extract data
    for (let i = 0; i < contentData.length; i++) {
      const row = contentData[i];
      if (!row || row.length === 0) continue;

      if (row[0] === 'タイトル' && row[1]) {
        title = row[1].toString().trim();
      } else if (row[0] === 'レベル' && row[1]) {
        const levelValue = row[1].toString().trim();
        if (['初級修了レベル', '中級レベル', '上級レベル'].includes(levelValue)) {
          level = levelValue;
        }
      } else if (row[0] === '本文') {
        // Collect all text from subsequent rows until we hit another section
        let textRows = [];
        for (let j = i + 1; j < contentData.length; j++) {
          if (contentData[j][0] === '文章の解説（任意）') break;
          if (contentData[j][0] || contentData[j][1]) {
            textRows.push(contentData[j].join(' ').trim());
          }
        }
        text = textRows.join('\n').trim();
      } else if (row[0] === '文章の解説（任意）') {
        // Collect explanation text
        let explanationRows = [];
        for (let j = i + 1; j < contentData.length; j++) {
          if (contentData[j][0] || contentData[j][1]) {
            explanationRows.push(contentData[j].join(' ').trim());
          }
        }
        explanation = explanationRows.join('\n').trim();
      }
    }

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'タイトルが入力されていません' },
        { status: 400 }
      );
    }
    if (!text) {
      return NextResponse.json(
        { error: '本文が入力されていません' },
        { status: 400 }
      );
    }

    // Parse questions sheet if it exists
    let questions = [];
    if (workbook.SheetNames.includes('問題')) {
      const questionsSheet = workbook.Sheets['問題'];
      const questionsData = XLSX.utils.sheet_to_json(questionsSheet, { header: 1 });

      // Find the header row by looking for "問題番号"
      let headerIndex = -1;
      let headers = [];
      for (let i = 0; i < questionsData.length; i++) {
        const row = questionsData[i];
        if (row && row[0] === '問題番号') {
          headerIndex = i;
          headers = row;
          break;
        }
      }

      if (headerIndex !== -1 && headers.length > 0) {
        // Identify column indices
        const columnMap = {};
        headers.forEach((header, index) => {
          if (header) {
            const headerStr = header.toString().trim();
            if (headerStr === '問題番号') columnMap.questionNumber = index;
            else if (headerStr === '問題文') columnMap.questionText = index;
            else if (headerStr.startsWith('選択肢')) columnMap[headerStr] = index;
            else if (headerStr.includes('正解番号')) columnMap.correctAnswer = index;
            else if (headerStr.includes('解説')) columnMap.explanation = index;
          }
        });

        // Collect all option columns dynamically
        const optionColumns = [];
        Object.keys(columnMap).forEach(key => {
          if (key.startsWith('選択肢')) {
            optionColumns.push({ key, index: columnMap[key] });
          }
        });
        // Sort by the number in the column name to ensure correct order
        optionColumns.sort((a, b) => {
          const numA = parseInt(a.key.replace('選択肢', '')) || 0;
          const numB = parseInt(b.key.replace('選択肢', '')) || 0;
          return numA - numB;
        });

        // Parse questions
        for (let i = headerIndex + 1; i < questionsData.length; i++) {
          const row = questionsData[i];
          if (!row || row.length === 0) continue;
          
          // Get question text
          const questionText = columnMap.questionText !== undefined && row[columnMap.questionText] 
            ? row[columnMap.questionText].toString().trim() 
            : '';
          
          if (!questionText) continue; // Skip empty questions

          // Collect options
          const options = [];
          optionColumns.forEach(({ index }) => {
            if (row[index]) {
              const option = row[index].toString().trim();
              if (option) {
                options.push(option);
              }
            }
          });

          if (options.length < 2) continue; // Skip if less than 2 options

          // Get correct answer (convert from 1-based to 0-based)
          let correctAnswer = 0;
          if (columnMap.correctAnswer !== undefined && row[columnMap.correctAnswer]) {
            const answerNum = parseInt(row[columnMap.correctAnswer]);
            if (!isNaN(answerNum) && answerNum >= 1 && answerNum <= options.length) {
              correctAnswer = answerNum - 1;
            }
          }

          // Get explanation
          const questionExplanation = columnMap.explanation !== undefined && row[columnMap.explanation]
            ? row[columnMap.explanation].toString().trim()
            : '';

          questions.push({
            question: questionText,
            options: options,
            correctAnswer: correctAnswer,
            explanation: questionExplanation
          });
        }
      }
    }

    // Determine level code
    let levelCode = 'beginner';
    switch (level) {
      case '初級修了レベル':
        levelCode = 'beginner';
        break;
      case '中級レベル':
        levelCode = 'intermediate';
        break;
      case '上級レベル':
        levelCode = 'advanced';
        break;
    }

    // Prepare the content data
    const contentData2 = {
      title,
      level,
      levelCode,
      text,
      explanation: explanation || '',
      questions: questions, // Empty array is OK - ContentEditor will handle it
      images: [],
      thumbnail: null,
      isFromExcel: true // Flag to indicate this came from Excel import
    };

    return NextResponse.json({
      success: true,
      data: contentData2
    });

  } catch (error) {
    console.error('Error processing Excel file:', error);
    return NextResponse.json(
      { error: 'ファイルの処理中にエラーが発生しました: ' + error.message },
      { status: 500 }
    );
  }
}