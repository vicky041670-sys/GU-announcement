/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import html2canvas from 'html2canvas';
import { 
  Download, 
  Languages, 
  Upload, 
  Type, 
  Move, 
  Maximize, 
  Minimize,
  Layout,
  Image as ImageIcon,
  Loader2,
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
  AlignRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type ImagePosition = 'top' | 'center' | 'bottom' | 'background';
type ImageFit = 'cover' | 'contain' | 'fill';
type LayoutStyle = 'standard' | 'modern' | 'minimalist';
type PosterSize = 'a4' | 'a3' | 'square';

// Import local logos (Ensure logo3.png is uploaded to /src)
const logo3 = "https://picsum.photos/seed/medical/200/80"; 

const LOGO_OPTIONS = [
  { 
    id: 'logo-3', 
    url: logo3, 
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

export default function App() {
  const [text, setText] = useState('請在此輸入公告內容');
  const [subtitle, setSubtitle] = useState('');
  const [fontSize, setFontSize] = useState(48);
  const [subtitleFontSize, setSubtitleFontSize] = useState(24);
  const [isTranslating, setIsTranslating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState<ImagePosition>('center');
  const [imageSize, setImageSize] = useState(50); // percentage
  const [imageFit, setImageFit] = useState<ImageFit>('cover');
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>('standard');
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

  const handleTranslate = async (targetLang: string) => {
    if (!text.trim() && !subtitle.trim()) return;
    setIsTranslating(true);
    try {
      const prompt = `Translate the following announcement parts to ${targetLang}. Keep the tone professional and suitable for a medical clinic poster. 
      Return the result as a JSON object with keys "title" and "subtitle".
      Title: "${text}"
      Subtitle: "${subtitle}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      if (response.text) {
        const result = JSON.parse(response.text);
        if (result.title) setText(result.title.trim());
        if (result.subtitle) setSubtitle(result.subtitle.trim());
      }
    } catch (error) {
      console.error("Translation error:", error);
      alert("翻譯失敗，請稍後再試。");
    } finally {
      setIsTranslating(false);
    }
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

  const downloadPoster = async () => {
    if (posterRef.current) {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `announcement-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
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
            <label className="flex items-center gap-2 text-sm font-bold text-brand-brown uppercase tracking-wider">
              <Type size={16} /> 主標題設定
            </label>
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
            <label className="flex items-center gap-2 text-sm font-bold text-brand-brown/60 uppercase tracking-wider">
              <Type size={16} className="opacity-50" /> 副標題設定
            </label>
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

        {/* Translation */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-brand-brown/70 uppercase tracking-wider">
            <Languages size={16} /> 多國語言轉換
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '英文', lang: 'English' },
              { label: '日文', lang: 'Japanese' },
              { label: '韓文', lang: 'Korean' },
              { label: '繁中', lang: 'Traditional Chinese' }
            ].map((item) => (
              <button
                key={item.lang}
                onClick={() => handleTranslate(item.lang)}
                disabled={isTranslating}
                className="py-2 px-3 bg-brand-brown/5 hover:bg-brand-orange hover:text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isTranslating ? <Loader2 size={14} className="animate-spin" /> : item.label}
              </button>
            ))}
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
        <button
          onClick={downloadPoster}
          className="w-full py-4 bg-brand-orange hover:bg-[#d97a1e] text-white rounded-xl font-bold shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <Download size={20} /> 下載海報 (PNG)
        </button>
      </div>

      {/* Right Side: Poster Preview */}
      <div className="flex-1 flex flex-col items-center sticky top-8">
        <div className="mb-4 text-sm font-bold text-brand-brown/40 uppercase tracking-[0.2em]">預覽視窗</div>
        
        {/* The Poster */}
        <div 
          ref={posterRef}
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
                transform: `translate(-50%, -50%) rotate(${iconRotation}deg)`,
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
          {layoutStyle !== 'minimalist' && (
            <div className="h-4 bg-brand-orange w-full mt-auto" />
          )}
        </div>

        <p className="mt-6 text-xs text-brand-brown/50 font-medium max-w-md text-center">
          提示：海報比例為 A4 標準尺寸。建議輸入簡短有力的文字以獲得最佳視覺效果。
        </p>
      </div>
    </div>
  );
}
