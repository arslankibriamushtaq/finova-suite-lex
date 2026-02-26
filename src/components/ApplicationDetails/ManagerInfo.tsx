import React, { useEffect, useState } from 'react';
import Loader from '../Loader/Loader';
import { getManagerInfoDetails } from '../../redux/apis/apisCrud';
import toast from 'react-hot-toast';
import { Switch } from 'antd';

interface ManagerInfoProps {
  applicationId: string | number;
  lang?: 'ar' | 'en';
}

type Primitive = string | number | boolean | null | undefined;

function isPrimitive(value: unknown): value is Primitive {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

// Arabic translations mapping for Manager Info
const arabicLabels: Record<string, string> = {
  'name': 'الاسم',
  'id': 'المعرف',
  'title': 'المسمى الوظيفي',
  'position': 'المنصب',
  'role': 'الدور',
  'email': 'البريد الإلكتروني',
  'phone': 'الهاتف',
  'mobile': 'الجوال',
  'nationality': 'الجنسية',
  'date of birth': 'تاريخ الميلاد',
  'birth date': 'تاريخ الميلاد',
  'identity number': 'رقم الهوية',
  'identity type': 'نوع الهوية',
  'gender': 'الجنس',
  'qualification': 'المؤهل',
  'experience': 'الخبرة',
  'department': 'القسم',
  'manager': 'المدير',
  'managers': 'المديرون',
  'date': 'التاريخ',
  'type': 'النوع',
  'status': 'الحالة',
  'address': 'العنوان',
  'city': 'المدينة',
  'country': 'الدولة',
  // Section titles
  'address info': 'معلومات العنوان',
  'address list': 'قائمة العناوين',
  'address info address list': 'معلومات العنوان قائمة العناوين',
  'client info': 'معلومات العميل',
  'product info': 'معلومات المنتج',
  // Address fields
  'log id': 'معرف السجل',
  'additional number': 'الرقم الإضافي',
  'building number': 'رقم المبنى',
  'district': 'الحي',
  'location coordinates': 'إحداثيات الموقع',
  'post code': 'الرمز البريدي',
  'street name': 'اسم الشارع',
  'unit number': 'رقم الوحدة',
  // ID fields
  'id expiry date h': 'تاريخ انتهاء الهوية (هجري)',
  'id expiry date g': 'تاريخ انتهاء الهوية (ميلادي)',
  'id issue date h': 'تاريخ إصدار الهوية (هجري)',
  'id issue date g': 'تاريخ إصدار الهوية (ميلادي)',
  'id issue place': 'مكان إصدار الهوية',
  'id version number': 'رقم إصدار الهوية',
  'occupation code': 'رمز المهنة',
  'place of birth': 'مكان الميلاد',
  // Application fields
  'product id': 'معرف المنتج',
  'partner company id': 'معرف شركة الشريك',
  'loan application id': 'معرف طلب القرض',
  // Client fields
  'first name': 'الاسم الأول',
  'father name': 'اسم الأب',
  'grand father name': 'اسم الجد',
  'family name': 'اسم العائلة',
  'date of birth g': 'تاريخ الميلاد (ميلادي)',
  'date of birth h': 'تاريخ الميلاد (هجري)',
};

// Field display order configuration
const sectionOrder = [
  'address info',
  'address info address list',
  'address list',
  'client info',
  'product info',
];

const addressInfoFieldOrder = [
  'city',
  'district',
  'post code',
  'street name',
  'unit number',
  'building number',
  'additional number',
  'location coordinates',
];

const clientInfoFieldOrder = [
  'first name',
  'father name',
  'grand father name',
  'family name',
  'log id',
  'gender',
  'id issue date h',
  'date of birth g',
  'date of birth h',
  'id expiry date h',
  'id issue date g',
  'id issue place',
  'place of birth',
  'id expiry date g',
  'occupation code',
  'id version number',
];

function normalizeFieldName(fieldName: string): string {
  return fieldName.toLowerCase().replace(/_+/g, ' ').trim();
}

function formatLabel(raw: string, isArabic: boolean = false): string {
  if (!raw) return '';
  const cleaned = raw.replace(/_+/g, ' ').replace(/\s*:\s*$/, '');
  
  if (isArabic) {
    const lowerKey = cleaned.toLowerCase();
    return arabicLabels[lowerKey] || cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  // Check if the label ends with a single letter (e.g., "date of birth h")
  const match = cleaned.match(/^(.+)\s([a-z])$/i);
  if (match) {
    const mainPart = match[1];
    const letter = match[2].toUpperCase();
    // Capitalize each word in the main part
    const formattedMain = mainPart
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    return `${formattedMain} (${letter})`;
  }
  
  // Default formatting
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function InfoRow({ label, value, isArabic = false }: { label: string; value: Primitive; isArabic?: boolean }) {
  return (
    <div className="info-row" style={{ 
      flexDirection: isArabic ? 'row-reverse' : 'row',
      direction: isArabic ? 'rtl' : 'ltr'
    }}>
      <div className="info-label" style={{ 
        textAlign: isArabic ? 'right' : 'left'
      }}>
        {formatLabel(label, isArabic)}
      </div>
      <div className="info-value" style={{ 
        textAlign: isArabic ? 'left' : 'right'
      }}>
        {String(value ?? '')}
      </div>
    </div>
  );
}

function SectionTitle({ title, isArabic = false }: { title: string; isArabic?: boolean }) {
  return (
    <div className="business-section-title">
      {formatLabel(title, isArabic)}
    </div>
  );
}

function renderObjectContent(obj: Record<string, any>, isArabic: boolean = false, isRoot: boolean = true, parentKey: string = ''): React.ReactNode {
  let entries = Object.entries(obj);
  
  // Sort sections at root level
  if (isRoot) {
    entries.sort(([keyA], [keyB]) => {
      const normalizedA = normalizeFieldName(keyA);
      const normalizedB = normalizeFieldName(keyB);
      
      const indexA = sectionOrder.indexOf(normalizedA);
      const indexB = sectionOrder.indexOf(normalizedB);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });
  }
  
  // Sort fields within Address Info section
  const normalizedParentKey = normalizeFieldName(parentKey);
  if (normalizedParentKey === 'address info' || normalizedParentKey === 'address list' || normalizedParentKey === 'address info address list') {
    entries.sort(([keyA], [keyB]) => {
      const normalizedA = normalizeFieldName(keyA);
      const normalizedB = normalizeFieldName(keyB);
      
      const indexA = addressInfoFieldOrder.indexOf(normalizedA);
      const indexB = addressInfoFieldOrder.indexOf(normalizedB);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });
  }
  
  // Sort fields within Client Info section
  if (normalizedParentKey === 'client info') {
    entries.sort(([keyA], [keyB]) => {
      const normalizedA = normalizeFieldName(keyA);
      const normalizedB = normalizeFieldName(keyB);
      
      const indexA = clientInfoFieldOrder.indexOf(normalizedA);
      const indexB = clientInfoFieldOrder.indexOf(normalizedB);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });
  }
  
  return (
    <div className="info-container">
      {entries.map(([key, val]) => {
        if (isPrimitive(val)) {
          return <InfoRow key={key} label={key} value={val} isArabic={isArabic} />;
        }
        if (Array.isArray(val)) {
          if (val.every(isPrimitive)) {
            return <InfoRow key={key} label={key} value={val.join(', ')} isArabic={isArabic} />;
          }
          return (
            <div key={key} className="info-subsection">
              <SectionTitle title={`${key}:`} isArabic={isArabic} />
              {val.map((item, idx) => (
                <div key={idx} className="info-subsection-item">{
                  isPrimitive(item)
                    ? <InfoRow label={`${key} ${idx + 1}`} value={item} isArabic={isArabic} />
                    : renderObjectContent(item as Record<string, any>, isArabic, false, key)
                }</div>
              ))}
            </div>
          );
        }
        return (
          <div key={key} className="info-subsection">
            <SectionTitle title={`${key}:`} isArabic={isArabic} />
            {renderObjectContent(val as Record<string, any>, isArabic, false, key)}
          </div>
        );
      })}
    </div>
  );
}

const ManagerInfo: React.FC<ManagerInfoProps> = ({ applicationId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [isArabic, setIsArabic] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const language = isArabic ? "ar" : "en";
      const res = await getManagerInfoDetails(applicationId, language);
      if (res?.data?.success) {
        const payload = (res?.data?.data ?? res?.data) as Record<string, any>;
        setData(payload || {});
      } else {
        toast.error(res?.data?.message || 'Failed to load manager info');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load manager info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isArabic]);

  if (loading) return <Loader/>;
  if (error) return <div style={{ color: 'crimson' }}>{error}</div>;
  if (!data) return <div>No data found</div>;

  // Filter out unnecessary fields from manager info
  const fieldsToExclude = ['id', 'type', 'product_id', 'partner_company_id', 'loan_application_id'];
  const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
    if (!fieldsToExclude.includes(key.toLowerCase().replace(/\s+/g, '_'))) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);

  return (
    <>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        marginBottom: '16px',
        gap: '8px'
      }}>
        <Switch 
          className="red-switch"
          checked={isArabic} 
          onChange={setIsArabic}
        />
        <span style={{ fontSize: '14px', color: '#666' }}>Arabic</span>
      </div>
      {renderObjectContent(filteredData, isArabic)}
    </>
  );
};

export default ManagerInfo;


