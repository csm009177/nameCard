import { supabase } from '../../lib/supabase';

export interface CardData {
  companyName: string;
  companySubtitle: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  address: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
}

/** 명함 데이터를 Supabase에 저장하고 생성된 id를 반환합니다. */
export async function saveCard(data: CardData): Promise<string> {
  const id = Date.now().toString();
  const { error } = await supabase
    .from('cards')
    .insert({ id, data });

  if (error) throw new Error(error.message);
  return id;
}

/** id로 명함 데이터를 Supabase에서 조회합니다. */
export async function fetchCard(id: string): Promise<CardData | null> {
  const { data, error } = await supabase
    .from('cards')
    .select('data')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data.data as CardData;
}
