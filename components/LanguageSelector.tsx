'use client';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Globe, ChevronDown, Sparkles, Check } from 'lucide-react';

export type SupportedLanguage = 'auto' | 'en' | 'ar';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  flag: string;
  description: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'auto',
    name: 'Auto-detect',
    flag: '🌍',
    description: 'AI-powered smart detection'
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    description: 'Global standard'
  },
  {
    code: 'ar',
    name: 'العربية',
    flag: '🇸🇦',
    description: 'Arabic language'
  }
];

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  className?: string;
  variant?: 'default' | 'compact';
}

export function LanguageSelector({ 
  selectedLanguage, 
  onLanguageChange, 
  className = '',
  variant = 'default'
}: LanguageSelectorProps) {
  const selectedOption = LANGUAGE_OPTIONS.find(lang => lang.code === selectedLanguage) || LANGUAGE_OPTIONS[0];

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`border-gray-600 text-white hover:bg-gray-800 ${className}`}
          >
            <span className="mr-1">{selectedOption.flag}</span>
            <span className="hidden sm:inline">{selectedOption.name}</span>
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-800 border-gray-600">
          {LANGUAGE_OPTIONS.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className="text-white hover:bg-gray-700 cursor-pointer"
            >
              <span className="mr-2">{lang.flag}</span>
              <span>{lang.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`flex items-center gap-2 bg-gray-900 border-gray-700 text-white hover:bg-gray-800 ${className}`}
        >
          <Globe className="h-4 w-4" />
          <span>{selectedOption.flag}</span>
          <span>{selectedOption.name}</span>
          <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-900 border-gray-700 min-w-[200px]">
        {LANGUAGE_OPTIONS.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className="flex items-center gap-3 px-3 py-2.5 text-white hover:bg-gray-800 cursor-pointer focus:bg-gray-800"
          >
            <span className="text-xl">{lang.flag}</span>
            <div className="flex-1">
              <div className="font-medium">{lang.name}</div>
              <div className="text-xs text-gray-400">{lang.description}</div>
            </div>
            {selectedLanguage === lang.code && (
              <Check className="h-4 w-4 text-purple-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { LANGUAGE_OPTIONS };