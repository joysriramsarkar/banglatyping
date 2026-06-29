import { getDrillRecommendations } from './src/lib/custom-drill-generator';

const originalFetch = global.fetch;
global.fetch = async (url, options) => {
  await new Promise(resolve => setTimeout(resolve, 50));
  if (url.toString().includes('user_statistics')) {
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return new Response(JSON.stringify([]), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

async function main() {
  // Warmup
  await getDrillRecommendations('some-user-id');

  const start = performance.now();
  for (let i = 0; i < 10; i++) {
    await getDrillRecommendations('some-user-id');
  }
  const end = performance.now();
  console.log(`Average time: ${(end - start) / 10} ms`);
}

main().catch(console.error);
