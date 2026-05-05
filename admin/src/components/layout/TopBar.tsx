import React from "react";

interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function TopBar({ title, subtitle, action }: Props) {
  return (
    <div style={s.bar}>
      <div>
        <h1 style={s.title}>{title}</h1>
        {subtitle && <p style={s.sub}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  bar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: "1px solid #eef1f6",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0f1117",
    letterSpacing: -0.4,
  },
  sub: {
    fontSize: 13,
    color: "#5a6070",
    marginTop: 3,
  },
};
