const calculateResults = (answers) => {
    const results = {
      perception: 0,
      intelligence: 0,
      emotion: 0,
      physical: 0,
      hidden: 0
    };
  
    // 각 질문에 대한 카테고리 매핑
    const questionCategories = [
      'perception', 'intelligence', 'emotion', 'physical', 'hidden',
      'perception', 'intelligence', 'emotion', 'physical', 'perception',
      'intelligence', 'intelligence', 'emotion', 'physical', 'hidden',
      'perception', 'intelligence', 'emotion', 'physical', 'hidden',
      'perception', 'intelligence', 'emotion', 'physical', 'hidden',
      'perception', 'intelligence', 'emotion', 'physical', 'hidden',
      'perception', 'intelligence', 'emotion', 'physical', 'hidden',
      'perception', 'intelligence', 'emotion', 'physical', 'hidden',
      'perception', 'intelligence', 'emotion', 'physical', 'hidden',
      'perception', 'intelligence', 'emotion', 'physical', 'hidden'
    ];
  
    answers.forEach((answer, index) => {
      const category = questionCategories[index];
      results[category] += answer;
    });
  
    // 결과 정규화 (각 카테고리별 질문 수로 나눔)
    const categoryCount = questionCategories.reduce((acc, category) => {
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
  
    Object.keys(results).forEach(key => {
      results[key] = (results[key] / categoryCount[key]) / 5 * 100; // 백분율로 변환
    });
  
    return results;
  };
  
  const extractParts = (results) => {
    const parts = {
      지각: [],
      지성: [],
      감성: [],
      육체: [],
      hidden: []
    };
  
    if (results.perception > 60) parts.지각.push('동체시력이 빨라짐');
    if (results.perception > 70) parts.지각.push('시력이 좋아짐');
    if (results.perception > 80) parts.지각.push('냄새를 잘 맡게됨');
    if (results.perception > 90) parts.지각.push('맛을 세분화하여 잘 느끼게 됨');
  
    if (results.intelligence > 60) parts.지성.push('논리적 사고력 증대');
    if (results.intelligence > 70) parts.지성.push('기억력이 좋아짐');
    if (results.intelligence > 80) parts.지성.push('수사학, 언어의 스킬');
    if (results.intelligence > 90) parts.지성.push('개념, 추상적인 것들에 대한 이해도가 높아짐');
  
    if (results.emotion > 60) parts.감성.push('공감능력');
    if (results.emotion > 70) parts.감성.push('카리스마');
    if (results.emotion > 80) parts.감성.push('감정 조절 능력');
    if (results.emotion > 90) parts.감성.push('미적 감각');
  
    if (results.physical > 60) parts.육체.push('체력, 지치지 않는다');
    if (results.physical > 70) parts.육체.push('근육 강화, 힘의 강화');
    if (results.physical > 80) parts.육체.push('신체의 유연성, 탄력성');
    if (results.physical > 90) parts.육체.push('반응속도');
  
    if (results.hidden > 60) parts.hidden.push('직관력 향상');
    if (results.hidden > 80) parts.hidden.push('소름, 보이지않는 무언가를 느끼게 된다');
  
    return parts;
  };
  
  export { calculateResults, extractParts };