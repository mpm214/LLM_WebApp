// testArxivCall.js

const { runArxivCall } = require('./src/services/arxiv/arxivCall');

const testArxivCall = async () => {
  try {
    await runArxivCall('Reinforcement Learning Human Feedback', 5);
    console.log('ArXiv call completed successfully');
  } catch (error) {
    console.error('Error running ArXiv call:', error);
  }
};

testArxivCall();