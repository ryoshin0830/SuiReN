#!/usr/bin/env python3
import PyPDF2
import sys
import os

def check_pdf(pdf_path):
    """PDFファイルの内容を確認する"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            print(f"PDFファイル: {pdf_path}")
            print(f"ページ数: {len(pdf_reader.pages)}")
            print("-" * 50)
            
            # 各ページの内容を表示
            for page_num, page in enumerate(pdf_reader.pages):
                print(f"ページ {page_num + 1}:")
                try:
                    text = page.extract_text()
                    if text.strip():
                        print(text)
                    else:
                        print("(テキストなし - 画像のみの可能性)")
                except Exception as e:
                    print(f"テキスト抽出エラー: {e}")
                print("-" * 30)
                
    except Exception as e:
        print(f"PDFファイルの読み込みエラー: {e}")

if __name__ == "__main__":
    pdf_path = "public/logos/速読ゴリラ_イラスト.pdf"
    
    if os.path.exists(pdf_path):
        check_pdf(pdf_path)
    else:
        print(f"ファイルが見つかりません: {pdf_path}")