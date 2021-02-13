import PQueue from 'p-queue';

export default new PQueue({
  concurrency: 10,
  intervalCap: 10,
  interval: 1 * 1000,
  timeout: 6 * 1000
});
