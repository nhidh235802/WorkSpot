interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
  };
  namedetails?: {
    name?: string;
    brand?: string;
  };
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const getRequestedHouseNumber = (address: string) =>
  address.trim().match(/^(\d+[a-zA-Z]?(?:[/-]\d+[a-zA-Z]?)?)/)?.[1];

const getRequestedStreet = (address: string) => {
  const firstPart = address.split(',')[0]?.trim() ?? '';
  return firstPart
    .replace(/^(\d+[a-zA-Z]?(?:[/-]\d+[a-zA-Z]?)?)\s+/, '')
    .trim();
};

const looselyMatches = (left: string, right: string) => {
  const normalizedLeft = normalize(left);
  const normalizedRight = normalize(right);
  return normalizedLeft.includes(normalizedRight) ||
    normalizedRight.includes(normalizedLeft);
};

const normalizeKnownPlaceName = (placeName: string) => {
  const normalizedName = normalize(placeName);

  // OSM stores the official brand name with a trailing "s".
  if (normalizedName === 'highland coffee') {
    return 'Highlands Coffee';
  }

  return placeName;
};

const getSearchPlaceName = (placeName: string, street: string) => {
  const separators = /\s*[-–—|]\s*/;
  const parts = placeName.split(separators).map((part) => part.trim()).filter(Boolean);
  const withoutStreetSuffix = parts.filter((part) => !looselyMatches(part, street));
  return normalizeKnownPlaceName(
    withoutStreetSuffix.join(' - ') || placeName.trim(),
  );
};

export async function getCoordinatesFromAddress(
  address: string,
  placeName?: string,
): Promise<GeocodeResult | null> {
  const requestedStreet = getRequestedStreet(address);
  const searchPlaceName = placeName && requestedStreet
    ? getSearchPlaceName(placeName, requestedStreet)
    : placeName?.trim();
  const queries = [
    searchPlaceName && requestedStreet
      ? `${searchPlaceName}, ${requestedStreet}, Hà Nội, Việt Nam`
      : null,
    searchPlaceName ? `${searchPlaceName}, ${address}, Việt Nam` : null,
    `${address}, Việt Nam`,
  ].filter((query): query is string => Boolean(query));

  const requestedHouseNumber = getRequestedHouseNumber(address);

  try {
    for (const query of queries) {
      const params = new URLSearchParams({
        format: 'jsonv2',
        limit: '5',
        addressdetails: '1',
        namedetails: '1',
        countrycodes: 'vn',
        'accept-language': 'vi',
        q: query,
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        { headers: { 'Accept-Language': 'vi' } },
      );

      if (!response.ok) continue;

      const results = await response.json() as NominatimResult[];
      const match = requestedHouseNumber
        ? results.find((result) => {
            const returnedHouseNumber = result.address?.house_number;
            if (returnedHouseNumber) {
              return normalize(returnedHouseNumber) === normalize(requestedHouseNumber);
            }

            if (!searchPlaceName || !requestedStreet) return false;

            const returnedName =
              result.namedetails?.name ??
              result.namedetails?.brand ??
              result.display_name.split(',')[0] ??
              '';
            const returnedStreet =
              result.address?.road ??
              result.display_name;

            return looselyMatches(returnedName, searchPlaceName) &&
              looselyMatches(returnedStreet, requestedStreet);
          })
        : results[0];

      if (match) {
        return {
          lat: Number.parseFloat(match.lat),
          lng: Number.parseFloat(match.lon),
          displayName: match.display_name,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Geocode error:', error);
    return null;
  }
}
