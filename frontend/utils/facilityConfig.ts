// Map từ FacilityType (backend enum) → label + icon hiển thị trên UI
export const facilityConfig: Record<string, { label: string; description: string; icon: string }> = {
  wifi:           { label: "Wi-Fi完備",         description: "店内でWi-Fiを利用できます",                    icon: "wifi" },
  socket:         { label: "電源コンセントあり", description: "作業に使える電源コンセントがあります",           icon: "zap" },
  cleanliness:    { label: "清潔な空間",        description: "清掃が行き届いた快適な空間を維持しています",      icon: "sparkles" },
  snack:          { label: "軽食あり",          description: "作業の合間に楽しめる軽食メニューがあります",      icon: "coffee" },
  workspace:      { label: "作業スペース",      description: "仕事や勉強に利用できるスペースがあります",        icon: "volume-x" },
  desk:           { label: "作業用デスク",      description: "パソコン作業に使いやすいデスクがあります",        icon: "monitor" },
  smoking_rule:   { label: "禁煙",              description: "全エリア禁煙でクリーンな環境を維持",          icon: "cigarette-off" },
  flexible_hours: { label: "営業時間が柔軟",    description: "幅広い時間帯に利用しやすい営業時間です",          icon: "clock" },
};
