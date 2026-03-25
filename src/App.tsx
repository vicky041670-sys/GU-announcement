/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  Download, 
  Upload, 
  Type, 
  Move, 
  Maximize, 
  Minimize,
  Image as ImageIcon,
  Trash2,
  Stethoscope,
  Activity,
  Heart,
  Plus,
  Clock,
  MapPin,
  Phone,
  Calendar,
  User,
  ShieldCheck,
  Info,
  Megaphone,
  Mic,
  Bell,
  RotateCw,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Languages
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ImagePosition = 'top' | 'center' | 'bottom' | 'background';
type ImageFit = 'cover' | 'contain' | 'fill';
type PosterSize = 'a4' | 'a3' | 'square';

// Import local logos (Ensure logo3.png is uploaded to /src)
// Using a string to avoid build errors if the file is missing
const logo3 = "/src/logo3.png"; 

const LOGO_OPTIONS = [
  { 
    id: 'logo-3', 
    url: "https://picsum.photos/seed/medical-logo/400/120", 
    label: '顧家醫療 - 標誌 + 文字 (橫式)',
    baseHeight: 'h-24'
  }
];

const ICON_OPTIONS = [
  { id: 'none', icon: null, label: '無' },
  { id: 'stethoscope', icon: Stethoscope, label: '聽診器' },
  { id: 'activity', icon: Activity, label: '心電圖' },
  { id: 'heart', icon: Heart, label: '愛心' },
  { id: 'plus', icon: Plus, label: '加號' },
  { id: 'clock', icon: Clock, label: '時鐘' },
  { id: 'map-pin', icon: MapPin, label: '地圖' },
  { id: 'phone', icon: Phone, label: '電話' },
  { id: 'calendar', icon: Calendar, label: '日曆' },
  { id: 'user', icon: User, label: '使用者' },
  { id: 'shield', icon: ShieldCheck, label: '盾牌' },
  { id: 'info', icon: Info, label: '資訊' },
  { id: 'megaphone', icon: Megaphone, label: '公告' },
  { id: 'mic', icon: Mic, label: '麥克風' },
  { id: 'bell', icon: Bell, label: '通知' },
];

// Dictionary for manual translation (Non-AI)
const clinicDictionary: Record<string, string> = {
  "休診": "Clinic Closed",
  "公告": "Announcement",
  "門診": "Outpatient",
  "時間": "Hours",
  "醫師": "Doctor",
  "預約": "Appointment",
  "掛號": "Registration",
  "感冒": "Cold/Flu",
  "疫苗": "Vaccine",
  "健康檢查": "Health Checkup",
  "請在此輸入公告內容": "Please enter announcement content here",
  "顧家醫療": "Good Home Medical",
  "通知": "Notice",
  "提醒": "Reminder",
  "防疫": "Epidemic Prevention",
  "口罩": "Mask",
  "洗手": "Hand Washing",
  "距離": "Distance",
  "消毒": "Disinfection",
  "體溫": "Temperature",
  "量測": "Measurement",
  "正常": "Normal",
  "發燒": "Fever",
  "咳嗽": "Cough",
  "急診": "Emergency",
  "藥局": "Pharmacy",
  "領藥": "Pick up medicine",
  "自費": "Self-pay",
  "健保": "Health Insurance",
  "卡": "Card",
  "身分證": "ID Card",
  "健保卡": "NHI Card",
  "居留證": "ARC",
  "護照": "Passport",
  "掛號費": "Registration Fee",
  "診察費": "Consultation Fee",
  "藥費": "Medicine Fee",
  "檢驗": "Laboratory Test",
  "檢查": "Examination",
  "報告": "Report",
  "領取": "Collect",
  "星期一": "Monday",
  "星期二": "Tuesday",
  "星期三": "Wednesday",
  "星期四": "Thursday",
  "星期五": "Friday",
  "星期六": "Saturday",
  "星期日": "Sunday",
  "上午": "Morning",
  "下午": "Afternoon",
  "晚上": "Evening",
  "全天": "Full Day",
  "休息": "Rest",
  "國定假日": "National Holiday",
  "春節": "Lunar New Year",
  "端午節": "Dragon Boat Festival",
  "中秋節": "Mid-Autumn Festival",
  "元旦": "New Year's Day",
  "清明節": "Tomb Sweeping Day",
  "勞動節": "Labor Day",
  "雙十節": "Double Tenth Day",
  "颱風": "Typhoon",
  "停班": "Work Suspended",
  "停課": "Classes Suspended",
  "正常門診": "Normal Outpatient Service",
  "暫停門診": "Outpatient Service Suspended",
  "造成不便": "Sorry for the inconvenience",
  "敬請見諒": "Thank you for your understanding",
  "謝謝合作": "Thank you for your cooperation",
  "祝您健康": "Wish you good health",
  "診所": "Clinic",
  "地址": "Address",
  "電話": "Phone",
  "預約專線": "Appointment Line",
  "看診": "Consultation",
  "號碼": "Number",
  "進度": "Progress",
  "查詢": "Inquiry",
  "官網": "Official Website",
  "掃描": "Scan",
  "加入": "Join",
  "好友": "Friends",
  "追蹤": "Follow",
  "最新": "Latest",
  "資訊": "Information",
};

export default function App() {
  const [text, setText] = useState('請在此輸入公告內容');
  const [subtitle, setSubtitle] = useState('');
  const [fontSize, setFontSize] = useState(48);
  const [subtitleFontSize, setSubtitleFontSize] = useState(24);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState<ImagePosition>('center');
  const [imageSize, setImageSize] = useState(50); // percentage
  const [imageFit, setImageFit] = useState<ImageFit>('cover');
  const [posterSize, setPosterSize] = useState<PosterSize>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [selectedLogo, setSelectedLogo] = useState(LOGO_OPTIONS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
  const [iconSize, setIconSize] = useState(70);
  const [iconColor, setIconColor] = useState('#f18e2c');
  const [iconPos, setIconPos] = useState({ x: 50, y: 30 }); // percentage
  const [iconRotation, setIconRotation] = useState(0);
  const [isDraggingIcon, setIsDraggingIcon] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [subtitleTextAlign, setSubtitleTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [lineHeight, setLineHeight] = useState(1.2);
  const [subtitleLineHeight, setSubtitleLineHeight] = useState(1.5);
  const [titleColor, setTitleColor] = useState('#6d563c');
  const [subtitleColor, setSubtitleColor] = useState('#6d563c');
  const [titleWeight, setTitleWeight] = useState(700);
  const [subtitleWeight, setSubtitleWeight] = useState(400);
  const [isDownloading, setIsDownloading] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  const handleIconMouseDown = (e: React.MouseEvent) => {
    if (selectedIcon.id === 'none') return;
    e.preventDefault();
    setIsDraggingIcon(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingIcon && posterRef.current) {
        const rect = posterRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setIconPos({ 
          x: Math.max(0, Math.min(100, x)), 
          y: Math.max(0, Math.min(100, y)) 
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingIcon(false);
    };

    if (isDraggingIcon) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingIcon]);

  const handleManualTranslate = (currentText: string, setter: (val: string) => void) => {
    if (!currentText.trim()) return;
    
    let translated = currentText;
    // Sort keys by length descending to match longer phrases first
    const sortedKeys = Object.keys(clinicDictionary).sort((a, b) => b.length - a.length);
    
    sortedKeys.forEach(key => {
      const regex = new RegExp(key, 'g');
      translated = translated.replace(regex, clinicDictionary[key]);
    });
    
    setter(translated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadPoster = async (format: 'pdf' | 'png' = 'pdf') => {
    if (posterRef.current && !isDownloading) {
      setIsDownloading(true);
      try {
        // Ensure all images are loaded before capturing
        const images = posterRef.current.getElementsByTagName('img');
        const loadPromises = Array.from(images).map((img: HTMLImageElement) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        });
        
        await Promise.all(loadPromises);
        
        // Add a small delay to ensure fonts and layouts are settled
        await new Promise(resolve => setTimeout(resolve, 1000));

        const canvas = await html2canvas(posterRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: true,
          onclone: (clonedDoc) => {
            const clonedPoster = clonedDoc.querySelector('[data-poster="main"]');
            if (clonedPoster instanceof HTMLElement && posterRef.current) {
              clonedPoster.style.aspectRatio = 'auto';
              clonedPoster.style.width = `${posterRef.current.offsetWidth}px`;
              clonedPoster.style.height = `${posterRef.current.offsetHeight}px`;
              clonedPoster.style.border = '12px solid #f18e2c';
              clonedPoster.style.boxShadow = 'none';
              clonedPoster.style.transform = 'none';
              clonedPoster.style.position = 'relative';
              clonedPoster.style.left = '0';
              clonedPoster.style.top = '0';
            }
          }
        });
        
        if (format === 'png') {
          const imgData = canvas.toDataURL('image/png', 1.0);
          const link = document.createElement('a');
          link.href = imgData;
          link.download = `announcement-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          const imgData = canvas.toDataURL('image/png', 1.0);
          
          // Create PDF with proper dimensions
          const pdf = new jsPDF({
            orientation: orientation === 'portrait' ? 'p' : 'l',
            unit: 'px',
            format: [canvas.width, canvas.height],
            hotfixes: ["px_scaling"]
          });
          
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          
          // Use blob for more reliable download in some environments
          const pdfBlob = pdf.output('blob');
          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `announcement-${Date.now()}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
        
      } catch (error) {
        console.error("Download error:", error);
        alert("下載失敗，可能原因：\n1. 圖片來源限制 (CORS)\n2. 瀏覽器版本過舊\n3. 記憶體不足\n\n建議嘗試：\n1. 使用電腦版 Chrome 瀏覽器\n2. 重新整理頁面\n3. 嘗試下載圖片格式 (PNG)");
      } finally {
        setIsDownloading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] p-4 md:p-8 flex flex-col lg:flex-row gap-8 items-start justify-center">
      {/* Left Side: Controls */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-xl p-6 space-y-6 border border-brand-orange/20">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-8 bg-brand-orange rounded-full" />
          <h1 className="text-2xl font-bold text-brand-brown font-taipei">海報設定</h1>
        </div>
        
        {/* Icon Selection */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-brand-brown/70 uppercase tracking-wider">
            <Activity size={16} /> 選擇圖示 (ICON)
          </label>
          
          <div className="grid grid-cols-4 gap-2">
            {ICON_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedIcon(opt)}
                className={cn(
                  "p-2 rounded-lg border transition-all flex flex-col items-center gap-1",
                  selectedIcon.id === opt.id 
                    ? "border-brand-orange bg-brand-orange/5 text-brand-orange" 
                    : "border-brand-brown/10 text-brand-brown/40 hover:border-brand-orange"
                )}
              >
                {opt.icon ? <opt.icon size={18} /> : <span className="text-[10px]">無</span>}
                <span className="text-[8px] font-bold">{opt.label}</span>
              </button>
            ))}
          </div>

          {selectedIcon.id !== 'none' && (
            <div className="p-3 bg-brand-orange/5 rounded-lg border border-brand-orange/20">
              <p className="text-[10px] font-bold text-brand-orange flex items-center gap-1">
                <Move size={12} /> 提示：您可以直接在預覽圖中拖拉圖示位置
              </p>
            </div>
          )}
        </div>

        {/* Poster Size & Orientation */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-brown/70 uppercase tracking-wider">
              <Maximize size={16} /> 海報尺寸
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['a4', 'a3', 'square'] as PosterSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setPosterSize(size)}
                  className={cn(
                    "py-2 px-3 rounded-lg text-xs font-bold border transition-all uppercase",
                    posterSize === size 
                      ? "bg-brand-orange border-brand-orange text-white" 
                      : "border-brand-brown/10 text-brand-brown/60 hover:border-brand-orange"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-brown/70 uppercase tracking-wider">
              <RotateCw size={16} /> 海報方向
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'portrait', label: '直式' },
                { id: 'landscape', label: '橫式' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setOrientation(opt.id as 'portrait' | 'landscape')}
                  className={cn(
                    "py-2 px-3 rounded-lg text-xs font-bold border transition-all",
                    orientation === opt.id 
                      ? "bg-brand-orange border-brand-orange text-white" 
                      : "border-brand-brown/10 text-brand-brown/60 hover:border-brand-orange"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-6">
          {/* Main Title Section */}
          <div className="space-y-3 p-4 bg-brand-brown/5 rounded-2xl border border-brand-brown/10">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-bold text-brand-brown uppercase tracking-wider">
                <Type size={16} /> 主標題設定
              </label>
              <button 
                onClick={() => handleManualTranslate(text, setText)}
                className="text-[10px] font-bold px-2 py-1 bg-brand-orange/10 text-brand-orange rounded hover:bg-brand-orange hover:text-white transition-colors flex items-center gap-1"
                title="使用內建字典翻譯為英文"
              >
                <Languages size={12} /> 中翻英
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-24 p-3 border-2 border-brand-brown/10 rounded-xl focus:border-brand-orange focus:ring-0 transition-colors resize-none font-taipei text-sm bg-white"
              placeholder="輸入主標題內容..."
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-brand-brown/40 uppercase">
                  <span>字體大小</span>
                  <span>{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="120"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-brand-orange h-1.5"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-brand-brown/40 uppercase">
                  <span>文字對齊</span>
                </div>
                <div className="flex gap-2">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => setTextAlign(align)}
                      className={cn(
                        "flex-1 p-1.5 rounded border transition-all flex items-center justify-center",
                        textAlign === align ? "bg-brand-orange border-brand-orange text-white" : "border-brand-brown/10 text-brand-brown/40"
                      )}
                    >
                      {align === 'left' ? <AlignLeft size={14} /> : align === 'right' ? <AlignRight size={14} /> : <AlignCenter size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-brand-brown/40 uppercase">
                  <span>行高</span>
                  <span>{lineHeight.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="3.0"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                  className="w-full accent-brand-orange h-1.5"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-brand-brown/40 uppercase">
                  <span>粗細</span>
                  <span>{titleWeight}</span>
                </div>
                <select 
                  value={titleWeight}
                  onChange={(e) => setTitleWeight(parseInt(e.target.value))}
                  className="w-full text-[10px] font-bold p-1 border border-brand-brown/10 rounded bg-white"
                >
                  <option value="300">細 (Light)</option>
                  <option value="400">一般 (Normal)</option>
                  <option value="500">中等 (Medium)</option>
                  <option value="600">半粗 (Semi-Bold)</option>
                  <option value="700">粗 (Bold)</option>
                  <option value="900">極粗 (Black)</option>
                </select>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-brand-brown/40 uppercase">
                  <span>顏色</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={titleColor}
                    onChange={(e) => setTitleColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent"
                  />
                  <div className="flex gap-1">
                    {['#6d563c', '#f18e2c'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setTitleColor(c)}
                        className={cn(
                          "w-4 h-4 rounded-full border",
                          titleColor === c ? "border-brand-orange" : "border-transparent"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtitle Section */}
          <div className="space-y-3 p-4 bg-brand-brown/5 rounded-2xl border border-brand-brown/10">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-bold text-brand-brown/60 uppercase tracking-wider">
                <Type size={16} className="opacity-50" /> 副標題設定
              </label>
              <button 
                onClick={() => handleManualTranslate(subtitle, setSubtitle)}
                className="text-[10px] font-bold px-2 py-1 bg-brand-orange/10 text-brand-orange rounded hover:bg-brand-orange hover:text-white transition-colors flex items-center gap-1"
                title="使用內建字典翻譯為英文"
              >
                <Languages size={12} /> 中翻英
              </button>
            </div>
            <textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full h-20 p-3 border-2 border-brand-brown/10 rounded-xl focus:border-brand-orange focus:ring-0 transition-colors resize-none font-taipei text-sm bg-white"
              placeholder="輸入副標題內容..."
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-brand-brown/40 uppercase">
                  <span>字體大小</span>
                  <span>{subtitleFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={subtitleFontSize}
                  onChange={(e) => setSubtitleFontSize(parseInt(e.target.value))}
                  className="w-full accent-brand-orange h-1.5"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-brand-brown/40 uppercase">
                  <span>文字對齊</span>
                </div>
                <div className="flex gap-2">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => setSubtitleTextAlign(align)}
                      className={cn(
                        "flex-1 p-1.5 rounded border transition-all flex items-center justify-center",
                        subtitleTextAlign === align ? "bg-brand-orange border-brand-orange text-white" : "border-brand-brown/10 text-brand-brown/40"
                      )}
                    >
                      {align === 'left' ? <AlignLeft size={14} /> : align === 'right' ? <AlignRight size={14} /> : <AlignCenter size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-brand-brown/40 uppercase">
                  <span>顏色</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={subtitleColor}
                    onChange={(e) => setSubtitleColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent"
                  />
                  <div className="flex gap-1">
                    {['#6d563c', '#f18e2c'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setSubtitleColor(c)}
                        className={cn(
                          "w-4 h-4 rounded-full border",
                          subtitleColor === c ? "border-brand-orange" : "border-transparent"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-brand-brown/40 uppercase">
                  <span>粗細</span>
                  <span>{subtitleWeight}</span>
                </div>
                <select 
                  value={subtitleWeight}
                  onChange={(e) => setSubtitleWeight(parseInt(e.target.value))}
                  className="w-full text-[10px] font-bold p-1 border border-brand-brown/10 rounded bg-white"
                >
                  <option value="300">細 (Light)</option>
                  <option value="400">一般 (Normal)</option>
                  <option value="500">中等 (Medium)</option>
                  <option value="600">半粗 (Semi-Bold)</option>
                  <option value="700">粗 (Bold)</option>
                  <option value="900">極粗 (Black)</option>
                </select>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-brand-brown/40 uppercase">
                  <span>行高</span>
                  <span>{subtitleLineHeight.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="3.0"
                  step="0.1"
                  value={subtitleLineHeight}
                  onChange={(e) => setSubtitleLineHeight(parseFloat(e.target.value))}
                  className="w-full accent-brand-orange h-1.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-brand-brown/70 uppercase tracking-wider">
            <ImageIcon size={16} /> 上傳圖片
          </label>
          <div className="flex flex-col gap-3">
            <label className="cursor-pointer flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-brand-brown/20 hover:border-brand-orange rounded-xl transition-colors text-brand-brown/60 hover:text-brand-orange">
              <Upload size={20} />
              <span className="font-medium">選擇檔案</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            
            {uploadedImage && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-brown/50">圖片位置</span>
                  <button onClick={() => setUploadedImage(null)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(['top', 'center', 'bottom', 'background'] as ImagePosition[]).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setImagePosition(pos)}
                      className={cn(
                        "py-1.5 px-2 rounded-lg text-xs font-bold border transition-all capitalize",
                        imagePosition === pos 
                          ? "bg-brand-orange border-brand-orange text-white" 
                          : "border-brand-brown/10 text-brand-brown/60 hover:border-brand-orange"
                      )}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-brand-brown/50 uppercase">
                    <span>圖片大小</span>
                    <span>{imageSize}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={imageSize}
                    onChange={(e) => setImageSize(parseInt(e.target.value))}
                    className="w-full accent-brand-orange"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-brand-brown/50 uppercase tracking-wider">圖片縮放模式</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['cover', 'contain', 'fill'] as ImageFit[]).map((fit) => (
                      <button
                        key={fit}
                        onClick={() => setImageFit(fit)}
                        className={cn(
                          "py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all uppercase",
                          imageFit === fit 
                            ? "bg-brand-orange border-brand-orange text-white" 
                            : "border-brand-brown/10 text-brand-brown/60 hover:border-brand-orange"
                        )}
                      >
                        {fit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Download Button */}
        <div className="flex flex-col gap-2 pt-4">
          <button
            onClick={() => downloadPoster('pdf')}
            disabled={isDownloading}
            className={cn(
              "w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95",
              isDownloading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-brand-orange hover:bg-[#d97a1e] text-white shadow-brand-orange/20"
            )}
          >
            {isDownloading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                處理中...
              </>
            ) : (
              <>
                <Download size={20} /> 下載海報 (PDF)
              </>
            )}
          </button>
          
          <button
            onClick={() => downloadPoster('png')}
            disabled={isDownloading}
            className={cn(
              "w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border-2",
              isDownloading 
                ? "border-gray-200 text-gray-400 cursor-not-allowed" 
                : "border-brand-orange/20 text-brand-orange hover:bg-brand-orange/5"
            )}
          >
            <ImageIcon size={18} /> 下載為圖片 (PNG)
          </button>
        </div>
      </div>

      {/* Right Side: Poster Preview */}
      <div className="flex-1 flex flex-col items-center sticky top-8">
        <div className="mb-4 text-sm font-bold text-brand-brown/40 uppercase tracking-[0.2em]">預覽視窗</div>
        
        {/* The Poster */}
        <div 
          ref={posterRef}
          data-poster="main"
          className={cn(
            "relative bg-white shadow-2xl overflow-hidden flex flex-col transition-all",
            posterSize === 'a4' ? (orientation === 'portrait' ? "w-[500px] aspect-[1/1.414]" : "w-[700px] aspect-[1.414/1]") : 
            posterSize === 'a3' ? (orientation === 'portrait' ? "w-[600px] aspect-[1/1.414]" : "w-[848px] aspect-[1.414/1]") : 
            "w-[500px] aspect-square",
            "border-[12px] border-brand-orange"
          )}
          style={{ 
            backgroundColor: '#ffffff'
          }}
        >
          {/* Background Image Layer */}
          {uploadedImage && imagePosition === 'background' && (
            <div className="absolute inset-0 z-0 opacity-30">
              <img 
                src={uploadedImage} 
                alt="" 
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className={cn(
                  "w-full h-full",
                  imageFit === 'cover' ? "object-cover" : imageFit === 'contain' ? "object-contain" : "object-fill"
                )} 
              />
            </div>
          )}

          {/* Header: Logo */}
          <div className="z-10 p-8 flex justify-center min-h-[120px] items-center">
            <img 
              src={selectedLogo.url} 
              alt="顧家醫療 Logo" 
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              style={{ 
                height: 'auto',
                maxHeight: '200px'
              }}
              className={cn(
                "object-contain", 
                selectedLogo.baseHeight
              )}
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                const baseH = parseInt(selectedLogo.baseHeight.split('-')[1]) * 4; // tailwind h-24 = 96px
                img.style.height = `${baseH * (70 / 100)}px`;
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://picsum.photos/seed/medical/200/80";
              }}
            />
          </div>

          {/* Floating Icon Layer */}
          {selectedIcon.id !== 'none' && selectedIcon.icon && (
            <div 
              className={cn(
                "absolute z-30 cursor-move transition-shadow",
                isDraggingIcon && "shadow-2xl scale-110"
              )}
              style={{ 
                left: `${iconPos.x}%`, 
                top: `${iconPos.y}%`,
                transform: `rotate(${iconRotation}deg)`,
                marginLeft: `-${iconSize / 2}px`,
                marginTop: `-${iconSize / 2}px`
              }}
              onMouseDown={handleIconMouseDown}
            >
              <selectedIcon.icon 
                size={iconSize} 
                color={iconColor} 
                strokeWidth={2.5}
              />
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 flex flex-col p-10 z-10 relative">
            
            {/* Top Image */}
            {uploadedImage && imagePosition === 'top' && (
              <div className="flex justify-center mb-6">
                <img 
                  src={uploadedImage} 
                  alt="" 
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  style={{ width: `${imageSize}%` }}
                  className={cn(
                    "rounded-lg shadow-sm",
                    imageFit === 'cover' ? "object-cover" : imageFit === 'contain' ? "object-contain" : "object-fill"
                  )} 
                />
              </div>
            )}

            {/* Main Text */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {uploadedImage && imagePosition === 'center' && (
                <div className="mb-6">
                  <img 
                    src={uploadedImage} 
                    alt="" 
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    style={{ width: `${imageSize}%` }}
                    className={cn(
                      "mx-auto rounded-lg shadow-sm",
                      imageFit === 'cover' ? "object-cover" : imageFit === 'contain' ? "object-contain" : "object-fill"
                    )} 
                  />
                </div>
              )}
              
              <div className="w-full space-y-4">
                <p 
                  className={cn(
                    "font-taipei whitespace-pre-wrap break-words w-full",
                    textAlign === 'left' ? "text-left" : textAlign === 'right' ? "text-right" : "text-center"
                  )}
                  style={{ 
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight,
                    color: titleColor,
                    fontWeight: titleWeight
                  }}
                >
                  {text}
                </p>
                
                {subtitle && (
                  <p 
                    className={cn(
                      "font-taipei whitespace-pre-wrap break-words w-full",
                      subtitleTextAlign === 'left' ? "text-left" : subtitleTextAlign === 'right' ? "text-right" : "text-center"
                    )}
                    style={{ 
                      fontSize: `${subtitleFontSize}px`,
                      lineHeight: subtitleLineHeight,
                      color: subtitleColor,
                      fontWeight: subtitleWeight
                    }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>

              {uploadedImage && imagePosition === 'bottom' && (
                <div className="mt-6">
                  <img 
                    src={uploadedImage} 
                    alt="" 
                    style={{ width: `${imageSize}%` }}
                    className={cn(
                      "mx-auto rounded-lg shadow-sm",
                      imageFit === 'cover' ? "object-cover" : imageFit === 'contain' ? "object-contain" : "object-fill"
                    )} 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer Decoration */}
          <div className="h-4 bg-brand-orange w-full mt-auto" />
        </div>

        <p className="mt-6 text-xs text-brand-brown/50 font-medium max-w-md text-center">
          提示：海報比例為 A4 標準尺寸。建議輸入簡短有力的文字以獲得最佳視覺效果。
        </p>
      </div>
    </div>
  );
}
