import { supabase } from './supabase';
import { Application, Package, ContactMessage, SiteSettings, ActivityLog } from '../types';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'superadmin' | 'editor';
}

export const SupabaseService = {
  // ==========================================
  // AUTH & ROLES
  // ==========================================
  async signIn(email: string, password: string):Promise<{ data: any; error: string | null; role?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        return { data: null, error: error.message };
      }

      if (!data.user) {
        return { data: null, error: 'Kullanıcı bulunamadı.' };
      }

      // Check user role strictly in public.profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile || !['admin', 'superadmin', 'editor'].includes(profile.role)) {
        await supabase.auth.signOut();
        return { data: null, error: 'Giriş reddedildi: Bu hesabın yönetici yetkisi (admin rolü) bulunmuyor.' };
      }

      return { data, error: null, role: profile.role };
    } catch (err: any) {
      return { data: null, error: err.message || 'Giriş yapılırken bir hata oluştu.' };
    }
  },

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch {
      return null;
    }
  },

  async getCurrentProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) return profile as UserProfile;

      return {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || 'Admin',
        role: 'admin'
      };
    } catch {
      return null;
    }
  },

  // ==========================================
  // SITE SETTINGS
  // ==========================================
  async getSettings(): Promise<SiteSettings | null> {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'general')
        .single();

      if (error || !data) return null;

      const t = data.theme || {};
      return {
        companyName: data.company_name ?? t.companyName ?? '',
        officialPartner: data.official_partner ?? t.officialPartner ?? '',
        phone: data.phone ?? t.phone ?? '',
        phoneDisplay: data.phone_display ?? t.phoneDisplay ?? '',
        whatsapp: data.whatsapp ?? t.whatsapp ?? '',
        email: data.email ?? t.email ?? '',
        address: data.address ?? t.address ?? '',
        addressDetail: data.address_detail ?? t.addressDetail ?? '',
        district: data.district ?? t.district ?? '',
        city: data.city ?? t.city ?? '',
        workingHours: data.working_hours ?? t.workingHours ?? '',
        workingDays: data.working_days ?? t.workingDays ?? '',
        mapLocationQuery: data.map_location_query ?? t.mapLocationQuery ?? '39.969709, 32.744914',
        mapEmbedUrl: data.map_embed_url ?? t.mapEmbedUrl ?? '',
        heroBadge: data.hero_badge ?? t.heroBadge ?? '',
        heroTitle: data.hero_title ?? t.heroTitle ?? '',
        heroSubtitle: data.hero_subtitle ?? t.heroSubtitle ?? '',
        heroButtonText: data.hero_button_text ?? t.heroButtonText ?? '',
        heroSecondaryButtonText: data.hero_secondary_button_text ?? t.heroSecondaryButtonText ?? '',
        announcementText: data.announcement_text ?? t.announcementText ?? '',
        announcementActive: data.announcement_active ?? t.announcementActive ?? true,
        minDeliveryTime: data.min_delivery_time ?? t.minDeliveryTime ?? '15 Dakika',
        headerTagline: data.header_tagline ?? t.headerTagline ?? '',
        headerShowTrack: data.header_show_track ?? t.headerShowTrack ?? true,
        headerShowApply: data.header_show_apply ?? t.headerShowApply ?? true,
        quickFormTitle: data.quick_form_title ?? t.quickFormTitle ?? '',
        quickFormSubtitle: data.quick_form_subtitle ?? t.quickFormSubtitle ?? '',
        quickFormBadge: data.quick_form_badge ?? t.quickFormBadge ?? '',
        quickFormCardTitle: data.quick_form_card_title ?? t.quickFormCardTitle ?? '',
        quickFormCardSubtitle: data.quick_form_card_subtitle ?? t.quickFormCardSubtitle ?? '',
        aboutTitle: data.about_title ?? t.aboutTitle ?? '',
        aboutP1: data.about_p1 ?? t.aboutP1 ?? '',
        aboutP2: data.about_p2 ?? t.aboutP2 ?? '',
        aboutP3: data.about_p3 ?? t.aboutP3 ?? '',
        faqTitle: data.faq_title ?? t.faqTitle ?? '',
        faqSubtitle: data.faq_subtitle ?? t.faqSubtitle ?? '',
        faqs: data.faqs ?? t.faqs ?? [],
        footerAbout: data.footer_about ?? t.footerAbout ?? '',
        copyrightText: data.copyright_text ?? t.copyrightText ?? '',
        sections: data.sections ?? t.sections ?? {},
        theme: t.theme || t,
        deliveryOptions: data.delivery_options ?? t.deliveryOptions ?? undefined
      };
    } catch (err) {
      console.error('getSettings error:', err);
      return null;
    }
  },

  async updateSettings(settings: SiteSettings): Promise<boolean> {
    try {
      // 1. Fetch current database record structure to know valid columns
      const { data: existingData } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'general')
        .single();

      const validColumns = existingData ? Object.keys(existingData) : [];

      // 2. Put entire settings & all custom fields in theme JSONB
      const themePayload = {
        ...(settings.theme || {}),
        ...settings,
        theme: settings.theme
      };

      // 3. Candidate full column map
      const candidatePayload: Record<string, any> = {
        id: 'general',
        company_name: settings.companyName,
        official_partner: settings.officialPartner,
        phone: settings.phone,
        phone_display: settings.phoneDisplay,
        whatsapp: settings.whatsapp,
        email: settings.email,
        address: settings.address,
        address_detail: settings.addressDetail,
        district: settings.district,
        city: settings.city,
        working_hours: settings.workingHours,
        working_days: settings.workingDays,
        hero_badge: settings.heroBadge,
        hero_title: settings.heroTitle,
        hero_subtitle: settings.heroSubtitle,
        hero_button_text: settings.heroButtonText,
        hero_secondary_button_text: settings.heroSecondaryButtonText,
        announcement_text: settings.announcementText,
        announcement_active: settings.announcementActive,
        min_delivery_time: settings.minDeliveryTime,
        header_tagline: settings.headerTagline,
        header_show_track: settings.headerShowTrack,
        header_show_apply: settings.headerShowApply,
        quick_form_title: settings.quickFormTitle,
        quick_form_subtitle: settings.quickFormSubtitle,
        quick_form_badge: settings.quickFormBadge,
        quick_form_card_title: settings.quickFormCardTitle,
        quick_form_card_subtitle: settings.quickFormCardSubtitle,
        about_title: settings.aboutTitle,
        about_p1: settings.aboutP1,
        about_p2: settings.aboutP2,
        about_p3: settings.aboutP3,
        faq_title: settings.faqTitle,
        faq_subtitle: settings.faqSubtitle,
        faqs: settings.faqs,
        footer_about: settings.footerAbout,
        copyright_text: settings.copyrightText,
        sections: settings.sections,
        theme: themePayload,
        updated_at: new Date().toISOString()
      };

      // 4. Dynamically filter payload so ONLY columns that physically exist in the table are sent
      const safePayload: Record<string, any> = { id: 'general' };
      if (validColumns.length > 0) {
        for (const key of Object.keys(candidatePayload)) {
          if (validColumns.includes(key)) {
            safePayload[key] = candidatePayload[key];
          }
        }
        if (validColumns.includes('theme')) {
          safePayload.theme = themePayload;
        }
      } else {
        Object.assign(safePayload, candidatePayload);
      }

      const { error } = await supabase
        .from('site_settings')
        .upsert(safePayload);

      if (error) {
        console.error('updateSettings error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('updateSettings exception:', err);
      return false;
    }
  },


  // ==========================================
  // PACKAGES
  // ==========================================
  async getPackages(): Promise<Package[] | null> {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error || !data || data.length === 0) return null;

      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        duration: p.duration,
        price: Number(p.price),
        originalPrice: p.original_price ? Number(p.original_price) : undefined,
        category: p.category || 'bireysel',
        popular: Boolean(p.popular),
        badge: p.badge || undefined,
        description: p.description,
        features: Array.isArray(p.features) ? p.features : []
      }));
    } catch (err) {
      console.error('getPackages error:', err);
      return null;
    }
  },

  async updatePackage(pkg: Package): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('packages')
        .upsert({
          id: pkg.id,
          name: pkg.name,
          duration: pkg.duration,
          price: pkg.price,
          original_price: pkg.originalPrice,
          category: pkg.category,
          popular: pkg.popular,
          badge: pkg.badge,
          description: pkg.description,
          features: pkg.features,
          updated_at: new Date().toISOString()
        });

      return !error;
    } catch {
      return false;
    }
  },

  // ==========================================
  // APPLICATIONS
  // ==========================================
  async getApplications(): Promise<Application[] | null> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      return data.map((a: any) => ({
        id: a.id,
        trackingCode: a.tracking_code,
        fullName: a.full_name,
        tcVkn: a.tc_vkn,
        phone: a.phone,
        email: a.email || '',
        isCorporate: Boolean(a.is_corporate),
        companyName: a.company_name || undefined,
        taxOffice: a.tax_office || undefined,
        packageId: a.package_id,
        packageName: a.package_name,
        duration: a.duration,
        price: Number(a.price),
        deliveryType: a.delivery_type,
        address: a.address,
        city: a.city,
        district: a.district,
        notes: a.notes || undefined,
        adminNotes: a.admin_notes || undefined,
        status: a.status,
        createdAt: a.created_at,
        updatedAt: a.updated_at
      }));
    } catch (err) {
      console.error('getApplications error:', err);
      return null;
    }
  },

  async addApplication(appData: Omit<Application, 'id' | 'trackingCode' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Application | null> {
    try {
      const randomCode = 'EDF-' + Math.floor(10000 + Math.random() * 90000);
      
      const { data, error } = await supabase
        .from('applications')
        .insert({
          tracking_code: randomCode,
          full_name: appData.fullName,
          tc_vkn: appData.tcVkn,
          phone: appData.phone,
          email: appData.email || null,
          is_corporate: appData.isCorporate,
          company_name: appData.companyName || null,
          tax_office: appData.taxOffice || null,
          package_id: appData.packageId,
          package_name: appData.packageName,
          duration: appData.duration,
          price: appData.price,
          delivery_type: appData.deliveryType,
          address: appData.address || 'Adres belirtilmedi',
          city: appData.city || 'ANKARA',
          district: appData.district || '',
          notes: appData.notes || null,
          status: 'yeni'
        })
        .select()
        .single();

      if (error || !data) {
        console.error('addApplication error:', error);
        return null;
      }

      return {
        id: data.id,
        trackingCode: data.tracking_code,
        fullName: data.full_name,
        tcVkn: data.tc_vkn,
        phone: data.phone,
        email: data.email || '',
        isCorporate: Boolean(data.is_corporate),
        companyName: data.company_name,
        taxOffice: data.tax_office,
        packageId: data.package_id,
        packageName: data.package_name,
        duration: data.duration,
        price: Number(data.price),
        deliveryType: data.delivery_type,
        address: data.address,
        city: data.city,
        district: data.district,
        notes: data.notes,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (err) {
      console.error('addApplication exception:', err);
      return null;
    }
  },

  async getApplicationByTrackingCode(trackingCode: string): Promise<Application | null> {
    try {
      const cleanCode = trackingCode.trim().toUpperCase();
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .ilike('tracking_code', cleanCode)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        trackingCode: data.tracking_code,
        fullName: data.full_name,
        tcVkn: data.tc_vkn,
        phone: data.phone,
        email: data.email || '',
        isCorporate: Boolean(data.is_corporate),
        companyName: data.company_name,
        taxOffice: data.tax_office,
        packageId: data.package_id,
        packageName: data.package_name,
        duration: data.duration,
        price: Number(data.price),
        deliveryType: data.delivery_type,
        address: data.address,
        city: data.city,
        district: data.district,
        notes: data.notes,
        adminNotes: data.admin_notes,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch {
      return null;
    }
  },

  async updateApplicationStatus(id: string, status: Application['status'], adminNotes?: string): Promise<boolean> {
    try {
      const updatePayload: any = {
        status,
        updated_at: new Date().toISOString()
      };
      if (adminNotes !== undefined) {
        updatePayload.admin_notes = adminNotes;
      }

      const { error } = await supabase
        .from('applications')
        .update(updatePayload)
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  },

  async deleteApplication(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  },

  // ==========================================
  // CONTACT MESSAGES
  // ==========================================
  async getMessages(): Promise<ContactMessage[] | null> {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      return data.map((m: any) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        subject: m.subject,
        message: m.message,
        read: Boolean(m.read),
        createdAt: m.created_at
      }));
    } catch (err) {
      console.error('getMessages error:', err);
      return null;
    }
  },

  async addMessage(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>): Promise<ContactMessage | null> {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert({
          name: msg.name,
          email: msg.email,
          phone: msg.phone,
          subject: msg.subject,
          message: msg.message,
          read: false
        })
        .select()
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        read: false,
        createdAt: data.created_at
      };
    } catch {
      return null;
    }
  },

  async markMessageAsRead(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ read: true })
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  },

  async deleteMessage(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  },

  // ==========================================
  // ACTIVITY LOGS
  // ==========================================
  async getLogs(): Promise<ActivityLog[] | null> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !data) return null;

      return data.map((l: any) => ({
        id: l.id,
        action: l.action,
        details: l.details,
        timestamp: l.created_at,
        user: l.user_email
      }));
    } catch {
      return null;
    }
  },

  async addLog(action: string, details: string, userEmail?: string): Promise<void> {
    try {
      let email = userEmail;
      if (!email) {
        const { data: { user } } = await supabase.auth.getUser();
        email = user?.email || 'admin@edijitalfinans.com';
      }

      await supabase
        .from('activity_logs')
        .insert({
          action,
          details,
          user_email: email
        });
    } catch {
      // ignore
    }
  }
};
