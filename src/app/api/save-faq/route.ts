import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { data, error } = await supabase.from('op_retreat_faqs').select('*').order('order_num', { ascending: true });
    if (error) throw error;
    // Format to match the previous frontend structure
    const formattedFaqs = data.map(row => ({
      id: row.id,
      order: row.order_num,
      question_es: row.question_es || '',
      answer_es: row.answer_es || '',
      question_en: row.question_en || '',
      answer_en: row.answer_en || ''
    }));
    return NextResponse.json({ faqs: formattedFaqs });
  } catch (error) {
    console.error('Fetch FAQ error:', error);
    return NextResponse.json({ faqs: [] });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminPassword = process.env.ADMIN_PASSWORD || '';
    const expectedToken = Buffer.from(`${adminPassword}-opretreat-secure-token`).toString('base64');
    const cookieValue = cookieStore.get('admin_session')?.value;

    if (!cookieValue || cookieValue !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { faqs } = await request.json();

    if (!Array.isArray(faqs)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // 1. Delete removed FAQs
    const { data: currentData } = await supabase.from('op_retreat_faqs').select('id');
    const currentIds = currentData?.map(row => row.id) || [];
    const newIds = faqs.map(f => f.id).filter(id => !id.startsWith('faq-')); // Exclude temporary frontend IDs
    const idsToDelete = currentIds.filter(id => !newIds.includes(id));

    if (idsToDelete.length > 0) {
      await supabase.from('op_retreat_faqs').delete().in('id', idsToDelete);
    }

    // 2. Upsert (Update existing, Insert new)
    if (faqs.length > 0) {
      const upsertPayload = faqs.map((f, index) => {
        const isNew = f.id.startsWith('faq-');
        return {
          ...(isNew ? {} : { id: f.id }), // Let Supabase generate UUID for new items
          order_num: f.order || index,
          question_es: f.question_es,
          answer_es: f.answer_es,
          question_en: f.question_en,
          answer_en: f.answer_en
        };
      });

      const { error } = await supabase.from('op_retreat_faqs').upsert(upsertPayload);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save FAQ error:', error);
    return NextResponse.json({ error: 'Failed to save FAQ' }, { status: 500 });
  }
}
