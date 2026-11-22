import { X, type LucideIcon } from 'lucide-react';
import { Icon } from './Icon';
import styles from './TextField.module.css';

export type TextFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  icon?: LucideIcon;
  type?: 'text' | 'search';
  onChange: (value: string) => void;
};

export function TextField({
  label,
  value,
  placeholder,
  icon,
  type = 'text',
  onChange,
}: TextFieldProps) {
  return (
    <label className={styles.field}>
      {icon && <Icon icon={icon} />}
      <input
        type={type}
        aria-label={label}
        className={styles.input}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear"
          className={styles.clear}
          onClick={() => onChange('')}
        >
          <Icon icon={X} size="sm" />
        </button>
      )}
    </label>
  );
}
