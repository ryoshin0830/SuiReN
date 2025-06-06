// 読解コンテンツデータ
export const readingContents = [
  {
    id: '1-1',
    title: 'ももたろう',
    level: '初級修了レベル',
    levelCode: 'beginner',
    text: `むかし、むかし、あるところに、おじいさんとおばあさんがいました。
おじいさんは山にしばかりに、おばあさんは川に洗濯に行きました。
おばあさんが川で洗濯をしていると、大きな桃が流れてきました。
「あら、大きな桃だこと。おじいさんのお土産にしましょう。」
おばあさんは桃を家に持って帰りました。`,
    questions: [
      {
        id: 1,
        question: 'おじいさんは何をしに山に行きましたか。',
        options: [
          'しばかりに',
          '桃を取りに',
          '洗濯に',
          '買い物に'
        ],
        correctAnswer: 0
      },
      {
        id: 2,
        question: '川に何が流れてきましたか。',
        options: [
          'りんご',
          '桃',
          'みかん',
          'なし'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: '2-1',
    title: '仏教',
    level: '中級レベル',
    levelCode: 'intermediate',
    text: `仏教は約2500年前にインドで始まりました。
お釈迦様という人が悩みや苦しみから解放される方法を教えました。
仏教は平和と慈悲の心を大切にします。
現在、世界中の多くの人々が仏教を信仰しています。`,
    questions: [
      {
        id: 1,
        question: '仏教はいつ頃始まりましたか。',
        options: [
          '約1500年前',
          '約2000年前',
          '約2500年前',
          '約3000年前'
        ],
        correctAnswer: 2
      },
      {
        id: 2,
        question: '仏教が大切にするものは何ですか。',
        options: [
          '富と名声',
          '平和と慈悲',
          '力と権力',
          '知識と技術'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: '3-1',
    title: 'エチオピアのコーヒー',
    level: '上級レベル',
    levelCode: 'advanced',
    text: `エチオピアはコーヒーの発祥地として知られています。
伝説によると、羊飼いの少年がコーヒーの実を食べた羊が元気になることを発見したのが始まりとされています。
エチオピアのコーヒー文化は非常に深く、コーヒーセレモニーという伝統的な儀式があります。
この儀式では、生豆を焙煎し、挽いて、丁寧にコーヒーを淹れます。`,
    questions: [
      {
        id: 1,
        question: 'エチオピアはコーヒーの何として知られていますか。',
        options: [
          '最大の輸出国',
          '発祥地',
          '最高品質の産地',
          '消費量が最も多い国'
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        question: 'エチオピアの伝統的なコーヒーの儀式を何と言いますか。',
        options: [
          'コーヒータイム',
          'コーヒーセレモニー',
          'コーヒーパーティー',
          'コーヒーフェスティバル'
        ],
        correctAnswer: 1
      }
    ]
  }
];

export const getContentById = (id) => {
  return readingContents.find(content => content.id === id);
};

export const getContentsByLevel = (levelCode) => {
  return readingContents.filter(content => content.levelCode === levelCode);
};