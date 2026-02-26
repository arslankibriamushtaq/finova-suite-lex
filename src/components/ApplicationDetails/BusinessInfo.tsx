import React, {useState, useEffect} from 'react';
import Loader from '../Loader/Loader';
import { getBusinessInfoDetails } from '../../redux/apis/apisCrud';
import toast from 'react-hot-toast';
import { Switch } from 'antd';

interface BusinessInfoProps {
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

// Arabic translations mapping
const arabicLabels: Record<string, string> = {
  // Common fields
  'cr name': 'اسم السجل التجاري',
  'cr number': 'رقم السجل التجاري',
  'issue date': 'تاريخ الإصدار',
  'expiry date': 'تاريخ انتهاء الصلاحية',
  'name': 'الاسم',
  'id': 'المعرف',
  'code': 'الرمز',
  'type': 'النوع',
  'status': 'الحالة',
  'address': 'العنوان',
  'phone': 'الهاتف',
  'email': 'البريد الإلكتروني',
  'company name': 'اسم الشركة',
  'business name': 'الاسم التجاري',
  'legal form': 'الشكل القانوني',
  'activities': 'الأنشطة',
  'activity': 'النشاط',
  'isic': 'التصنيف الصناعي الدولي',
  'registration date': 'تاريخ التسجيل',
  'capital': 'رأس المال',
  'location': 'الموقع',
  'city': 'المدينة',
  'district': 'الحي',
  'street': 'الشارع',
  'building number': 'رقم المبنى',
  'postal code': 'الرمز البريدي',
  'additional number': 'الرقم الإضافي',
  'unit number': 'رقم الوحدة',
  'owner': 'المالك',
  'manager': 'المدير',
  'description': 'الوصف',
  'size': 'الحجم',
  'employees': 'الموظفون',
  'year': 'السنة',
  'date': 'التاريخ',
  'amount': 'المبلغ',
  'value': 'القيمة',
  'number': 'الرقم',
  'reference': 'المرجع',
  'document': 'المستند',
  'category': 'الفئة',
  'subcategory': 'الفئة الفرعية',
  'branch': 'الفرع',
  'branches': 'الفروع',
  'license': 'الترخيص',
  'license number': 'رقم الترخيص',
  'partners': 'الشركاء',
  'partner': 'الشريك',
  'nationality': 'الجنسية',
  'entity type': 'نوع الكيان',
  'fiscal year': 'السنة المالية',
  'vat number': 'الرقم الضريبي',
  'tax number': 'رقم الضريبة',
  'contact': 'جهة الاتصال',
  'website': 'الموقع الإلكتروني',
  'fax': 'الفاكس',
  'mobile': 'الجوال',
  'region': 'المنطقة',
  'country': 'الدولة',
  'established': 'تاريخ التأسيس',
  'age': 'العمر',
  'sector': 'القطاع',
  'industry': 'الصناعة',
  'purpose': 'الغرض',
  'objective': 'الهدف',
  'main activity': 'النشاط الرئيسي',
  'secondary activity': 'النشاط الثانوي',
  'unified national number': 'الرقم الوطني الموحد',
  'end date': 'تاريخ الانتهاء',
  'start date': 'تاريخ البدء',
  'period': 'الفترة',
  'type id': 'معرف النوع',
  'website link': 'رابط الموقع',
  'zip code': 'الرمز البريدي',
  'street name': 'اسم الشارع',
  'postal box 2': 'صندوق البريد 2',
  'postal box 1': 'صندوق البريد 1',
  'telephone 2': 'هاتف 2',
  'telephone 1': 'هاتف 1',
  'fax 2': 'فاكس 2',
  'fax 1': 'فاكس 1',
  'reason': 'السبب',
  'day': 'اليوم',
  'month': 'الشهر',
  'gross': 'إجمالي',
  'shares count': 'عدد الأسهم',
  'birth date': 'تاريخ الميلاد',
  'share price': 'سعر السهم',
  'isecommerce': 'التجارة الإلكترونية',
  'announced amount': 'المبلغ المعلن',
  'subscribed amount': 'المبلغ المكتتب',
  'paid amount': 'المبلغ المدفوع',
  // Section titles
  'company': 'الشركة',
  'urls': 'الروابط',
  /* 'url': 'الرابط',
  'url 1': 'الرابط 1', */
  'calendar type': 'نوع التقويم',
  'status of cr': 'حالة السجل التجاري',
  'cancellation': 'الإلغاء',
  'address general': 'العنوان العام',
  'address national': 'العنوان الوطني',
  'business type': 'نوع العمل',
  'relation': 'العلاقة',
  'capital share': 'حصة رأس المال',
  'parties': 'الأطراف',
  'identity': 'الهوية',
  'party1': 'الطرف 1',
  'party1 identity': 'هوية الطرف 1',
  'party1 relation': 'علاقة الطرف 1',
  'party1 nationality': 'جنسية الطرف 1',
  'address national district': 'حي العنوان الوطني',
  'activities isic 1': 'التصنيف الصناعي الدولي للأنشطة 1',
  'fiscal year calendar type': 'نوع تقويم السنة المالية',
};

// Field display order configuration
const fieldOrder = [
  'cr name',
  'cr number',
  'issue date',
  'expiry date',
  'isecommerce',
  'unified national number',
  'urls',
  'status of cr',
  'address general',
  'fax 1',
  'fax 2',
  'email',
  'address',
  'website',
  'postal box 1',
  'postal box 2',
  'telephone 1',
  'telephone 2',
  'address national',
  'city',
  'zipcode',
  'zip code',
  'street name',
  'unit number',
  'building number',
  'additional number',
  'district',
  'capital',
  'capital share',
  'company',
  'party1',
  'party1 identity',
  'party1 relation',
  'party1 nationality',
  'location',
  'activities',
  'activities isic 1',
  'fiscal year',
  'calendar',
  'business type',
  'cancellation',
];

// Field name mappings (API field -> Display field)
const fieldMappings: Record<string, string> = {
  'Urls': 'url 1',
  'district': 'address national district',
  //'party': 'party1',
  'parties': 'party1',
  'identity': 'party1 identity',
  'relation': 'party1 relation',
  'nationality': 'party1 nationality',
  'isic': 'activities isic 1',
  'calendar': 'fiscal year calendar type',
  'calendar type': 'fiscal year calendar type',
};

function normalizeFieldName(fieldName: string): string {
  const normalized = fieldName.toLowerCase().replace(/_+/g, ' ').trim();
  return fieldMappings[normalized] || normalized;
}

/** Convert string to title case */
const toTitleCase = (str: string) => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

function formatLabel(raw: string, isArabic: boolean = false): string {
  if (!raw) return '';
  const cleaned = raw.replace(/_+/g, ' ').replace(/\s*:\s*$/, '');
  
  if (isArabic) {
    const lowerKey = cleaned.toLowerCase();
    return arabicLabels[lowerKey] || toTitleCase(cleaned);
  }
  
  // Check if the label ends with a single letter (e.g., "date of birth h")
  const match = cleaned.match(/^(.+)\s([a-z])$/i);
  if (match) {
    const mainPart = match[1];
    const letter = match[2].toUpperCase();
    // Apply title case to the main part
    const formattedMain = toTitleCase(mainPart);
    return `${formattedMain} (${letter})`;
  }
  
  // Apply title case to all English labels
  return toTitleCase(cleaned);
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

function renderIsicSection(isic: any, isArabic: boolean = false): React.ReactNode {
  const items = Array.isArray(isic?.Id) ? isic.Id : [];
  return (
    <>
      <SectionTitle title="Activities ISIC 1" isArabic={isArabic} />
      <div className="info-container">
        {items.map((item: any, idx: number) => (
          <React.Fragment key={idx}>
            {isPrimitive(item?.Id) && <InfoRow label="Id" value={item.Id} isArabic={isArabic} />}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

function renderObjectContent(obj: Record<string, any>, isArabic: boolean = false, isRoot: boolean = true): React.ReactNode {
  let processedObj = { ...obj };
  
  // For Cancellation section, only show Date and Reason if they exist
  /* if (isRoot && processedObj.Cancellation && typeof processedObj.Cancellation === 'object') {
    const cancellationObj = processedObj.Cancellation;
    const { Date, Reason } = cancellationObj;
    
    // Only keep Date and Reason in Cancellation if they exist
    if (Date !== undefined || Reason !== undefined) {
      processedObj.Cancellation = {};
      if (Date !== undefined) processedObj.Cancellation.Date = Date;
      if (Reason !== undefined) processedObj.Cancellation.Reason = Reason;
    } else {
      // If no Date or Reason, remove Cancellation section
      delete processedObj.Cancellation;
    }
  } */
  
  // Extract ISIC from Activities to display as separate section
  if (isRoot && processedObj.Activities && typeof processedObj.Activities === 'object') {
    const activitiesObj = processedObj.Activities;
    const { ISIC, ...otherFields } = activitiesObj;
    
    // Keep other fields in Activities
    processedObj.Activities = otherFields;
    
    // Add ISIC as a separate root-level entry if it exists
    if (ISIC) {
      processedObj.ISIC = ISIC;
    }
  }
  
  // Restructure Parties array to flatten and create Party1, Party1 Identity, Party1 Relation, Party1 Nationality
  if (isRoot && Array.isArray(processedObj.Parties) && processedObj.Parties.length > 0) {
    const firstParty = processedObj.Parties[0];
    
    if (firstParty && typeof firstParty === 'object') {
      const { Identity, Relation, Nationality, ...partyRootFields } = firstParty;
      
      // Party1 section: Root fields (Name, Birth Date, Shares Count, Gross)
      if (Object.keys(partyRootFields).length > 0) {
        processedObj.Parties = partyRootFields;
      }
      
      // Add nested objects as separate sections
      if (Identity) {
        processedObj.Identity = Identity;
      }
      if (Relation) {
        processedObj.Relation = Relation;
      }
      if (Nationality) {
        processedObj.Nationality = Nationality;
      }
    }
  }
  
  let entries = Object.entries(processedObj);
  
  // Sort entries based on fieldOrder configuration
  entries.sort(([keyA], [keyB]) => {
    const normalizedA = normalizeFieldName(keyA);
    const normalizedB = normalizeFieldName(keyB);
    
    const indexA = fieldOrder.indexOf(normalizedA.toLowerCase());
    const indexB = fieldOrder.indexOf(normalizedB.toLowerCase());
    
    // If both are in fieldOrder, sort by their position
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // If only A is in fieldOrder, it comes first
    if (indexA !== -1) return -1;
    // If only B is in fieldOrder, it comes first
    if (indexB !== -1) return 1;
    // If neither is in fieldOrder, keep original order
    return 0;
  });
  
  return (
    <div className="info-container">
      {entries.map(([key, val]) => {
        const displayKey = normalizeFieldName(key);
        
        // Special-case: In Activities.ISIC.Id we should not render an extra "Id" heading
        if (key === 'ISIC' && val && typeof val === 'object') {
          return <div key={key}>{renderIsicSection(val, isArabic)}</div>;
        }
        if (isPrimitive(val)) {
          return <InfoRow key={key} label={displayKey} value={val} isArabic={isArabic} />;
        }
        if (Array.isArray(val)) {
          if (val.every(isPrimitive)) {
            return <InfoRow key={key} label={displayKey} value={val.join(', ')} isArabic={isArabic} />;
          }
          // Array of objects
          return (
            <div key={key} className="info-subsection">
              <SectionTitle title={`${displayKey}:`} isArabic={isArabic} />
              {val.map((item, idx) => (
                <div key={idx} className="info-subsection-item">{
                  isPrimitive(item)
                    ? <InfoRow label={`${displayKey} ${idx + 1}`} value={item} isArabic={isArabic} />
                    : renderObjectContent(item as Record<string, any>, isArabic, false)
                }</div>
              ))}
            </div>
          );
        }

        // Nested object
        return (
          <div key={key} className="info-subsection">
            <SectionTitle title={`${displayKey}:`} isArabic={isArabic} />
            {renderObjectContent(val as Record<string, any>, isArabic, false)}
          </div>
        );
      })}
    </div>
  );
}

const BusinessInfo: React.FC<BusinessInfoProps> = ({ applicationId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [isArabic, setIsArabic] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const language = isArabic ? "ar" : "en";
      const res = await getBusinessInfoDetails(applicationId, language);
      // API already encodes lang in endpoint in apisCrud; if not, keep using provided helper
      if(res?.data?.success) {
        const payload = (res?.data?.data ?? res?.data) as Record<string, any>;
        setData(payload || {});
      }else{    
        toast.error(res?.data?.message || 'Failed to load business info');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load business info');
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
      {renderObjectContent(data, isArabic)}
    </>
  );
};

export default BusinessInfo;


