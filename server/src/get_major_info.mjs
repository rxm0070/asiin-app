import { FetchClient, Config } from 'coze-coding-dev-sdk';
const config = new Config();
const client = new FetchClient(config);
const url = 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F%E4%B8%93%E4%B8%9A%E5%9F%BA%E6%9C%AC%E6%83%85%E5%86%B5.pdf&nonce=76079e2e-0acf-4b96-84e4-f4da0fa776d2&project_id=7633858030576140298&sign=3dcbf103674c4d072482018a54cbd20cc768253c5d3792ccede5e1c0a60fc314';
const response = await client.fetch(url);
const text = response.content
  .filter(item => item.type === 'text')
  .map(item => item.text)
  .join('\n');

console.log('Document length:', text.length);
console.log('\n--- Full Content ---');
console.log(text);
