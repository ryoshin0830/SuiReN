// クライアントサイドでコンテンツを取得するためのユーティリティ関数

// 全コンテンツを取得
export async function getContents() {
  try {
    const response = await fetch('/api/contents');
    if (!response.ok) {
      throw new Error('Failed to fetch contents');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching contents:', error);
    throw error;
  }
}

// 特定のコンテンツをIDで取得
export async function getContentById(id) {
  try {
    const response = await fetch(`/api/contents/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch content');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
}

// レベル別にコンテンツを取得
export async function getContentsByLevel(levelCode) {
  const contents = await getContents();
  return contents.filter(content => content.levelCode === levelCode);
}