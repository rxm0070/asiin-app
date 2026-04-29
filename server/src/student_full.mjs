import { FetchClient, Config } from 'coze-coding-dev-sdk';
const config = new Config();
const client = new FetchClient(config);
const url = 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F%E5%AD%A6%E7%94%9F%E5%BA%A7%E8%B0%88%E4%BC%9A%E9%97%AE%E7%AD%94%E6%9D%90%E6%96%99%E5%8F%8A%E4%B8%93%E4%B8%9A%E5%9F%BA%E6%9C%AC%E6%83%85%E5%86%B5.pdf&nonce=22a47c98-747d-4228-bb67-9aa073e3544a&project_id=7633858030576140298&sign=e0d4077dabe7a9cceb0f1c2288bb51ac182cfd35c150630b2c8d1b0687421416';
const response = await client.fetch(url);
const text = response.content
  .filter(item => item.type === 'text')
  .map(item => item.text)
  .join('\n');

console.log('=== FULL STUDENT DOCUMENT ===');
console.log(text);
console.log('\n=== DOCUMENT END ===');
console.log('Length:', text.length);
