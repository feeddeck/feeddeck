import { assertEquals } from 'std/assert';
import { isMediumUrl } from './medium.ts';

Deno.test('isMediumUrl', () => {
  assertEquals(isMediumUrl('https://acceldataio.medium.com'), true);
  assertEquals(isMediumUrl('https://medium.com/tag/kubernetes'), true);
  assertEquals(isMediumUrl('https://medium.com/jaegertracing'), true);
  assertEquals(isMediumUrl('https://medium.com/@YuriShkuro'), true);
  assertEquals(isMediumUrl('https://www.google.de/'), false);
});
