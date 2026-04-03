// Yellina Seeds — Daily Operations Report Edge Function v4
// Triggered daily at 00:30 UTC (6:00 AM IST) via Supabase cron
// Requires: RESEND_API_KEY, REPORT_RECIPIENT_EMAIL env vars in Supabase dashboard

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const RECIPIENT = Deno.env.get('REPORT_RECIPIENT_EMAIL') || 'admin@yellinaseeds.com';

function buildBinsTable(activeBins: any[]): string {
  if (activeBins.length === 0) {
    return '<p style="color:#6B7280;font-size:13px;">No active bins currently.</p>';
  }
  const rows = activeBins.map((b: any) => {
    const moisture = b.current_moisture != null ? b.current_moisture + '%' : 'N/A';
    const intakeMoisture = b.intake_moisture != null ? b.intake_moisture + '%' : 'N/A';
    const qty = b.current_qty != null ? Math.round(b.current_qty).toLocaleString() + ' kg' : 'N/A';
    const hybrid = b.hybrid_name || b.crop_type || 'N/A';
    const label = b.binLabel || b.id;
    const daysIn = b.intake_date_ts
      ? Math.floor((Date.now() - parseInt(b.intake_date_ts)) / 86400000)
      : '?';
    const statusColor = b.status === 'ready' ? '#059669' : b.status === 'drying' ? '#2563EB' : '#6B7280';
    const status = (b.status || 'unknown').toUpperCase();
    return (
      '<tr>' +
      '<td style="padding:8px 10px;border-bottom:1px solid #F3F4F6;font-weight:600;">Bin ' + label + '</td>' +
      '<td style="padding:8px 10px;border-bottom:1px solid #F3F4F6;">' + hybrid + '</td>' +
      '<td style="padding:8px 10px;border-bottom:1px solid #F3F4F6;">' + qty + '</td>' +
      '<td style="padding:8px 10px;border-bottom:1px solid #F3F4F6;">' + intakeMoisture + ' -&gt; ' + moisture + '</td>' +
      '<td style="padding:8px 10px;border-bottom:1px solid #F3F4F6;">' + daysIn + 'd</td>' +
      '<td style="padding:8px 10px;border-bottom:1px solid #F3F4F6;color:' + statusColor + ';font-weight:600;">' + status + '</td>' +
      '</tr>'
    );
  }).join('');
  return (
    '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
    '<thead><tr style="background:#F9FAFB;">' +
    '<th style="padding:8px 10px;text-align:left;color:#374151;">Bin</th>' +
    '<th style="padding:8px 10px;text-align:left;color:#374151;">Hybrid</th>' +
    '<th style="padding:8px 10px;text-align:left;color:#374151;">Qty</th>' +
    '<th style="padding:8px 10px;text-align:left;color:#374151;">Intake-&gt;Current</th>' +
    '<th style="padding:8px 10px;text-align:left;color:#374151;">Days In</th>' +
    '<th style="padding:8px 10px;text-align:left;color:#374151;">Status</th>' +
    '</tr></thead>' +
    '<tbody>' + rows + '</tbody>' +
    '</table>'
  );
}

function buildIntakesTable(intakes: any[]): string {
  if (intakes.length === 0) {
    return '<p style="color:#6B7280;font-size:13px;">No intakes recorded today.</p>';
  }
  const rows = intakes.map((i: any) => {
    const time = new Date(i.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    const qty = Math.round(parseFloat(i.qty || 0)).toLocaleString();
    const moisture = i.moisture_pct != null ? i.moisture_pct + '%' : 'N/A';
    const hybrid = i.hybrid_name || i.crop_type || 'N/A';
    const vehicle = i.vehicle_number || '-';
    return (
      '<tr>' +
      '<td style="padding:6px 10px;border-bottom:1px solid #F3F4F6;">' + time + '</td>' +
      '<td style="padding:6px 10px;border-bottom:1px solid #F3F4F6;">' + hybrid + '</td>' +
      '<td style="padding:6px 10px;border-bottom:1px solid #F3F4F6;font-weight:600;">' + qty + ' kg</td>' +
      '<td style="padding:6px 10px;border-bottom:1px solid #F3F4F6;">' + moisture + '</td>' +
      '<td style="padding:6px 10px;border-bottom:1px solid #F3F4F6;color:#6B7280;">' + vehicle + '</td>' +
      '</tr>'
    );
  }).join('');
  return (
    '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
    '<thead><tr style="background:#F9FAFB;">' +
    '<th style="padding:6px 10px;text-align:left;color:#374151;">Time</th>' +
    '<th style="padding:6px 10px;text-align:left;color:#374151;">Hybrid</th>' +
    '<th style="padding:6px 10px;text-align:left;color:#374151;">Qty</th>' +
    '<th style="padding:6px 10px;text-align:left;color:#374151;">Moisture</th>' +
    '<th style="padding:6px 10px;text-align:left;color:#374151;">Vehicle</th>' +
    '</tr></thead>' +
    '<tbody>' + rows + '</tbody>' +
    '</table>'
  );
}

function buildDispatchesTable(dispatches: any[]): string {
  if (dispatches.length === 0) {
    return '<p style="color:#6B7280;font-size:13px;">No dispatches recorded today.</p>';
  }
  const rows = dispatches.map((d: any) => {
    const time = new Date(d.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    const qty = Math.round(parseFloat(d.qty || 0)).toLocaleString();
    const buyer = d.buyer_name || d.party_name || 'N/A';
    const receipt = d.receipt_id || '-';
    const vehicle = d.vehicle_number || '-';
    return (
      '<tr>' +
      '<td style="padding:6px 10px;border-bottom:1px solid #F3F4F6;">' + time + '</td>' +
      '<td style="padding:6px 10px;border-bottom:1px solid #F3F4F6;font-weight:600;">' + qty + ' kg</td>' +
      '<td style="padding:6px 10px;border-bottom:1px solid #F3F4F6;">' + buyer + '</td>' +
      '<td style="padding:6px 10px;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:11px;">' + receipt + '</td>' +
      '<td style="padding:6px 10px;border-bottom:1px solid #F3F4F6;color:#6B7280;">' + vehicle + '</td>' +
      '</tr>'
    );
  }).join('');
  return (
    '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
    '<thead><tr style="background:#F9FAFB;">' +
    '<th style="padding:6px 10px;text-align:left;color:#374151;">Time</th>' +
    '<th style="padding:6px 10px;text-align:left;color:#374151;">Qty</th>' +
    '<th style="padding:6px 10px;text-align:left;color:#374151;">Buyer</th>' +
    '<th style="padding:6px 10px;text-align:left;color:#374151;">Receipt</th>' +
    '<th style="padding:6px 10px;text-align:left;color:#374151;">Vehicle</th>' +
    '</tr></thead>' +
    '<tbody>' + rows + '</tbody>' +
    '</table>'
  );
}

function buildMaintenanceSection(maintenance: any[]): string {
  if (maintenance.length === 0) {
    return '<p style="color:#059669;font-size:13px;margin:0;">&#10003; No open maintenance issues</p>';
  }
  const items = maintenance.slice(0, 8).map((m: any) => {
    const desc = (m.issue_description || m.work_done || 'No description').slice(0, 80);
    const equipment = m.equipment_name || 'Unknown equipment';
    const priority = (m.priority || 'normal').toUpperCase();
    const priorityColor = m.priority === 'high' ? '#DC2626' : m.priority === 'medium' ? '#D97706' : '#6B7280';
    return (
      '<li style="margin-bottom:8px;padding:8px;background:#FEF2F2;border-radius:6px;list-style:none;">' +
      '<span style="font-weight:600;color:#374151;">' + equipment + '</span>' +
      '<span style="color:' + priorityColor + ';font-size:11px;font-weight:600;margin-left:8px;">[' + priority + ']</span>' +
      '<br><span style="color:#6B7280;font-size:12px;">' + desc + '</span>' +
      '</li>'
    );
  }).join('');
  return '<ul style="margin:0;padding:0;">' + items + '</ul>';
}

function buildWeatherSection(weather: any): string {
  if (!weather) {
    return '<p style="color:#6B7280;font-size:13px;">Weather data unavailable.</p>';
  }
  try {
    const current = weather.current;
    const temp = current.temperature_2m != null ? current.temperature_2m + '\u00b0C' : 'N/A';
    const humidity = current.relative_humidity_2m != null ? current.relative_humidity_2m + '%' : 'N/A';
    const windspeed = current.wind_speed_10m != null ? Math.round(current.wind_speed_10m) + ' km/h' : 'N/A';
    const rain = current.precipitation != null ? current.precipitation + ' mm' : '0 mm';
    const dryingNote = current.relative_humidity_2m < 50
      ? 'Excellent drying conditions today.'
      : current.relative_humidity_2m < 70
        ? 'Good drying conditions today.'
        : 'High humidity - monitor drying closely.';
    return (
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;">' +
      '<div style="text-align:center;padding:8px;background:#F0F9FF;border-radius:6px;">' +
      '<div style="font-size:20px;font-weight:800;color:#0EA5E9;">' + temp + '</div>' +
      '<div style="font-size:11px;color:#6B7280;">Temperature</div></div>' +
      '<div style="text-align:center;padding:8px;background:#F0FDF4;border-radius:6px;">' +
      '<div style="font-size:20px;font-weight:800;color:#059669;">' + humidity + '</div>' +
      '<div style="font-size:11px;color:#6B7280;">Humidity</div></div>' +
      '<div style="text-align:center;padding:8px;background:#F9FAFB;border-radius:6px;">' +
      '<div style="font-size:20px;font-weight:800;color:#374151;">' + windspeed + '</div>' +
      '<div style="font-size:11px;color:#6B7280;">Wind Speed</div></div>' +
      '<div style="text-align:center;padding:8px;background:#F9FAFB;border-radius:6px;">' +
      '<div style="font-size:20px;font-weight:800;color:#374151;">' + rain + '</div>' +
      '<div style="font-size:11px;color:#6B7280;">Rainfall</div></div>' +
      '</div>' +
      '<p style="margin:10px 0 0;font-size:12px;color:#374151;font-style:italic;">' + dryingNote + '</p>'
    );
  } catch (_e) {
    return '<p style="color:#6B7280;font-size:13px;">Weather data parse error.</p>';
  }
}

function build7DayTrendSection(intakes7: any[], dispatches7: any[], todayIST: string): string {
  // Group by date
  const dateMap: Record<string, { intake: number; dispatch: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayIST + 'T00:00:00+05:30');
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dateMap[key] = { intake: 0, dispatch: 0 };
  }
  for (const row of (intakes7 || [])) {
    const key = new Date(row.created_at).toISOString().slice(0, 10);
    if (dateMap[key]) dateMap[key].intake += parseFloat(row.qty || 0);
  }
  for (const row of (dispatches7 || [])) {
    const key = new Date(row.created_at).toISOString().slice(0, 10);
    if (dateMap[key]) dateMap[key].dispatch += parseFloat(row.qty || 0);
  }
  const rows = Object.entries(dateMap).map(([date, vals]) => {
    const label = new Date(date + 'T12:00:00Z').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
    const isToday = date === todayIST;
    const intakeQty = Math.round(vals.intake).toLocaleString();
    const dispQty = Math.round(vals.dispatch).toLocaleString();
    const bg = isToday ? '#FFFBEB' : 'transparent';
    return (
      '<tr style="background:' + bg + ';">' +
      '<td style="padding:6px 10px;border-bottom:1px solid #F3F4F6;font-size:12px;' + (isToday ? 'font-weight:700;' : '') + '">' + label + (isToday ? ' (today)' : '') + '</td>' +
      '<td style="padding:6px 10px;border-bottom:1px solid #F3F4F6;font-size:12px;color:#059669;text-align:right;">' + (vals.intake > 0 ? intakeQty + ' kg' : '-') + '</td>' +
      '<td style="padding:6px 10px;border-bottom:1px solid #F3F4F6;font-size:12px;color:#2563EB;text-align:right;">' + (vals.dispatch > 0 ? dispQty + ' kg' : '-') + '</td>' +
      '</tr>'
    );
  }).join('');
  return (
    '<table style="width:100%;border-collapse:collapse;">' +
    '<thead><tr style="background:#F9FAFB;">' +
    '<th style="padding:6px 10px;text-align:left;font-size:12px;color:#374151;">Date</th>' +
    '<th style="padding:6px 10px;text-align:right;font-size:12px;color:#059669;">Intake</th>' +
    '<th style="padding:6px 10px;text-align:right;font-size:12px;color:#2563EB;">Dispatch</th>' +
    '</tr></thead>' +
    '<tbody>' + rows + '</tbody>' +
    '</table>'
  );
}

function buildLaborSection(laborLogs: any[]): string {
  if (!laborLogs || laborLogs.length === 0) {
    return '<p style="color:#6B7280;font-size:13px;">No labor records today.</p>';
  }
  const totalWorkers = laborLogs.reduce((s: number, l: any) => s + (parseInt(l.worker_count || l.num_workers || 1)), 0);
  const rows = laborLogs.slice(0, 5).map((l: any) => {
    const shift = l.shift_type || l.shift || 'N/A';
    const workers = l.worker_count || l.num_workers || 1;
    const task = (l.task_description || l.notes || 'General').slice(0, 50);
    return (
      '<li style="font-size:12px;color:#374151;margin-bottom:4px;padding:4px 0;border-bottom:1px solid #F3F4F6;">' +
      '<span style="font-weight:600;">' + shift + '</span> — ' + workers + ' workers — ' + task +
      '</li>'
    );
  }).join('');
  return (
    '<p style="font-size:13px;color:#374151;margin:0 0 10px;"><strong>' + totalWorkers + ' total workers</strong> across ' + laborLogs.length + ' shift(s)</p>' +
    '<ul style="margin:0;padding:0;">' + rows + '</ul>'
  );
}

Deno.serve(async (_req) => {
  const log: string[] = [];
  try {
    log.push('start');
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    log.push('supabase client created');

    // IST date range
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const todayIST = istNow.toISOString().slice(0, 10);
    const todayStart = new Date(todayIST + 'T00:00:00+05:30').toISOString();
    const todayEnd   = new Date(todayIST + 'T23:59:59+05:30').toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    log.push('dates: ' + todayIST);

    // Fetch all data in parallel
    const [
      binsRes,
      intakesRes,
      dispatchesRes,
      maintenanceRes,
      intakes7Res,
      dispatches7Res,
      laborRes,
    ] = await Promise.all([
      sb.from('bins').select('*'),
      sb.from('intakes').select('*').gte('created_at', todayStart).lte('created_at', todayEnd),
      sb.from('dispatches').select('*').gte('created_at', todayStart).lte('created_at', todayEnd),
      sb.from('maintenance_logs').select('*').eq('status', 'open'),
      sb.from('intakes').select('created_at,qty').gte('created_at', sevenDaysAgo),
      sb.from('dispatches').select('created_at,qty').gte('created_at', sevenDaysAgo),
      sb.from('labor_logs').select('*').gte('created_at', todayStart).lte('created_at', todayEnd),
    ]);
    log.push('db fetch done');

    const bins = binsRes.data || [];
    const intakes = intakesRes.data || [];
    const dispatches = dispatchesRes.data || [];
    const maintenance = maintenanceRes.data || [];
    const intakes7 = intakes7Res.data || [];
    const dispatches7 = dispatches7Res.data || [];
    const laborLogs = laborRes.data || [];

    const activeBins = bins.filter((b: any) => b.status !== 'empty');
    const readyBins = activeBins.filter((b: any) => (b.current_moisture || 99) <= 10);
    const overdueBins = activeBins.filter((b: any) => {
      if (!b.intake_date_ts) return false;
      return (Date.now() - parseInt(b.intake_date_ts)) > 96 * 3600000;
    });

    const todayIntakeQty = intakes.reduce((s: number, i: any) => s + parseFloat(i.qty || 0), 0);
    const todayDispQty   = dispatches.reduce((s: number, d: any) => s + parseFloat(d.qty || 0), 0);
    const totalStockQty  = activeBins.reduce((s: number, b: any) => s + parseFloat(b.current_qty || 0), 0);
    log.push('stats computed');

    // Fetch weather (Sathupally lat/lon)
    let weatherData: any = null;
    try {
      const weatherRes = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=17.1&longitude=80.9&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=Asia%2FKolkata'
      );
      if (weatherRes.ok) weatherData = await weatherRes.json();
      log.push('weather fetched');
    } catch (_e) {
      log.push('weather fetch failed');
    }

    // Build HTML sections using helper functions
    const binsTableHtml     = buildBinsTable(activeBins);
    const intakesTableHtml  = buildIntakesTable(intakes);
    const dispTableHtml     = buildDispatchesTable(dispatches);
    const maintenanceHtml   = buildMaintenanceSection(maintenance);
    const weatherHtml       = buildWeatherSection(weatherData);
    const trendHtml         = build7DayTrendSection(intakes7, dispatches7, todayIST);
    const laborHtml         = buildLaborSection(laborLogs);

    const overdueAlert = overdueBins.length > 0
      ? '<div style="background:#FEF2F2;border:1px solid #FCA5A5;border-radius:8px;padding:12px;margin-bottom:16px;">' +
        '<strong style="color:#DC2626;">&#9888; ' + overdueBins.length + ' bin(s) overdue for drying</strong>' +
        '<p style="margin:4px 0 0;font-size:12px;color:#374151;">' +
        overdueBins.map((b: any) => 'Bin ' + (b.binLabel || b.id)).join(', ') +
        ' — in dryer &gt; 96 hours</p></div>'
      : '';

    const readyAlert = readyBins.length > 0
      ? '<div style="background:#F0FDF4;border:1px solid #6EE7B7;border-radius:8px;padding:12px;margin-bottom:16px;">' +
        '<strong style="color:#059669;">&#10003; ' + readyBins.length + ' bin(s) ready for dispatch</strong>' +
        '<p style="margin:4px 0 0;font-size:12px;color:#374151;">' +
        readyBins.map((b: any) => 'Bin ' + (b.binLabel || b.id)).join(', ') +
        ' — moisture &le; 10%</p></div>'
      : '';

    const section = (title: string, color: string, content: string) =>
      '<h2 style="font-size:14px;color:#333;border-bottom:2px solid ' + color + ';padding-bottom:6px;margin:20px 0 12px;">' + title + '</h2>' + content;

    const html = '<!DOCTYPE html>' +
      '<html><head><meta charset="UTF-8"><title>Yellina Seeds Daily Report</title></head>' +
      '<body style="font-family:sans-serif;max-width:640px;margin:0 auto;padding:20px;background:#F5F5F5;">' +

      '<div style="background:#0E2018;color:#fff;padding:24px;border-radius:12px 12px 0 0;text-align:center;">' +
      '<h1 style="margin:0;font-size:22px;">&#127807; Yellina Seeds</h1>' +
      '<p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">Daily Operations Report &mdash; ' + todayIST + '</p>' +
      '</div>' +

      '<div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">' +

      overdueAlert + readyAlert +

      section("Today's Summary", '#F5A623',
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:4px;">' +
        '<div style="background:#F0FDF4;padding:12px;border-radius:8px;text-align:center;">' +
        '<div style="font-size:24px;font-weight:800;color:#059669;">' + intakes.length + '</div>' +
        '<div style="font-size:11px;color:#6B7280;">Intakes</div>' +
        '<div style="font-size:11px;color:#059669;">' + Math.round(todayIntakeQty).toLocaleString() + ' kg</div></div>' +
        '<div style="background:#EFF6FF;padding:12px;border-radius:8px;text-align:center;">' +
        '<div style="font-size:24px;font-weight:800;color:#2563EB;">' + dispatches.length + '</div>' +
        '<div style="font-size:11px;color:#6B7280;">Dispatches</div>' +
        '<div style="font-size:11px;color:#2563EB;">' + Math.round(todayDispQty).toLocaleString() + ' kg</div></div>' +
        '<div style="background:#FFF7ED;padding:12px;border-radius:8px;text-align:center;">' +
        '<div style="font-size:24px;font-weight:800;color:#F59E0B;">' + activeBins.length + '</div>' +
        '<div style="font-size:11px;color:#6B7280;">Active Bins</div>' +
        '<div style="font-size:11px;color:#F59E0B;">' + Math.round(totalStockQty).toLocaleString() + ' kg</div></div>' +
        '<div style="background:#F5F3FF;padding:12px;border-radius:8px;text-align:center;">' +
        '<div style="font-size:24px;font-weight:800;color:#7C3AED;">' + maintenance.length + '</div>' +
        '<div style="font-size:11px;color:#6B7280;">Open Issues</div>' +
        '<div style="font-size:11px;color:#7C3AED;">maintenance</div></div>' +
        '</div>'
      ) +

      section('Weather — Sathupally', '#38BDF8', weatherHtml) +

      section('Active Dryer Bins (' + activeBins.length + ')', '#F5A623', binsTableHtml) +

      section("Today's Intakes (" + intakes.length + ')', '#059669', intakesTableHtml) +

      section("Today's Dispatches (" + dispatches.length + ')', '#2563EB', dispTableHtml) +

      section('7-Day Trend', '#8B5CF6', trendHtml) +

      section('Labor & Shifts', '#F59E0B', laborHtml) +

      section('Open Maintenance (' + maintenance.length + ')', '#DC2626', maintenanceHtml) +

      '<div style="margin-top:24px;padding-top:16px;border-top:1px solid #E5E7EB;text-align:center;">' +
      '<a href="https://www.yellinaseeds.com" style="background:#F5A623;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Open Platform</a>' +
      '<p style="font-size:11px;color:#9CA3AF;margin-top:12px;">Yellina Seeds Pvt. Ltd., Sathupally &middot; Automated daily report</p>' +
      '</div>' +

      '</div></body></html>';

    log.push('html built, length=' + html.length);

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ ok: true, log, message: 'RESEND_API_KEY not set', htmlLength: html.length }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    log.push('sending email via Resend');
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Yellina Seeds <onboarding@resend.dev>',
        to: [RECIPIENT],
        subject: 'Yellina Seeds Daily Report — ' + todayIST,
        html,
      }),
    });

    const result = await res.json();
    log.push('resend status: ' + res.status);
    return new Response(JSON.stringify({ ok: res.ok, result, log }), {
      status: res.ok ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err), log }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
