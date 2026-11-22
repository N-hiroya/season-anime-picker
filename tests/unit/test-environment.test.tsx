import { useState } from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe.sequential('unit test environment', () => {
  it('DOM matcherを利用できる', () => {
    render(<p>test environment ready</p>);

    expect(screen.getByText('test environment ready')).toBeInTheDocument();
  });

  it('各テスト後にDOMをクリーンアップする', () => {
    expect(
      screen.queryByText('test environment ready'),
    ).not.toBeInTheDocument();
  });

  it('renderHookでReact hookを検証できる', () => {
    const { result } = renderHook(() => useState(0));

    act(() => {
      result.current[1](1);
    });

    expect(result.current[0]).toBe(1);
  });
});
