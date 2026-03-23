// Shared base layout for all Creator Hive emails
export function baseLayout(content: string, previewText = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Creator Hive</title>
</head>
<body style="margin:0;padding:0;background:#07070B;font-family:'Inter',sans-serif;color:#fff;">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070B;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="padding-bottom:32px;">
          <a href="https://creatorhive.ae" style="text-decoration:none;">
            <span style="font-size:20px;font-weight:700;letter-spacing:-0.5px;color:#fff;">Creator Hive</span>
          </a>
        </td></tr>
        <tr><td style="background:#0F1318;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:40px;">
          ${content}
        </td></tr>
        <tr><td style="padding-top:24px;text-align:center;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);line-height:1.6;">
            Creator Hive FZE · Sharjah Research Technology and Innovation Park<br/>
            <a href="https://creatorhive.ae" style="color:rgba(255,255,255,0.3);">creatorhive.ae</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export const btn = (text: string, href: string) =>
  `<a href="${href}" style="display:inline-block;background:#fff;color:#07070B;font-size:14px;font-weight:600;padding:12px 28px;border-radius:100px;text-decoration:none;letter-spacing:-0.2px;">${text}</a>`

export const h1 = (text: string) =>
  `<h1 style="margin:0 0 8px;font-size:26px;font-weight:700;letter-spacing:-0.5px;color:#fff;">${text}</h1>`

export const p = (text: string) =>
  `<p style="margin:16px 0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.7);">${text}</p>`

export const divider = () =>
  `<hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:28px 0;" />`
