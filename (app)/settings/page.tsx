'use client';

/**
 * /settings — placeholder. The original AdminApp shows a "Coming soon"
 * stub for this section, so we keep parity.
 */
export default function SettingsPage() {
  return (
    <div style={{ padding: '40px 36px' }}>
      <div style={{
        fontFamily: 'var(--serif, Georgia, serif)',
        fontSize: 28, color: 'var(--ink, #1a1a1a)', marginBottom: 8,
      }}>Settings</div>
      <div style={{
        fontFamily: 'var(--mono, ui-monospace, monospace)',
        fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'var(--ink-50, #6e6e6e)',
      }}>Platform configuration · coming soon</div>
    </div>
  );
}
