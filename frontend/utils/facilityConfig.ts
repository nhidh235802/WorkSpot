// Map từ FacilityType (backend enum) → label + icon hiển thị trên UI
export const facilityConfig: Record<string, { label: string; description: string; icon: string }> = {
  wifi:           { label: "100Mbps光回線",    description: "高速で安定した無料WiFiを提供しています",        icon: "wifi" },
  socket:         { label: "コンセント完備",    description: "全座席に電源コンセントを備えています",          icon: "zap" },
  cleanliness:    { label: "空調完備",          description: "一年中快適な温度で作業に集中できます",          icon: "wind" },
  snack:          { label: "自家焙煎コーヒー",  description: "こだわりの豆を使用した本格派コーヒー",         icon: "coffee" },
  workspace:      { label: "静かな空間",        description: "BGMを抑え、会話も控えていただくエリアです",   icon: "volume-x" },
  desk:           { label: "オフィスチェア",    description: "長時間の作業でも疲れにくい椅子をご用意",       icon: "monitor" },
  smoking_rule:   { label: "禁煙",              description: "全エリア禁煙でクリーンな環境を維持",          icon: "slash" },
  flexible_hours: { label: "営業時間柔軟",      description: "早朝から深夜まで営業しています",              icon: "clock" },
};