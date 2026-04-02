// Yellina Seeds — Daily Operations Report Edge Function
// Triggered daily at 00:30 UTC (6:00 AM IST) via Supabase cron
// Requires: RESEND_API_KEY, REPORT_RECIPIENT_EMAIL env vars in Supabase dashboard

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const RECIPIENT = Deno.env.get('REPORT_RECIPIENT_EMAIL') || 'admin@yellinaseeds.com';

Deno.serve(async (_req) => {
  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get IST date range for today
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const todayIST = istNow.toISOString().slice(0, 10);
    const todayStart = new Date(todayIST + 'T00:00:00+05:30').toISOString();
    const todayEnd   = new Date(todayIST + 'T23:59:59+05:30').toISOString();

    const [{ data: bins }, { data: intakes }, { data: dispatches }, { data: maintenance }] = await Promise.all([
      sb.from('bins').select('*'),
      sb.from('intakes').select('*').gte('created_at', todayStart).lte('created_at', todayEnd),
      sb.from('dispatches').select('*').gte('created_at', todayStart).lte('created_at', todayEnd),
      sb.from('maintenance_logs').select('*').eq('status', 'open'),
    ]);

    const activeBins = (bins || []).filter((b: any) => b.status !== 'empty');
    const overdueCount = activeBins.filter((b: any) => {
      if (!b.intake_date_ts) return false;
      return (Date.now() - parseInt(b.intake_date_ts)) > 96 * 3600000;
    }).length;
    const readyCount = activeBins.filter((b: any) => (b.current_moisture || 99) <= 10).length;

    const todayIntakeQty = (intakes || []).reduce((s: number, i: any) => s + parseFloat(i.qty || 0), 0);
    const todayDispQty   = (dispatches || []).reduce((s: number, d: any) => s + parseFloat(d.qty || 0), 0);

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Yellina Seeds Daily Report</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#F5F5F5;">
  <div style="background:#0E2018;color:#fff;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="margin:0;font-size:22px;">Yellina Seeds</h1>
    <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">Daily Operations Report — ${todayIST}</p>
  </div>
  <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

    <h2 style="font-size:15px;color:#333;border-bottom:2px solid #F5A623;padding-bottom:8px;margin-bottom:16px;">Today's Summary</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
      <div style="background:#F0FDF4;padding:14px;border-radius:8px;text-align:center;">
        <div style="font-size:28px;font-weight:800;color:#059669;">${(intakes || []).length}</div>
        <div style="font-size:12px;color:#6B7280;">Intakes Today</div>
        <div style="font-size:11px;color:#059669;">${Math.round(todayIntakeQty).toLocaleString()} Kg</div>
      </div>
      <div style="background:#EFF6FF;padding:14px;border-radius:8px;text-align:center;">
        <div style="font-size:28px;font-weight:800;color:#2563EB;">${(dispatches || []).length}</div>
        <div style="font-size:12px;color:#6B7280;">Dispatches Today</div>
        <div style="font-size:11px;color:#2563EB;">${Math.round(todayDispQty).toLocaleString()} Kg</div>
      </div>
    </div>

    <h2 style="font-size:15px;color:#333;border-bottom:2px solid #F5A623;padding-bottom:8px;margin-bottom:16px;">Dryer Status</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:20px;">
      <div style="background:#F9FAFB;padding:12px;border-radius:8px;text-align:center;">
        <div style="font-size:22px;font-weight:800;color:#F5A623;">${activeBins.length}</div>
        <div style="font-size:11px;color:#6B7280;">Active Bins</div>
      </div>
      <div style="background:${readyCount > 0 ? '#F0FDF4' : '#F9FAFB'};padding:12px;border-radius:8px;text-align:center;">
        <div style="font-size:22px;font-weight:800;color:${readyCount > 0 ? '#059669' : '#6B7280'};">${readyCount}</div>
        <div style="font-size:11px;color:#6B7280;">Ready to Dispatch</div>
      </div>
      <div style="background:${overdueCount > 0 ? '#FEF2F2' : '#F9FAFB'};padding:12px;border-radius:8px;text-align:center;">
        <div style="font-size:22px;font-weight:800;color:${overdueCount > 0 ? '#DC2626' : '#6B7280'};">${overdueCount}</div>
        <div style="font-size:11px;color:#6B7280;">Overdue</div>
      </div>
    </div>

    ${(maintenance || []).length > 0 ? `
    <h2 style="font-size:15px;color:#DC2626;border-bottom:2px solid #FCA5A5;padding-bottom:8px;margin-bottom:16px;">Open Maintenance Issues (${(maintenance || []).length})</h2>
    <ul style="margin:0;padding-left:18px;color:#374151;font-size:13px;">
      ${(maintenance || []).slice(0, 5).map((m: any) => `<li style="margin-bottom:6px;">${m.equipment_name} — ${m.issue_description?.slice(0, 60) || m.work_done?.slice(0, 60)}</li>`).join('')}
    </ul>` : '<p style="color:#059669;font-size:13px;">No open maintenance issues</p>'}

    <div style="margin-top:24px;padding-top:16px;border-top:1px solid #E5E7EB;text-align:center;">
      <a href="https://www.yellinaseeds.com" style="background:#F5A623;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Open Platform</a>
      <p style="font-size:11px;color:#9CA3AF;margin-top:12px;">Yellina Seeds Pvt. Ltd., Sathupally · Automated daily report</p>
    </div>
  </div>
</body>
</html>`;

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ ok: true, message: 'RESEND_API_KEY not configured — set it in Supabase Edge Function secrets', previewHtml: html.slice(0, 500) }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Yellina Seeds <reports@yellinaseeds.com>',
        to: [RECIPIENT],
        subject: `Yellina Seeds Daily Report — ${todayIST}`,
        html,
      }),
    });

    const result = await res.json();
    return new Response(JSON.stringify({ ok: res.ok, result }), {
      status: res.ok ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
});
