// 加载环境变量
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3001;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors({ origin: '*', methods: ['POST'], allowedHeaders: ['Content-Type'] }));
app.use(express.json());
app.use(express.static('public'));
app.post('/api/analyze', async (req, res) => {
  try {
    const { text, type } = req.body;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: '请输入至少10个字符的有效观点' });
    }

    let prompt = '';
    if (type === 'findAssumptions') {
      prompt = `你是专业批判性思维分析师，面向职场人与学术研究者。
用户输入一个观点，请你严谨找出它未明说的隐藏假设。
规则：只输出真实存在、逻辑上必须成立的假设；通俗易懂、半学术风格。
输出格式：
- 隐藏假设 1：________
- 隐藏假设 2：________
- 隐藏假设 3：________
用户观点：${text}`;
    } else if (type === 'challengeLogic') {
      prompt = `你是专业逻辑分析师，面向职场人与学术研究者。
请严格只检查以下8类逻辑谬误：
1.以偏概全 2.因果倒置 3.偷换概念 4.诉诸权威
5.滑坡谬误 6.虚假两难 7.人身攻击 8.诉诸情感
规则：只指出真实存在的漏洞；每条写类型+解释；半学术、通俗易懂。
输出格式：
- 逻辑漏洞 1：【类型】解释：________
- 逻辑漏洞 2：【类型】解释：________
用户观点：${text}`;
    } else if (type === 'counterargument') {
      prompt = `你是理性批判性思维助手，面向职场人与学术研究者。
请对用户观点提出建设性反驳，指出局限，给出更合理观点，带逻辑/数据。
风格：半学术、客观、理性、通俗易懂。
输出格式：
- 反向观点 1：________ 逻辑/数据：________
- 反向观点 2：________ 逻辑/数据：________
用户观点：${text}`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.1,
      messages: [{ role: 'user', content: prompt }],
    });

    const result = completion.choices[0].message.content.trim();
    res.json({ result });

  } catch (error) {
    console.error('OpenAI 调用失败：', error.message);
    res.status(500).json({ error: '分析失败，请检查 API Key 或网络' });
  }
});


module.exports = app;