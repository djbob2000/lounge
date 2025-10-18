'use client';

import type { Album } from '@lounge/types';
import SelectCombobox, { type SelectOption } from '../ui/select-combobox';

interface AlbumSelectProps {
  albums: Album[];
  value: string;
  onChange: (albumId: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function AlbumSelect({
  albums,
  value,
  onChange,
  error,
  placeholder = 'Оберіть альбом',
  disabled = false,
}: AlbumSelectProps) {
  const options: SelectOption[] = albums.map((album) => ({
    value: album.id,
    label: album.name,
  }));

  return (
    <SelectCombobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Пошук альбомів..."
      emptyMessage="Альбоми не знайдено"
      error={error}
      disabled={disabled}
    />
  );
}
