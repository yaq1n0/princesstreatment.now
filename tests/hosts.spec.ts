import { test, expect } from '@playwright/test';
import { resolveMediaUrl } from '../src/utils/hosts';

test.describe('resolveMediaUrl', () => {
  test('tenor view URL → iframe embed with numeric id', () => {
    const r = resolveMediaUrl(
      'https://tenor.com/en-GB/view/dog-scroll-crying-depression-doomscrolling-gif-4138822033792608878'
    );
    expect(r).toEqual({
      kind: 'iframe',
      src: 'https://tenor.com/embed/4138822033792608878',
    });
  });

  test('tenor view URL without locale segment', () => {
    const r = resolveMediaUrl('https://tenor.com/view/some-thing-gif-12345');
    expect(r).toEqual({ kind: 'iframe', src: 'https://tenor.com/embed/12345' });
  });

  test('tenor non-view URL → null', () => {
    expect(resolveMediaUrl('https://tenor.com/search/cat')).toBeNull();
  });

  test('giphy gif URL → direct media.giphy.com gif', () => {
    const r = resolveMediaUrl('https://giphy.com/gifs/funny-cat-abc123XYZ');
    expect(r).toEqual({ kind: 'image', src: 'https://media.giphy.com/media/abc123XYZ/giphy.gif' });
  });

  test('giphy homepage → null', () => {
    expect(resolveMediaUrl('https://giphy.com/')).toBeNull();
  });

  test('imgur single image page → i.imgur.com gif', () => {
    const r = resolveMediaUrl('https://imgur.com/a1b2c3d');
    expect(r).toEqual({ kind: 'image', src: 'https://i.imgur.com/a1b2c3d.gif' });
  });

  test('imgur album URL → null', () => {
    expect(resolveMediaUrl('https://imgur.com/a/abcd123')).toBeNull();
  });

  test('imgur gallery URL → null', () => {
    expect(resolveMediaUrl('https://imgur.com/gallery/abcd123')).toBeNull();
  });

  test('unrelated URL → null', () => {
    expect(resolveMediaUrl('https://example.com/foo.png')).toBeNull();
  });

  test('empty string → null', () => {
    expect(resolveMediaUrl('')).toBeNull();
  });
});
