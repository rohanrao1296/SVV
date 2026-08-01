import type { SystemSettings, NotificationLog, DeliveryStatus } from '../types';

/**
 * Utility to replace template variables:
 * {studentName}, {className}, {status}, {date}, {schoolName}
 */
export function formatTemplate(
  template: string,
  vars: {
    studentName: string;
    className: string;
    status: string;
    date: string;
    schoolName: string;
  }
): string {
  return template
    .replace(/{studentName}/g, vars.studentName)
    .replace(/{className}/g, vars.className)
    .replace(/{status}/g, vars.status)
    .replace(/{date}/g, vars.date)
    .replace(/{schoolName}/g, vars.schoolName);
}

/**
 * Simulates sending an SMS notification.
 */
export async function sendSMSNotification(
  studentName: string,
  className: string,
  status: string,
  parentPhone: string,
  date: string,
  settings: SystemSettings
): Promise<NotificationLog> {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const schoolName = settings.schoolName || 'Savitri Vidya Vihar';
  const rawTemplate = settings.smsTemplate || 
    'Dear Parent, Your child {studentName} ({className}) was marked {status} today ({date}). If incorrect, please contact the school. Regards, {schoolName}';
  
  const content = formatTemplate(rawTemplate, {
    studentName,
    className,
    status: status.toUpperCase(),
    date,
    schoolName
  });

  const successRate = 0.95; // 95% success simulation
  const isSuccess = Math.random() < successRate;
  const deliveryStatus: DeliveryStatus = isSuccess ? 'Delivered' : 'Failed';
  const provider = settings.smsProvider || 'msg91';

  return {
    id: `sms_${Math.random().toString(36).substr(2, 9)}`,
    studentName,
    recipientPhone: parentPhone,
    channel: 'SMS',
    type: status === 'Absent' ? 'Absent' : status === 'Late' ? 'Late' : 'Leave',
    content,
    status: deliveryStatus,
    provider,
    timestamp: new Date().toISOString(),
    error: isSuccess ? undefined : 'Carrier network temporary failure'
  };
}

/**
 * Simulates sending a WhatsApp notification.
 */
export async function sendWhatsAppNotification(
  studentName: string,
  className: string,
  status: string,
  parentPhone: string,
  date: string,
  settings: SystemSettings
): Promise<NotificationLog> {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const schoolName = settings.schoolName || 'Savitri Vidya Vihar';
  const rawTemplate = settings.whatsappTemplate || 
    '🏫 *{schoolName}*\n\n*Attendance Alert*\n\n*Student:* {studentName}\n*Class:* {className}\n*Status:* ❌ {status}\n*Date:* {date}\n\nPlease contact the school if required.\n\nThank you.';

  const content = formatTemplate(rawTemplate, {
    studentName,
    className,
    status: status === 'Absent' ? 'Absent' : status === 'Late' ? 'Late (Late Arrival)' : status,
    date,
    schoolName
  });

  const successRate = 0.97; // 97% success simulation
  const isSuccess = Math.random() < successRate;
  const deliveryStatus: DeliveryStatus = isSuccess ? 'Delivered' : 'Failed';
  const provider = settings.whatsappProvider || 'meta';

  return {
    id: `wa_${Math.random().toString(36).substr(2, 9)}`,
    studentName,
    recipientPhone: parentPhone,
    channel: 'WhatsApp',
    type: status === 'Absent' ? 'Absent' : status === 'Late' ? 'Late' : 'Leave',
    content,
    status: deliveryStatus,
    provider,
    timestamp: new Date().toISOString(),
    error: isSuccess ? undefined : 'Meta Cloud API Rate limit exceeded or invalid recipient number'
  };
}

/**
 * Simulates sending push notification or general notification broadcast.
 */
export async function sendPushNotification(
  title: string,
  body: string,
  targetRole: 'all' | 'teachers' | 'students'
): Promise<{ success: boolean; id: string }> {
  console.log(`[Push Notification] Dispatched to role: ${targetRole}. Title: ${title}. Body: ${body}`);
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    success: true,
    id: `push_${Math.random().toString(36).substr(2, 9)}`
  };
}
