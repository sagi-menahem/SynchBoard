# SynchBoard Design Tokens System

## Overview

The `_design-tokens.scss` file is the single source of truth for all design values in the SynchBoard application. This system was created through a comprehensive audit of the entire codebase to consolidate and rationalize all hard-coded styling values.

## Key Benefits

- **Consistency**: All spacing, colors, and typography follow a systematic scale
- **Maintainability**: Change values in one place, update everywhere
- **Reduced Redundancy**: Similar colors and values have been consolidated
- **Scalability**: Mathematical scales make it easy to add new values
- **Type Safety**: Clear naming conventions prevent errors

## Token Categories

### 🎨 Color System

#### Semantic Colors
- **Primary**: `$color-primary`, `$color-primary-hover`, `$color-primary-light`
- **Success**: `$color-success`, `$color-success-light`
- **Error**: `$color-error`, `$color-error-light`
- **Warning**: `$color-warning`, `$color-warning-light`

#### Neutral Grays
A consolidated 11-step gray scale from `$color-white` to `$color-black`:
- Similar grays like `#cccccc` and `#c6c6c6` have been unified
- Each gray level has a specific purpose (text, borders, backgrounds)

#### Board Backgrounds
8 themed color pairs (light/dark) for user-customizable board backgrounds:
- Default, Midnight, Ember, Forest, Purple, Ocean, Crimson, Golden

### 📏 Spacing System

Based on a **4px grid** using rem units:

```scss
// Small: 4px, 8px, 12px
$spacing-1: 0.25rem;
$spacing-2: 0.5rem;
$spacing-3: 0.75rem;

// Medium: 16px, 24px, 32px
$spacing-4: 1rem;
$spacing-6: 1.5rem;
$spacing-8: 2rem;

// Large: 40px+
$spacing-10: 2.5rem;
// ... and more
```

### 📝 Typography

#### Font Sizes (Modular Scale)
```scss
$font-size-xs: 0.75rem;   // 12px
$font-size-sm: 0.875rem;  // 14px
$font-size-base: 1rem;    // 16px
$font-size-md: 1.125rem;  // 18px
$font-size-lg: 1.25rem;   // 20px
// ... up to 2xl
```

#### Font Weights
- Reduced from 5+ weights to 4 essential values
- `$font-weight-medium: 500` is the most common

### 🔲 Border Radius
```scss
$border-radius-sm: 0.25rem;   // 4px
$border-radius-md: 0.375rem;  // 6px - most common
$border-radius-lg: 0.5rem;    // 8px - very common
$border-radius-full: 50%;     // Circles
```

### 🌑 Shadows
Elevation-based shadow system:
```scss
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.15);
$shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
// Component-specific shadows also available
```

### ⚡ Transitions
```scss
$transition-fast: 0.15s;
$transition-normal: 0.2s;    // Most common
$transition-medium: 0.25s;    // Buttons
```

### 📱 Breakpoints
```scss
$breakpoint-sm: 480px;
$breakpoint-md: 768px;   // Most used
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
```

## Usage Examples

### Using in Component SCSS

```scss
@use '@/styles' as theme;

.button {
  padding: theme.$spacing-2 theme.$spacing-4;
  background: theme.$color-primary;
  border-radius: theme.$border-radius-lg;
  transition: theme.$transition-colors;
  
  &:hover {
    background: theme.$color-primary-hover;
    box-shadow: theme.$shadow-md;
  }
}
```

### Responsive Design

```scss
.container {
  padding: theme.$spacing-4;
  
  @media (min-width: theme.$breakpoint-md) {
    padding: theme.$spacing-6;
  }
}
```

## Migration Guide

### Phase 1: Use Design Tokens (Current)
The design tokens are now available for use alongside existing variables.

### Phase 2: Gradual Migration
1. When editing a component, replace hard-coded values with tokens
2. Replace similar colors with consolidated tokens
3. Use spacing scale instead of arbitrary pixel values

### Phase 3: Full Adoption
Eventually, all components should use only design tokens.

## Consolidation Decisions

### Colors Rationalized
- **15+ similar grays** → 10 systematic values
- **Multiple near-whites** → Single `$color-gray-50`
- **Various dark grays** → Consolidated scale

### Spacing Simplified
- **Random pixel values** → 4px grid system
- **Mixed rem/px** → Consistent rem units
- **Arbitrary margins** → Systematic scale

### Typography Standardized
- **7+ font sizes** → Modular scale
- **5 font weights** → 4 essential weights
- **Random line heights** → 3 standard values

## Maintenance

### Adding New Tokens
1. Check if an existing token can be used
2. Follow the naming convention: `$category-variant-modifier`
3. Add to the appropriate section
4. Document the use case

### Deprecating Tokens
1. Mark as deprecated with comment
2. Provide migration path
3. Remove after full migration

## Google Branding

The Google button colors are immutable and must remain consistent with brand guidelines:
```scss
$google-button-bg: #ffffff;
$google-button-text: #1f1f1f;
// ... etc
```

## Next Steps

1. **Component Migration**: Gradually update components to use design tokens
2. **Remove Redundancy**: Eliminate duplicate color definitions
3. **Enforce Usage**: Consider linting rules to enforce token usage
4. **Dark Theme**: Leverage tokens for easier theme switching

## Questions?

For questions about design tokens or migration assistance, please refer to the design system documentation or contact the frontend team.