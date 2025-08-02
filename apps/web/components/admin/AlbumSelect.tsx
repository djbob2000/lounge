'use client';

import { Album } from '@lounge/types';
import SelectCombobox, { SelectOption } from '../ui/select-combobox';

interface AlbumSelectProps {
  albums: Album[];
  value: string;
  onChange: (albumId: string) => void;
  error?: string;
  placeholder?: string;
}

export default function AlbumSelect({
  albums,
  value,
  onChange,
  error,
  placeholder = 'Оберіть альбом',
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
    />
  );
}
