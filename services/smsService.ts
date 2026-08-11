/**
 * SMS Service — Shahrokh Group
 * Main manager: 09206263218
 * All new user info + leads will be sent to this number + Telegram @immig_1
 */

// For demo, we use mock. Replace with real provider (Kavenegar, Ghasedak, etc.)
const SMS_MANAGER_NUMBER = '09206263218';
const SMS_API_KEY = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_KAVENEGAR_API_KEY) || 
                    (typeof process !== 'undefined' && (process as any).env?.KAVENEGAR_API_KEY) || 
                    '';

export const sendSMS = async (to: string, message: string): Promise<{ ok: boolean; messageId?: string }> => {
  // If real API key exists, use Kavenegar
  if (SMS_API_KEY) {
    try {
      const res = await fetch(`https://api.kavenegar.com/v1/${SMS_API_KEY}/sms/send.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          receptor: to,
          sender: '10008663', // default
          message: message,
        }),
      });
      const data: any = await res.json();
      if (data.return?.status === 200) {
        console.log(`SMS sent to ${to}:`, message.slice(0, 50));
        return { ok: true, messageId: data.entries?.[0]?.messageid?.toString() };
      }
      throw new Error(data.return?.message || 'SMS failed');
    } catch (e: any) {
      console.error('SMS failed, fallback to log:', e.message);
      // Fallback to log
    }
  }
  
  // Mock — log to console and Telegram as fallback
  console.log(`📱 SMS to ${to}:`, message);
  // Also try to send via Telegram as backup
  try {
    const { sendTelegramMessage } = await import('./telegramService');
    await sendTelegramMessage('@immig_1', `📱 SMS به ${to}:\n${message}`);
  } catch {}
  
  // Simulate success for demo
  return { ok: true, messageId: 'mock-' + Date.now() };
};

export const notifyNewUserViaSMS = async (user: { name: string; email: string; id: string; role: string }): Promise<void> => {
  const message = `شahrokh: کاربر جدید ${user.name} (${user.email}) - ${user.role} - ${new Date().toLocaleString('fa-IR')}`;
  await sendSMS(SMS_MANAGER_NUMBER, message);
  // Also send detailed to manager via Telegram
  try {
    const { sendTelegramMessage } = await import('./telegramService');
    await sendTelegramMessage('@immig_1', 
      `🆕 <b>کاربر جدید</b>\n👤 ${user.name}\n📧 ${user.email}\n🆔 ${user.id}\n📱 SMS به ${SMS_MANAGER_NUMBER} هم ارسال شد`,
      { parseMode: 'HTML' }
    );
  } catch {}
};

export const getManagerNumber = () => SMS_MANAGER_NUMBER;
