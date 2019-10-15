import { TextStyle } from "./painter";

interface URLQuery {
  url?: string;
  p?: string;
  noshadow?: string;
}

interface Params {
  url: string;
  style: Partial<TextStyle>;
}

export const getParams = (query: Partial<URLQuery>): Params | null => {
  if (query.url != null) {
    try {
      const result = {
        url: decodeURIComponent(query.url),
        style: {}
      };
      if (query.p === 'top' || query.p === 'middle' || query.p === 'bottom') {
        result.style['position'] = query.p;
      }
      if (query.noshadow != null) {
        result.style['shadowColor'] = null;
      }
      return result;
    } catch (e) {
      return null;
    }
  }
  return null;
};