import { FetchClient, Config } from 'coze-coding-dev-sdk';
const config = new Config();
const client = new FetchClient(config);
const url = 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2FSelf-Assessment+Report.pdf&nonce=30c00542-578a-4714-b5fb-f901bfaf0f43&project_id=7633858030576140298&sign=fe7e53970ffec99f6da2af4d678c0be0b1405bf3b67cf05012c4cbf159e97805';
const response = await client.fetch(url);
const text = response.content
  .filter(item => item.type === 'text')
  .map(item => item.text)
  .join('\n');

console.log('SAR document length:', text.length);
console.log('\n--- SAR Content Preview (first 5000 chars) ---');
console.log(text.substring(0, 5000));
