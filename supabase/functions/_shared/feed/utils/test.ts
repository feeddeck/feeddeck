import { assertEquals } from 'std/assert';

import { ISource } from '../../models/source.ts';
import { IItem } from '../../models/item.ts';

export const assertEqualsSource = (actual: ISource, expected: ISource) => {
  assertEquals(actual.id, expected.id);
  assertEquals(actual.columnId, expected.columnId);
  assertEquals(actual.userId, expected.userId);
  assertEquals(actual.type, expected.type);
  assertEquals(actual.title, expected.title);
  assertEquals(actual.options, expected.options);
  assertEquals(actual.link, expected.link);
  assertEquals(actual.icon, expected.icon);
};

export const assertEqualsItems = (actual: IItem[], expected: IItem[]) => {
  assertEquals(actual.length, expected.length);

  for (let i = 0; i < actual.length; i++) {
    assertEquals(actual[i].id, expected[i].id);
    assertEquals(actual[i].columnId, expected[i].columnId);
    assertEquals(actual[i].userId, expected[i].userId);
    assertEquals(actual[i].sourceId, expected[i].sourceId);
    assertEquals(actual[i].title, expected[i].title);
    assertEquals(actual[i].link, expected[i].link);
    assertEquals(actual[i].media, expected[i].media);
    assertEquals(actual[i].description, expected[i].description);
    assertEquals(actual[i].author, expected[i].author);
    assertEquals(actual[i].options, expected[i].options);
  }
};
