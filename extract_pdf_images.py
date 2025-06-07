#!/usr/bin/env python3
from pdf2image import convert_from_path
import os

def extract_pdf_as_images(pdf_path):
    """PDFを画像として変換して保存"""
    try:
        # PDFを画像に変換
        images = convert_from_path(pdf_path)
        
        print(f"PDFファイル: {pdf_path}")
        print(f"変換された画像数: {len(images)}")
        
        # 各ページを画像として保存
        for i, image in enumerate(images):
            output_path = f"public/logos/速読ゴリラ_page_{i+1}.png"
            image.save(output_path, 'PNG')
            print(f"ページ {i+1} を保存: {output_path}")
            
    except Exception as e:
        print(f"PDF変換エラー: {e}")
        print("注意: macOSではpoppler-utilsが必要な場合があります")
        print("インストール: brew install poppler")

if __name__ == "__main__":
    pdf_path = "public/logos/速読ゴリラ_イラスト.pdf"
    
    if os.path.exists(pdf_path):
        extract_pdf_as_images(pdf_path)
    else:
        print(f"ファイルが見つかりません: {pdf_path}")