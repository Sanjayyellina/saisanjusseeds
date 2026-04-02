# daily-report Edge Function

Sends a daily operations summary email at 6:00 AM IST.

## Setup
1. Deploy: `supabase functions deploy daily-report`
2. Set secrets in Supabase dashboard → Edge Functions → Secrets:
   - RESEND_API_KEY: Get free key from resend.com
   - REPORT_RECIPIENT_EMAIL: e.g. sanjay@yellinaseeds.com
3. Add cron in Supabase dashboard → Database → Cron Jobs:
   - Name: daily-report
   - Schedule: 30 0 * * * (runs at 00:30 UTC = 06:00 AM IST)
   - Command: SELECT net.http_post('https://your-project.supabase.co/functions/v1/daily-report', '{}', 'application/json');
