import { FetchClient, Config } from 'coze-coding-dev-sdk';
const config = new Config();
const client = new FetchClient(config);
const url = 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%A7%91%E5%AD%A6%E4%B8%8E%E6%8A%80%E6%9C%AF%E4%B8%93%E4%B8%9A%E6%95%99%E5%B8%88%E8%AE%A4%E8%AF%81%E9%97%AE%E7%AD%94%EF%BC%88%E6%B1%87%E6%80%BB%EF%BC%89.docx&nonce=e7b918b2-78aa-46e9-85e8-e29039336826&project_id=7633858030576140298&sign=916e36147d16684b03f9961354937d30096c42823a11240214e0a1dd1ef0ecfa';
const response = await client.fetch(url);
const text = response.content
  .filter(item => item.type === 'text')
  .map(item => item.text)
  .join('\n');

console.log('Total text length:', text.length);
console.log('\n--- LAST PART (from position 12400) ---');
console.log(text.substring(12400));

// Count questions
const qMatches = text.match(/Q\d+：/g);
console.log('\n--- Question count:', qMatches ? qMatches.length : 0);
if (qMatches) {
  console.log('Questions found:', qMatches.join(', '));
}
