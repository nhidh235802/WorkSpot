export async function getCoordinatesFromAddress(keyword: string) {
  try {
    const searchString = `${keyword}, Hà Nội, Việt Nam`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchString)}&accept-language=ja,vi,en`;

    const res = await fetch(url, {
      headers: { "User-Agent": "WorkSpot-University-Project" },
    });

    const data = await res.json();
    if (data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error("Geocode error:", error);
    return null;
  }
}