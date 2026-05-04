import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { SimplifiedKeyboard } from '../VirtualKeyboard';

describe('SimplifiedKeyboard', () => {
    it('renders keyboard keys correctly', () => {
        render(<SimplifiedKeyboard needsShift={false} />);

        // Standard keys
        expect(screen.getByText('ক')).toBeInTheDocument();
        expect(screen.getByText('খ')).toBeInTheDocument();

        // Ensure space and shift are rendered
        expect(screen.getAllByText('Shift')).toHaveLength(2);
        expect(screen.getByText('Space')).toBeInTheDocument();

        // Verify multiple row representations
        expect(screen.getByText('ক্ষ')).toBeInTheDocument(); // top row
        expect(screen.getByText('া')).toBeInTheDocument(); // home row
        expect(screen.getByText('্য')).toBeInTheDocument(); // bottom row
    });

    it('highlights a specific key based on highlightKeyCode', () => {
        render(<SimplifiedKeyboard highlightKeyCode="KeyK" needsShift={false} />);

        const kKey = screen.getByText('ক').closest('div');
        expect(kKey).toHaveClass('bg-primary/20', 'border-primary', 'text-primary');

        // Verify that another key is NOT highlighted
        const gKey = screen.getByText('গ').closest('div');
        expect(gKey).not.toHaveClass('bg-primary/20', 'border-primary', 'text-primary');
    });

    it('applies shift key highlight when needsShift is true', () => {
        render(<SimplifiedKeyboard needsShift={true} />);

        const shiftKeys = screen.getAllByText('Shift').map(el => el.closest('div'));

        // Both shift keys should be highlighted when needsShift is true
        expect(shiftKeys[0]).toHaveClass('bg-primary/20', 'border-primary', 'text-primary');
        expect(shiftKeys[1]).toHaveClass('bg-primary/20', 'border-primary', 'text-primary');
    });

    it('highlights shifted character on normal key when it is the highlighted key and needsShift is true', () => {
        // highlightKeyCode="KeyK" means 'ক' (normal) / 'খ' (shifted)
        render(<SimplifiedKeyboard highlightKeyCode="KeyK" needsShift={true} />);

        const kContainer = screen.getByText('ক').closest('div');

        // The container should have the basic highlight styling because the logic sets it in base classes:
        // isShiftKey ? (needsShift && ...) : (isHighlighted && ...)
        // Since isHighlighted is true (because keyCode === 'KeyK'), it will have 'bg-primary/20 border-primary text-primary'
        expect(kContainer).toHaveClass('bg-primary/20', 'border-primary', 'text-primary');

        // The shifted char 'খ' span should be highlighted with specific classes: "font-bold text-lg text-primary"
        const shiftedChar = screen.getByText('খ');
        expect(shiftedChar).toHaveClass('font-bold', 'text-lg', 'text-primary');

        // The base char 'ক' span should NOT be highlighted with specific classes:
        const baseChar = screen.getByText('ক');
        expect(baseChar).not.toHaveClass('text-primary', 'text-2xl');
    });

    it('highlights normal character on key when it is the highlighted key and needsShift is false', () => {
        // highlightKeyCode="KeyK" means 'ক' (normal) / 'খ' (shifted)
        render(<SimplifiedKeyboard highlightKeyCode="KeyK" needsShift={false} />);

        // The base char 'ক' span should be highlighted:
        const baseChar = screen.getByText('ক');
        expect(baseChar).toHaveClass('text-primary', 'text-2xl');

        // The shifted char 'খ' span should NOT be highlighted:
        const shiftedChar = screen.getByText('খ');
        expect(shiftedChar).not.toHaveClass('text-primary');
    });

    it('renders a 4-character key correctly', () => {
        // Example: 'e' key (KeyE) has bn='ে', bnShift='ৈ', bnExtra='এ', bnShiftExtra='ঐ'
        render(<SimplifiedKeyboard needsShift={false} />);

        expect(screen.getByText('ে')).toBeInTheDocument();
        expect(screen.getByText('ৈ')).toBeInTheDocument();
        expect(screen.getByText('এ')).toBeInTheDocument();
        expect(screen.getByText('ঐ')).toBeInTheDocument();

        const container = screen.getByText('ে').closest('div');
        // Because hasFourChars returns true, it should use a grid layout
        expect(container).toHaveClass('grid', 'grid-cols-2', 'grid-rows-2');
    });

    it('renders a 3-character key correctly', () => {
        // Example: '\\' key (Backslash) has bn='ৃ', bnShift='ঞ', bnExtra='ঋ'
        render(<SimplifiedKeyboard needsShift={false} />);

        expect(screen.getByText('ৃ')).toBeInTheDocument();
        expect(screen.getByText('ঞ')).toBeInTheDocument();
        expect(screen.getByText('ঋ')).toBeInTheDocument();

        const container = screen.getByText('ৃ').closest('div');
        // Because hasThreeChars returns true, it should use a grid layout
        expect(container).toHaveClass('grid', 'grid-cols-2', 'grid-rows-2');
    });

    it('does not highlight keys when highlightKeyCode does not match any key', () => {
        render(<SimplifiedKeyboard highlightKeyCode="InvalidKey" needsShift={false} />);

        const kKey = screen.getByText('ক').closest('div');
        expect(kKey).not.toHaveClass('bg-primary/20', 'border-primary', 'text-primary');

        const eKey = screen.getByText('ে').closest('div');
        expect(eKey).not.toHaveClass('bg-primary/20', 'border-primary', 'text-primary');
    });

    it('does not highlight shift key with isHighlighted even if keyCode matches (shift uses needsShift)', () => {
        // We simulate passing a shift key as highlightKeyCode.
        // In the component: if (keyData.special === 'shift') { isHighlighted = false; }
        render(<SimplifiedKeyboard highlightKeyCode="ShiftLeft" needsShift={false} />);

        const shiftKeys = screen.getAllByText('Shift').map(el => el.closest('div'));

        // Should not be highlighted because needsShift is false and it ignores isHighlighted flag
        expect(shiftKeys[0]).not.toHaveClass('bg-primary/20', 'border-primary', 'text-primary');
    });
});
