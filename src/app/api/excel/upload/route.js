import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import prisma from '../../../../lib/prisma';

export const runtime = 'nodejs'; // Ensure Node.js runtime for file processing

export async function POST(request) {
  console.log('Excel upload API called');
  console.log('Request headers:', request.headers);
  
  try {
    // データベースからレベル情報を取得
    let levels;
    try {
      levels = await prisma.level.findMany({
        orderBy: { orderIndex: 'asc' }
      });
    } catch (error) {
      console.error('Failed to fetch levels:', error);
      // フォールバック: デフォルトレベルを使用
      levels = [
        { id: 'beginner', displayName: '中級前半' },
        { id: 'intermediate', displayName: '中級レベル' },
        { id: 'advanced', displayName: '上級レベル' }
      ];
    }
    
    // 表示名からレベルコードへのマッピングを作成
    const displayNameToLevelCode = {};
    levels.forEach(level => {
      displayNameToLevelCode[level.displayName] = level.id;
    });
    // Check content-type
    const contentType = request.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Invalid content type. Expected multipart/form-data' },
        { status: 400 }
      );
    }
    
    let formData;
    try {
      formData = await request.formData();
      console.log('FormData parsed successfully');
    } catch (formError) {
      console.error('Failed to parse form data:', formError);
      return NextResponse.json(
        { error: `リクエストの解析に失敗しました: ${formError.message}` },
        { status: 400 }
      );
    }
    
    // List all form data keys
    const keys = Array.from(formData.keys());
    console.log('FormData keys:', keys);
    
    const file = formData.get('file');

    if (!file) {
      console.error('No file in form data. Available keys:', keys);
      return NextResponse.json(
        { error: 'ファイルが選択されていません。FormDataに"file"キーが見つかりません。' },
        { status: 400 }
      );
    }
    
    // Check if it's actually a File object
    if (!(file instanceof File)) {
      console.error('Form data "file" is not a File object:', typeof file);
      return NextResponse.json(
        { error: 'アップロードされたデータがファイルではありません' },
        { status: 400 }
      );
    }
    
    console.log('File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream' // Sometimes Excel files are detected as this
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      return NextResponse.json(
        { error: 'Excelファイル（.xlsx または .xls）を選択してください' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    let buffer;
    try {
      buffer = await file.arrayBuffer();
    } catch (bufferError) {
      console.error('Failed to convert file to buffer:', bufferError);
      return NextResponse.json(
        { error: 'ファイルの読み込みに失敗しました' },
        { status: 400 }
      );
    }
    
    // Read the Excel file
    let workbook;
    try {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    } catch (xlsxError) {
      console.error('Failed to parse Excel file:', xlsxError);
      return NextResponse.json(
        { error: 'Excelファイルの解析に失敗しました。正しいExcelファイルを選択してください。' },
        { status: 400 }
      );
    }

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

    // Extract basic information using new table format
    let title = '';
    const defaultLevel = levels.find(l => l.isDefault) || levels[0];
    let level = defaultLevel.displayName;
    let text = '';
    let wordCount = null;
    let characterCount = null;
    let explanation = '';

    // Find and extract data from table format
    for (let i = 0; i < contentData.length; i++) {
      const row = contentData[i];
      if (!row || row.length === 0) continue;

      // Skip header row
      if (row[0] === '項目') continue;

      // Extract data based on first column (項目)
      if (row[0] === 'タイトル' && row[1]) {
        title = row[1].toString().trim();
      } else if (row[0] === 'レベル' && row[1]) {
        const levelValue = row[1].toString().trim();
        // 動的レベルリストでチェック
        const validLevel = levels.find(l => l.displayName === levelValue);
        if (validLevel) {
          level = levelValue;
        }
      } else if (row[0] === '本文' && row[1]) {
        // Get the text content directly from row[1]
        const textContent = row[1].toString().trim();
        
        // Filter out instruction/example text from the content
        const filteredLines = textContent.split('\n').filter(line => {
          const trimmedLine = line.trim();
          // Skip ruby notation instructions and examples
          return !trimmedLine.includes('ルビの記法：') &&
                 !trimmedLine.includes('ここに本文を入力してください') &&
                 !trimmedLine.includes('※') &&
                 !trimmedLine.includes('例：') &&
                 !trimmedLine.startsWith('・');
        });
        
        text = filteredLines.join('\n').trim();
        
        // Handle multiline text - check if there are continuation rows
        let j = i + 1;
        while (j < contentData.length && contentData[j] && !contentData[j][0]) {
          if (contentData[j][1]) {
            const continuationText = contentData[j][1].toString().trim();
            // Apply same filtering to continuation lines
            if (!continuationText.includes('ルビの記法：') &&
                !continuationText.includes('ここに本文を入力してください') &&
                !continuationText.includes('※') &&
                !continuationText.includes('例：') &&
                !continuationText.startsWith('・')) {
              text += '\n' + continuationText;
            }
          }
          j++;
        }
      } else if (row[0] === '語数' && row[1]) {
        const count = parseInt(row[1].toString().trim());
        if (!isNaN(count) && count > 0) {
          wordCount = count;
        }
      } else if (row[0] === '文字数' && row[1]) {
        const count = parseInt(row[1].toString().trim());
        if (!isNaN(count) && count > 0) {
          characterCount = count;
        }
      } else if ((row[0] === 'テキストの解説' || row[0] === '文章の解説') && row[1]) {
        // Get the explanation content directly from row[1]
        const explanationContent = row[1].toString().trim();
        
        // Filter out instruction text from the explanation
        const filteredExplanation = explanationContent.split('\n').filter(line => {
          const trimmedLine = line.trim();
          return !trimmedLine.includes('ここにテキストの解説を入力してください') &&
                 !trimmedLine.includes('ここに文章の解説を入力してください') &&
                 !trimmedLine.includes('※') &&
                 !trimmedLine.includes('例：') &&
                 !trimmedLine.startsWith('・');
        });
        
        explanation = filteredExplanation.join('\n').trim();
        
        // Handle multiline explanation - check if there are continuation rows
        let j = i + 1;
        while (j < contentData.length && contentData[j] && !contentData[j][0]) {
          if (contentData[j][1]) {
            const continuationExplanation = contentData[j][1].toString().trim();
            // Apply same filtering to continuation lines
            if (!continuationExplanation.includes('ここにテキストの解説を入力してください') &&
                !continuationExplanation.includes('ここに文章の解説を入力してください') &&
                !continuationExplanation.includes('※') &&
                !continuationExplanation.includes('例：') &&
                !continuationExplanation.startsWith('・')) {
              explanation += '\n' + continuationExplanation;
            }
          }
          j++;
        }
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
            else if (headerStr === '正解番号') columnMap.correctAnswer = index;
            else if (headerStr === '解説') columnMap.explanation = index;
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

    // Determine level code using dynamic mapping
    const levelCode = displayNameToLevelCode[level] || defaultLevel.id;

    // Prepare the content data
    const contentData2 = {
      title,
      level,
      levelCode,
      text,
      wordCount,
      characterCount,
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
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'ファイルの処理中にエラーが発生しました', 
        details: error.message,
        type: error.name 
      },
      { status: 500 }
    );
  }
}