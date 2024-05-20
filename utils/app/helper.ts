export const toNormalizedUrl = (url: string, useInsecureSchema?: boolean) => {
    // Add schema, remove trailing slashes and query params.
    // Check if the URL already contains a schema
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // If not, add "https://" or "http://" to the beginning of the URL
      url = (useInsecureSchema ? 'http://' : 'https://') + url;
    }
  
    try {
      const parsedUrl = new URL(url);
      return `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.pathname}`.replace(
        /\/+$/,
        '',
      );
    } catch {
      // Do nothing, just return the URL as is.
      return url;
    }
};

export const toNormalizedOrigin = (
    url: string,
    useInsecureSchema?: boolean,
  ) => {
    if (/^https?:\/\/[a-zA-Z]+/.test(url)) {
      return `${getSchema(url)}://${getUrlHostname(url)}`;
    }
    return `http${useInsecureSchema ? '' : 's'}://${getUrlHostname(url)}`;
};

export const getSchema = (hostname: string) => {
    return hostname.split('://')[0];
};
export const getUrlHostname = (url: string) => {
    return removeSchema(url).split('/')[0];
};
export const removeSchema = (origin: string) => {
    return origin.replace(/(^\w+:|^)\/\//, '');
};
