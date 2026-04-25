import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const ADMIN_ID = '321bcceb-f1c5-497b-938c-83f321b2a60a'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Read check intervals from admin profile
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('check_interval_minutes, down_check_interval_minutes')
    .eq('id', ADMIN_ID)
    .single()

  const normalInterval = adminProfile?.check_interval_minutes ?? 30
  const downInterval = adminProfile?.down_check_interval_minutes ?? 5

  // Get all company profiles with a monitor URL set
  const { data: companies } = await supabase
    .from('profiles')
    .select('id, display_name, username, monitor_url, monitor_status, monitor_last_checked')
    .eq('is_company', true)
    .not('monitor_url', 'is', null)

  if (!companies || companies.length === 0) {
    return NextResponse.json({ checked: 0 })
  }

  const now = new Date()
  let checked = 0

  for (const company of companies) {
    const interval = company.monitor_status === 'down' ? downInterval : normalInterval
    const lastChecked = company.monitor_last_checked ? new Date(company.monitor_last_checked) : null
    const minutesSinceCheck = lastChecked ? (now.getTime() - lastChecked.getTime()) / 60000 : Infinity

    if (minutesSinceCheck < interval) continue

    checked++

    // Ping the monitor URL with a 10 second timeout
    let isUp = false
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const res = await fetch(company.monitor_url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Relay-Monitor/1.0' },
      })
      clearTimeout(timeout)
      isUp = res.ok
    } catch {
      isUp = false
    }

    const newStatus = isUp ? 'up' : 'down'
    const prevStatus = company.monitor_status

    // Post on transition from known state: up→down or down→up
    if (prevStatus === 'up' && newStatus === 'down') {
      const name = company.display_name || company.username
      await supabase.from('posts').insert({
        author_id: company.id,
        content: `💀🤯 ${name} site down.`,
      })
    } else if (prevStatus === 'down' && newStatus === 'up') {
      const name = company.display_name || company.username
      await supabase.from('posts').insert({
        author_id: company.id,
        content: `✅ ${name} is back online.`,
      })
    }

    await supabase
      .from('profiles')
      .update({ monitor_status: newStatus, monitor_last_checked: now.toISOString() })
      .eq('id', company.id)
  }

  return NextResponse.json({ checked })
}
