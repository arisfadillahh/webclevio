import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export default function AdminPageHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <header className="production-admin-page-header">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="production-admin-page-actions">{actions}</div> : null}
    </header>
  );
}
