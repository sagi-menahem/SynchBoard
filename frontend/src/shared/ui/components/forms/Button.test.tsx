import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import Button from './Button';

describe('Button', () => {
  it('renders its children as the accessible name', () => {
    render(<Button>Create board</Button>);
    expect(screen.getByRole('button', { name: 'Create board' })).toBeInTheDocument();
  });

  it('fires onClick when activated', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick while disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Delete
      </Button>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('forwards arbitrary button attributes through to the element', () => {
    render(
      <Button type="submit" aria-label="Submit form">
        Go
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Submit form' });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('appends a caller-supplied className without dropping the base class', () => {
    render(<Button className="custom-class">Styled</Button>);

    const button = screen.getByRole('button', { name: 'Styled' });
    expect(button.className).toContain('custom-class');
    // The base class is always present; CSS modules hash the name, so assert on count.
    expect(button.className.trim().split(/\s+/).length).toBeGreaterThan(1);
  });

  it('exposes the underlying element through the forwarded ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Focus me</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    ref.current?.focus();
    expect(ref.current).toHaveFocus();
  });
});
