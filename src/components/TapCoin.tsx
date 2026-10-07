import { forwardRef, useReducer, useRef } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import type { TapResult } from '../../shared/rules.ts';
import { formatFull } from '../game/format.ts';
import { falconCoin } from '../images';

interface Float {
  id: number;
  x: number;
  y: number;
  value: number;
}

type FloatAction = { type: 'add'; x: number; y: number; value: number } | { type: 'remove'; id: number };

const MAX_FLOATS = 30;

function floatsReducer(s: { nextId: number; items: Float[] }, a: FloatAction) {
  if (a.type === 'remove') return { ...s, items: s.items.filter((f) => f.id !== a.id) };
  return { nextId: s.nextId + 1, items: [...s.items, { id: s.nextId, x: a.x, y: a.y, value: a.value }].slice(-MAX_FLOATS) };
}

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

interface Props {
  empty: boolean;
  /** Applies one tap to the game and returns the outcome. */
  onTap: () => TapResult;
  /** Called on pointer-up: a user gesture that may unlock audio. */
  onGesture: () => void;
}

/**
 * The tap target (Plan.md A3, A4). Each pointer that goes down scores once, so N fingers
 * give N taps and a finger already down never re-scores. Space/Enter tap once per press
 * with no key repeat. Right-clicks are ignored.
 */
export const TapCoin = forwardRef<HTMLButtonElement, Props>(function TapCoin({ empty, onTap, onGesture }, ref) {
  const imgRef = useRef<HTMLImageElement>(null);
  const animation = useRef<Animation | null>(null);
  const lastInputAt = useRef(-Infinity);
  const [floats, dispatch] = useReducer(floatsReducer, { nextId: 1, items: [] });

  const tapAt = (x: number, y: number, width: number, height: number) => {
    lastInputAt.current = performance.now();
    const result = onTap();
    if (result.accepted) dispatch({ type: 'add', x, y, value: result.value });

    const img = imgRef.current;
    if (!img?.animate) return;
    animation.current?.cancel(); // restart the press on every tap
    const reduce = reducedMotion();
    if (result.accepted) {
      const dx = x / width - 0.5;
      const dy = y / height - 0.5;
      animation.current = reduce
        ? img.animate([{ opacity: 0.8 }, { opacity: 1 }], { duration: 150 })
        : img.animate(
            [
              { transform: `perspective(700px) rotateX(${(-dy * 16).toFixed(1)}deg) rotateY(${(dx * 16).toFixed(1)}deg) scale(0.95)` },
              { transform: 'none' },
            ],
            { duration: 180, easing: 'ease-out' },
          );
    } else if (!reduce) {
      animation.current = img.animate(
        [
          { transform: 'translateX(0)' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(7px)' },
          { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' },
        ],
        { duration: 320, easing: 'ease-in-out' },
      );
    }
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    tapAt(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault(); // no click, no page scroll
    if (e.repeat) return;
    const { width, height } = e.currentTarget.getBoundingClientRect();
    tapAt(width / 2, height / 2, width, height);
  };

  // Browsers activate buttons on Space key-up; cancel it so the keydown above is the only tap.
  const onKeyUp = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ') e.preventDefault();
  };

  // Clicks with detail 0 come from assistive technology, which may send no pointer or key
  // events. Ignore them if a pointer or key tap just happened, so nothing counts twice.
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (e.detail !== 0 || performance.now() - lastInputAt.current < 500) return;
    const { width, height } = e.currentTarget.getBoundingClientRect();
    tapAt(width / 2, height / 2, width, height);
  };

  return (
    <button
      ref={ref}
      type="button"
      className="coin"
      aria-label="Falcon coin. Tap to earn coins"
      aria-disabled={empty}
      onPointerDown={onPointerDown}
      onPointerUp={onGesture}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      <img ref={imgRef} src={falconCoin} alt="" width={600} height={600} draggable={false} />
      {floats.items.map((f) => (
        <span
          key={f.id}
          className="float tabular"
          style={{ left: f.x, top: f.y }}
          aria-hidden="true"
          onAnimationEnd={() => dispatch({ type: 'remove', id: f.id })}
        >
          +{formatFull(f.value)}
        </span>
      ))}
    </button>
  );
});
