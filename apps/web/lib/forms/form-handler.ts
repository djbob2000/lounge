import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';

export interface FormErrors {
  [key: string]: string;
}

export interface FormState<T> {
  data: T;
  errors: FormErrors;
  isLoading: boolean;
}

export interface FormConfig<T> {
  initialData: T;
  apiEndpoint: string;
  successRedirect?: string;
  itemId?: string;
  processErrorResponse?: (errorData: { message?: string | string[] }) => FormErrors;
}

export function useFormHandler<T extends Record<string, unknown>>(config: FormConfig<T>) {
  const router = useRouter();
  const { getToken } = useAuth();
  const id = useId();

  const [formData, setFormData] = useState<T>(config.initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const processErrorResponse =
    config.processErrorResponse ||
    ((errorData: { message?: string | string[] }) => {
      if (errorData.message && Array.isArray(errorData.message)) {
        const fieldErrors: FormErrors = {};
        errorData.message.forEach((msg: string) => {
          const field = detectFieldFromMessage(msg);
          if (field !== 'general') {
            fieldErrors[field] = msg;
          }
        });
        return fieldErrors;
      } else {
        return {
          general: errorData.message || 'Помилка збереження',
        };
      }
    });

  const detectFieldFromMessage = (msg: string): string => {
    const lower = msg.toLowerCase();
    const mapping: Array<{ match: string | RegExp; field: string }> = [
      { match: 'назва', field: 'name' },
      { match: 'name', field: 'name' },
      { match: 'slug', field: 'slug' },
      { match: 'category', field: 'categoryId' },
      { match: 'категор', field: 'categoryId' },
      { match: 'description', field: 'description' },
      { match: 'опис', field: 'description' },
      { match: 'showinmenu', field: 'showInMenu' },
      { match: 'показувати в меню', field: 'showInMenu' },
      { match: 'ishidden', field: 'isHidden' },
      { match: 'приховати', field: 'isHidden' },
    ];
    for (const { match, field } of mapping) {
      if (typeof match === 'string' ? lower.includes(match) : match.test(lower)) {
        return field;
      }
    }
    return 'general';
  };

  const submitData = async () => {
    const token = await getToken();
    if (!token) {
      setErrors({ general: 'Authentication token not found' });
      return false;
    }

    const url = config.itemId
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${config.apiEndpoint}/${config.itemId}`
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${config.apiEndpoint}`;

    const method = config.itemId ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Помилка збереження' }));
      const fieldErrors = processErrorResponse(errorData);
      setErrors(fieldErrors);
      return false;
    }

    if (config.successRedirect) {
      router.push(config.successRedirect);
      router.refresh();
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await submitData();
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ general: 'Помилка збереження' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return {
    formData,
    errors,
    isLoading,
    id,
    handleSubmit,
    handleInputChange,
    setFormData,
    setErrors,
  };
}
