# SecureInsure Style Guide

## Color Palette

### Primary Colors
- **Primary Blue**: `#0ea5e9` (Sky Blue 500) - Use for CTAs, links, primary actions
- **Secondary Blue**: `#06b6d4` (Cyan 500) - Use for accents and highlights
- **Success Green**: `#10b981` (Emerald 500) - Use for success states
- **Warning Orange**: `#f59e0b` (Amber 500) - Use for warnings
- **Danger Red**: `#ef4444` (Red 500) - Use for errors

### Neutral Colors
- **Background**: `#f8fafc` (Slate 50) - Main page background
- **Card Background**: `#ffffff` (White) - Card and content areas
- **Text Primary**: `#1e293b` (Slate 800) - Main text
- **Text Secondary**: `#64748b` (Slate 500) - Secondary text
- **Border**: `#e2e8f0` (Slate 200) - Borders and dividers

### Dark Accents
- **Navy**: `#1e40af` (Blue 800) - Dark accents if needed
- **Footer**: `#0f172a` (Slate 900) - Footer background

## Tailwind Classes to Use

### Backgrounds
- Page background: `bg-background` or `bg-slate-50`
- Cards: `bg-white` or `bg-card`
- Sections: alternate between `bg-white` and `bg-background`

### Text Colors
- Primary text: `text-foreground` or `text-slate-800`
- Secondary text: `text-muted-foreground` or `text-slate-600`
- Links: `text-primary hover:text-primary/80`
- Accent text: `text-primary`

### Buttons
- Primary: `bg-primary text-white hover:bg-primary/90`
- Secondary: `bg-secondary text-secondary-foreground hover:bg-secondary/80`
- Outline: `border-primary text-primary hover:bg-primary/10`

### Borders
- Standard: `border-border` or `border-slate-200`
- Accent: `border-primary`

## Component Patterns

### Cards
```tsx
<div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
  {/* Content */}
</div>
```

### Sections
```tsx
<section className="py-16 bg-white">
  <div className="max-w-[1200px] mx-auto px-4">
    {/* Content */}
  </div>
</section>
```

### CTAs
```tsx
<Button className="bg-primary text-white hover:bg-primary/90">
  Call to Action
</Button>
```

## Typography
- Use default typography from globals.css
- Don't override font-size, font-weight, or line-height unless specifically needed
