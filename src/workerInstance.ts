import Worker from './worker?worker';

export const worker = new Worker();

worker.addEventListener('message', (event) => {
  console.log('workerInstance message', event);
});

worker.addEventListener('error', (event) => {
  console.log('workerInstance error', event);
});

worker.addEventListener('messageerror', (event) => {
  console.log('workerInstance messageerror', event);
});
