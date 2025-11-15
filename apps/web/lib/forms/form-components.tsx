import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  isLoading: boolean;
  onCancel: () => void;
  submitText?: string;
  cancelText?: string;
  loadingText?: string;
}

export function FormActions({
  isLoading,
  onCancel,
  submitText = 'Зберегти',
  cancelText = 'Скасувати',
  loadingText = 'Збереження...',
}: FormActionsProps) {
  return (
    <div className="flex items-center justify-between pt-4">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
        {cancelText}
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? loadingText : submitText}
      </Button>
    </div>
  );
}

interface FormErrorProps {
  error: string;
}

export function FormError({ error }: FormErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  description?: string;
  className?: string;
}

export function FormField({
  id,
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  type = 'text',
  required = false,
  description,
  className = '',
}: FormFieldProps) {
  const inputClassName = `w-full px-3 py-2 border rounded-md shadow-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background ${
    error ? 'border-destructive' : 'border-border'
  } ${className}`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-2">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={inputClassName}
        placeholder={placeholder}
        required={required}
      />
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

export function FormTextarea({
  id,
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  description,
  rows = 3,
  className = '',
}: Omit<FormFieldProps, 'type'> & { rows?: number }) {
  const textareaClassName = `w-full px-3 py-2 border rounded-md shadow-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background ${
    error ? 'border-destructive' : 'border-border'
  } ${className}`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-2">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={textareaClassName}
        placeholder={placeholder}
        required={required}
        rows={rows}
      />
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

interface FormCheckboxProps {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  description?: string;
}

export function FormCheckbox({
  id,
  name,
  label,
  checked,
  onChange,
  error,
  description,
}: FormCheckboxProps) {
  return (
    <div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
        />
        <label htmlFor={id} className="ml-2 block text-sm text-foreground">
          {label}
        </label>
      </div>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
